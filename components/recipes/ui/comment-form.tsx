'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/recipes/ui/button';
import { Textarea } from '@/components/recipes/ui/textarea';
import { Label } from '@/components/recipes/ui/label';
import { cn } from '@/lib/utils';
import { createCommentAction } from '@/app/actions/social';
import { CreateCommentData } from '@/lib/types';

interface CommentFormProps {
  recipeId: string;
  parentId?: string | null;
  onCommentAdded?: () => void;
  placeholder?: string;
  className?: string;
  showCancel?: boolean;
  onCancel?: () => void;
}

export function CommentForm({
  recipeId,
  parentId = null,
  onCommentAdded,
  placeholder = "Write a comment...",
  className,
  showCancel = false,
  onCancel
}: CommentFormProps) {
  const [content, setContent] = useState('');
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
      const commentData: CreateCommentData = {
        content: content.trim(),
        parentId
      };

      const result = await createCommentAction(recipeId, commentData);
      
      if (result.success) {
        setContent('');
        onCommentAdded?.();
      } else {
        setError(result.error || 'Failed to post comment');
      }
    });
  };

  const handleCancel = () => {
    setContent('');
    setError(null);
    onCancel?.();
  };

  const isReply = parentId !== null;
  const characterCount = content.length;
  const isOverLimit = characterCount > 2000;

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <Label htmlFor={`comment-${recipeId}-${parentId || 'root'}`}>
          {isReply ? 'Write a reply' : 'Write a comment'}
        </Label>
        <Textarea
          id={`comment-${recipeId}-${parentId || 'root'}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "min-h-[80px] resize-none",
            isOverLimit && "border-red-500 focus:border-red-500"
          )}
          disabled={isPending}
        />
        <div className="flex justify-between items-center text-sm">
          <div className="flex gap-2">
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
      </div>
      
      <div className="flex gap-2 justify-end">
        {showCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isPending || !content.trim() || isOverLimit}
          className="min-w-[80px] bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 disabled:bg-gray-400 disabled:border-gray-400"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {isReply ? 'Replying...' : 'Posting...'}
            </div>
          ) : (
            isReply ? 'Reply' : 'Post Comment'
          )}
        </Button>
      </div>
    </form>
  );
}
