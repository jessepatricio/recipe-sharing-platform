'use client';

import { useState, useTransition } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { Button } from '@/components/recipes/ui/button';
import { cn } from '@/lib/utils';
import { toggleLikeAction } from '@/app/actions/social';

interface LikeButtonProps {
  recipeId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function LikeButton({
  recipeId,
  initialLikeCount,
  initialIsLiked,
  className,
  size = 'md',
  showCount = true
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startTransition(async () => {
      try {
        const result = await toggleLikeAction(recipeId);
        
        if (result.success) {
          setIsLiked(result.isLiked);
          setLikeCount(result.likeCount);
        } else {
          // Show error to user (you might want to add a toast notification here)
          console.error('Failed to toggle like:', result.error);
          // You could add a toast notification here
          alert(result.error || 'Failed to toggle like');
        }
      } catch (error) {
        console.error('Unexpected error toggling like:', error);
        alert('An unexpected error occurred. Please try again.');
      }
    });
  };

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        isLiked 
          ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
          : "hover:bg-red-50 hover:border-red-300 hover:text-red-600",
        sizeClasses[size],
        className
      )}
    >
      {isLiked ? (
        <Heart 
          className="fill-current" 
          size={iconSizes[size]}
        />
      ) : (
        <HeartOff 
          size={iconSizes[size]}
        />
      )}
      {showCount && (
        <span className="font-medium">
          {likeCount}
        </span>
      )}
      {isPending && (
        <div className="ml-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
    </Button>
  );
}
