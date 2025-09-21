'use client';

import React, { useState, useTransition } from 'react';
import { MessageCircle, Reply, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/recipes/ui/button';
import { Card } from '@/components/recipes/ui/card';
import { CommentForm } from './comment-form';
import { cn } from '@/lib/utils';
import { updateCommentAction, deleteCommentAction } from '@/app/actions/social';
import { Comment as CommentType } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface CommentProps {
  comment: CommentType;
  recipeId: string;
  onCommentUpdated?: () => void;
  onCommentDeleted?: () => void;
  className?: string;
}

export function Comment({
  comment,
  recipeId,
  onCommentUpdated,
  onCommentDeleted,
  className
}: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Get current user to determine if they can edit/delete this comment
  React.useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user?.id || null);
    };
    getUser();
  }, []);

  const isOwner = currentUser === comment.userId;
  const canModify = isOwner;

  const handleEdit = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCommentAction(comment.id);
      
      if (result.success) {
        onCommentDeleted?.();
      } else {
        console.error('Failed to delete comment:', result.error);
      }
    });
  };

  const handleReply = () => {
    setIsReplying(true);
    setShowActions(false);
  };

  const handleCommentUpdated = () => {
    setIsEditing(false);
    onCommentUpdated?.();
  };

  const handleCommentAdded = () => {
    setIsReplying(false);
    onCommentUpdated?.();
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return d.toLocaleDateString();
    }
  };

  return (
    <Card className={cn("p-4 space-y-3", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {comment.author?.fullName?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm">
              {comment.author?.fullName || 'Unknown User'}
            </p>
            <p className="text-xs text-gray-500">
              @{comment.author?.username || 'unknown'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">
            {formatDate(comment.createdAt)}
          </span>
          {canModify && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="h-6 w-6 p-0"
              >
                <MoreVertical size={14} />
              </Button>
              {showActions && (
                <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg z-10 min-w-[120px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="w-full justify-start text-xs"
                  >
                    <Edit2 size={12} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="w-full justify-start text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={12} className="mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <EditCommentForm
          comment={comment}
          onSave={handleCommentUpdated}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="pl-10">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {comment.content}
          </p>
          
          {comment.updatedAt !== comment.createdAt && (
            <p className="text-xs text-gray-400 mt-1">
              (edited)
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 pl-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReply}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          <Reply size={12} className="mr-1" />
          Reply
        </Button>
      </div>

      {isReplying && (
        <div className="pl-10 pt-2">
          <CommentForm
            recipeId={recipeId}
            parentId={comment.id}
            onCommentAdded={handleCommentAdded}
            onCancel={() => setIsReplying(false)}
            placeholder="Write a reply..."
            showCancel={true}
          />
        </div>
      )}

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-10 space-y-3">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              recipeId={recipeId}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

// Edit comment form component
function EditCommentForm({
  comment,
  onSave,
  onCancel
}: {
  comment: CommentType;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState(comment.content);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    if (content.length > 2000) {
      setError('Comment must be 2000 characters or less');
      return;
    }

    setError(null);
    
    startTransition(async () => {
      const result = await updateCommentAction(comment.id, content);
      
      if (result.success) {
        onSave();
      } else {
        setError(result.error || 'Failed to update comment');
      }
    });
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > 2000;

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={cn(
          "w-full min-h-[60px] p-2 border rounded-md resize-none text-sm",
          isOverLimit && "border-red-500 focus:border-red-500"
        )}
        disabled={isPending}
      />
      <div className="flex justify-between items-center text-xs">
        <div>
          {error && (
            <span className="text-red-500">{error}</span>
          )}
        </div>
        <span className={cn(
          "text-gray-500",
          isOverLimit && "text-red-500"
        )}>
          {characterCount}/2000
        </span>
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !content.trim() || isOverLimit}
          className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 disabled:bg-gray-400 disabled:border-gray-400"
        >
          {isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
