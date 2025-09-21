'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { 
  toggleLike, 
  createComment, 
  updateComment, 
  deleteComment, 
  getRecipeComments,
  getRecipeCommentCount 
} from '@/lib/supabase/social-queries';
import { CreateCommentData, LikeResponse, CommentResponse } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Like/Unlike actions
export async function toggleLikeAction(recipeId: string): Promise<LikeResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        isLiked: false,
        likeCount: 0,
        error: 'You must be logged in to like recipes'
      };
    }

    // Toggle the like
    const result = await toggleLike(recipeId, user.id);
    
    if (result.success) {
      // Revalidate the recipe page and any lists that might show this recipe
      revalidatePath(`/recipes/${recipeId}`);
      revalidatePath('/dashboard');
      revalidatePath('/my-recipes');
      revalidatePath('/recipes');
    }

    return result;
  } catch (error) {
    console.error('Error in toggleLikeAction:', error);
    return {
      success: false,
      isLiked: false,
      likeCount: 0,
      error: 'An unexpected error occurred'
    };
  }
}

// Comment actions
export async function createCommentAction(
  recipeId: string, 
  commentData: CreateCommentData
): Promise<CommentResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to comment'
      };
    }

    // Validate comment content
    if (!commentData.content || commentData.content.trim().length === 0) {
      return {
        success: false,
        error: 'Comment cannot be empty'
      };
    }

    if (commentData.content.length > 2000) {
      return {
        success: false,
        error: 'Comment must be 2000 characters or less'
      };
    }

    // Create the comment
    const result = await createComment(recipeId, user.id, commentData);
    
    if (result.success) {
      // Revalidate the recipe page to show the new comment
      revalidatePath(`/recipes/${recipeId}`);
    }

    return result;
  } catch (error) {
    console.error('Error in createCommentAction:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function updateCommentAction(
  commentId: string, 
  content: string
): Promise<CommentResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to edit comments'
      };
    }

    // Validate comment content
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: 'Comment cannot be empty'
      };
    }

    if (content.length > 2000) {
      return {
        success: false,
        error: 'Comment must be 2000 characters or less'
      };
    }

    // Update the comment
    const result = await updateComment(commentId, user.id, content);
    
    if (result.success) {
      // Revalidate the recipe page to show the updated comment
      revalidatePath(`/recipes/${result.comment?.recipeId}`);
    }

    return result;
  } catch (error) {
    console.error('Error in updateCommentAction:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

export async function deleteCommentAction(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: 'You must be logged in to delete comments'
      };
    }

    // Get the comment to find the recipe ID for revalidation
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('recipe_id')
      .eq('id', commentId)
      .eq('user_id', user.id)
      .single();

    if (commentError) {
      return {
        success: false,
        error: 'Comment not found or you do not have permission to delete it'
      };
    }

    // Delete the comment
    const result = await deleteComment(commentId, user.id);
    
    if (result.success) {
      // Revalidate the recipe page to remove the deleted comment
      revalidatePath(`/recipes/${comment.recipe_id}`);
    }

    return result;
  } catch (error) {
    console.error('Error in deleteCommentAction:', error);
    return {
      success: false,
      error: 'An unexpected error occurred'
    };
  }
}

// Get comments for a recipe (server-side)
export async function getRecipeCommentsAction(recipeId: string) {
  try {
    return await getRecipeComments(recipeId);
  } catch (error) {
    console.error('Error in getRecipeCommentsAction:', error);
    return [];
  }
}

// Get comment count for a recipe (server-side)
export async function getRecipeCommentCountAction(recipeId: string) {
  try {
    return await getRecipeCommentCount(recipeId);
  } catch (error) {
    console.error('Error in getRecipeCommentCountAction:', error);
    return 0;
  }
}
