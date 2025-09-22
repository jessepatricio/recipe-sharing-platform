import { createSupabaseServerClient } from './server';
import { Comment, Like, CreateCommentData, LikeResponse, CommentResponse } from '@/lib/types';

// Like-related queries
export async function toggleLike(recipeId: string, userId: string): Promise<LikeResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Check if user has already liked this recipe
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let isLiked: boolean;
    
    if (existingLike) {
      // Unlike the recipe
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;
      isLiked = false;
    } else {
      // Like the recipe
      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          recipe_id: recipeId,
          user_id: userId
        });

      if (insertError) throw insertError;
      isLiked = true;
    }

    // Always get the actual like count from the database
    // This ensures accurate counts even if the stored like_count is out of sync
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', recipeId);

    if (likesError) {
      console.error('Error counting likes:', likesError);
      // Don't throw here - the like/unlike operation was successful
      // Just return the expected count based on the operation
      const expectedCount = isLiked ? 1 : 0;
      return {
        success: true,
        isLiked,
        likeCount: expectedCount
      };
    }

    const actualLikeCount = likes?.length || 0;

    // Try to update the recipe's like_count with the actual count
    // If this fails, we still return the correct count to the UI
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ like_count: actualLikeCount })
      .eq('id', recipeId);

    if (updateError) {
      console.error('Error updating like count (continuing with correct count):', updateError);
      // Don't throw here - the like/unlike operation was successful
      // The UI will still get the correct count
    }

    return {
      success: true,
      isLiked,
      likeCount: actualLikeCount
    };
  } catch (error) {
    console.error('Error toggling like:', error);
    return {
      success: false,
      isLiked: false,
      likeCount: 0,
      error: error instanceof Error ? error.message : 'Failed to toggle like'
    };
  }
}

export async function checkUserLiked(recipeId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
}

export async function getRecipeLikes(recipeId: string): Promise<number> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select('like_count')
      .eq('id', recipeId)
      .single();

    if (error) throw error;
    return recipe.like_count || 0;
  } catch (error) {
    console.error('Error getting recipe likes:', error);
    return 0;
  }
}

// Comment-related queries
export async function createComment(
  recipeId: string, 
  userId: string, 
  commentData: CreateCommentData
): Promise<CommentResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        recipe_id: recipeId,
        user_id: userId,
        content: commentData.content.trim(),
        parent_id: commentData.parentId || null
      })
      .select(`
        id,
        user_id,
        recipe_id,
        content,
        parent_id,
        created_at,
        updated_at
      `)
      .single();

    if (error) throw error;

    // Manually recalculate and update the comment count
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id')
      .eq('recipe_id', recipeId);

    if (commentsError) {
      console.error('Error counting comments:', commentsError);
    } else {
      const actualCommentCount = comments?.length || 0;

      // Update the recipe's comment_count with the actual count
      const { error: updateError } = await supabase
        .from('recipes')
        .update({ comment_count: actualCommentCount })
        .eq('id', recipeId);

      if (updateError) {
        console.error('Error updating comment count:', updateError);
        // Don't throw here - the comment creation was successful
      }
    }

    // Now fetch the profile data separately
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile for comment:', profileError);
    }

    const formattedComment: Comment = {
      id: comment.id,
      userId: comment.user_id,
      recipeId: comment.recipe_id,
      content: comment.content,
      parentId: comment.parent_id,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author: {
        username: profile?.username || 'Unknown',
        fullName: profile?.full_name || 'Unknown User'
      }
    };

    return {
      success: true,
      comment: formattedComment
    };
  } catch (error) {
    console.error('Error creating comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create comment'
    };
  }
}

export async function getRecipeComments(recipeId: string): Promise<Comment[]> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        user_id,
        recipe_id,
        content,
        parent_id,
        created_at,
        updated_at
      `)
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!comments || comments.length === 0) {
      return [];
    }

    // Get all unique user IDs from comments
    const userIds = [...new Set(comments.map(comment => comment.user_id))];
    
    // Fetch profiles for all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles for comments:', profilesError);
    }

    // Create a map of user_id to profile data
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }

    const formattedComments: Comment[] = comments.map(comment => {
      const profile = profileMap.get(comment.user_id);
      return {
        id: comment.id,
        userId: comment.user_id,
        recipeId: comment.recipe_id,
        content: comment.content,
        parentId: comment.parent_id,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        author: {
          username: profile?.username || 'Unknown',
          fullName: profile?.full_name || 'Unknown User'
        }
      };
    });

    // Organize comments into a tree structure
    return organizeCommentsTree(formattedComments);
  } catch (error) {
    console.error('Error getting recipe comments:', error);
    return [];
  }
}

export async function updateComment(
  commentId: string, 
  userId: string, 
  content: string
): Promise<CommentResponse> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: comment, error } = await supabase
      .from('comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', userId)
      .select(`
        id,
        user_id,
        recipe_id,
        content,
        parent_id,
        created_at,
        updated_at
      `)
      .single();

    if (error) throw error;

    // Fetch profile data separately
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile for updated comment:', profileError);
    }

    const formattedComment: Comment = {
      id: comment.id,
      userId: comment.user_id,
      recipeId: comment.recipe_id,
      content: comment.content,
      parentId: comment.parent_id,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author: {
        username: profile?.username || 'Unknown',
        fullName: profile?.full_name || 'Unknown User'
      }
    };

    return {
      success: true,
      comment: formattedComment
    };
  } catch (error) {
    console.error('Error updating comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update comment'
    };
  }
}

export async function deleteComment(commentId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // First get the recipe_id before deleting
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('recipe_id')
      .eq('id', commentId)
      .eq('user_id', userId)
      .single();

    if (commentError) throw commentError;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;

    // Manually recalculate and update the comment count
    if (comment?.recipe_id) {
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id')
        .eq('recipe_id', comment.recipe_id);

      if (commentsError) {
        console.error('Error counting comments after deletion:', commentsError);
      } else {
        const actualCommentCount = comments?.length || 0;

        // Update the recipe's comment_count with the actual count
        const { error: updateError } = await supabase
          .from('recipes')
          .update({ comment_count: actualCommentCount })
          .eq('id', comment.recipe_id);

        if (updateError) {
          console.error('Error updating comment count after deletion:', updateError);
          // Don't throw here - the comment deletion was successful
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete comment'
    };
  }
}

export async function getRecipeCommentCount(recipeId: string): Promise<number> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select('comment_count')
      .eq('id', recipeId)
      .single();

    if (error) throw error;
    return recipe.comment_count || 0;
  } catch (error) {
    console.error('Error getting recipe comment count:', error);
    return 0;
  }
}

// Helper function to organize comments into a tree structure
function organizeCommentsTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // First pass: create a map of all comments
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: organize into tree structure
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    
    if (comment.parentId) {
      // This is a reply
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(commentWithReplies);
      }
    } else {
      // This is a root comment
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
}
