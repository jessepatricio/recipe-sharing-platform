'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/recipes/ui/button';
import { Card } from '@/components/recipes/ui/card';
import { Comment } from './comment';
import { CommentForm } from './comment-form';
import { getRecipeCommentsAction } from '@/app/actions/social';
import { Comment as CommentType } from '@/lib/types';

interface CommentsSectionProps {
  recipeId: string;
  initialComments?: CommentType[];
  className?: string;
}

export function CommentsSection({
  recipeId,
  initialComments = [],
  className
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentType[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await getRecipeCommentsAction(recipeId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  const handleCommentAdded = () => {
    loadComments();
    setShowCommentForm(false);
  };

  const handleCommentUpdated = () => {
    loadComments();
  };

  const handleCommentDeleted = () => {
    loadComments();
  };

  const handleShowCommentForm = () => {
    setShowCommentForm(true);
  };

  const handleCancelComment = () => {
    setShowCommentForm(false);
  };

  // Load comments if not provided initially
  useEffect(() => {
    if (initialComments.length === 0) {
      loadComments();
    }
  }, [recipeId, initialComments.length, loadComments]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} />
          <h3 className="text-lg font-semibold">
            Comments ({comments.length})
          </h3>
        </div>
        {!showCommentForm && (
          <Button 
            onClick={handleShowCommentForm} 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
          >
            Add Comment
          </Button>
        )}
      </div>

      {showCommentForm && (
        <Card className="p-4 mb-4">
          <CommentForm
            recipeId={recipeId}
            onCommentAdded={handleCommentAdded}
            onCancel={handleCancelComment}
            showCancel={true}
          />
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-gray-500">Loading comments...</span>
        </div>
      ) : comments.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageCircle size={48} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 mb-4">No comments yet</p>
          <Button 
            onClick={handleShowCommentForm} 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
          >
            Be the first to comment
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              recipeId={recipeId}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
