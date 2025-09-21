// Core Recipe interface with only fields that exist in the ERD
export interface RecipeCore {
  id: string;
  title: string;
  description: string;
  author: string; // Computed from profiles table
  authorId: string; // Maps to user_id
  cookTime: number; // Maps to cooking_time (INTEGER in minutes)
  difficulty: "Easy" | "Medium" | "Hard";
  createdAt: Date | string; // Can be Date or string after serialization
  category: string;
  ingredients: string[]; // TEXT[] array
  instructions: string[]; // TEXT[] array
  likeCount: number; // Maps to like_count
  commentCount: number; // Maps to comment_count
  isLiked?: boolean; // Whether current user has liked this recipe
}

// Create Recipe Data interface matching the ERD schema
export interface CreateRecipeDataCore {
  title: string;
  description: string;
  cookTime: number; // Cooking time in minutes
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  ingredients: string[]; // TEXT[] array
  instructions: string[]; // TEXT[] array
}
