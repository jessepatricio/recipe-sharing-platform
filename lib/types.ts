// Recipe image interface
export interface RecipeImage {
  id: string;
  recipeId: string;
  imageUrl: string;
  altText?: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Recipe interface matching the ERD schema
export interface Recipe {
  id: string;
  title: string;
  description: string;
  author: string; // Computed from profiles table
  authorId: string; // Maps to user_id
  cookTime: number; // Maps to cooking_time (INTEGER in minutes)
  difficulty: string; // Difficulty level (any text)
  createdAt: Date | string; // Can be Date or string after serialization
  category: string;
  ingredients: string[]; // TEXT[] array
  instructions: string[]; // TEXT[] array
  likeCount: number; // Maps to like_count
  commentCount: number; // Maps to comment_count
  isLiked?: boolean; // Whether current user has liked this recipe
  images?: RecipeImage[]; // Recipe images
  primaryImage?: RecipeImage; // Primary recipe image
}

// Note: Using simple string arrays for ingredients and instructions
// as per the database schema (TEXT[] arrays)

export interface CreateRecipeData {
  title: string;
  description: string;
  cookTime: number; // Cooking time in minutes
  difficulty: string; // Difficulty level (any text)
  category: string;
  ingredients: string[];
  instructions: string[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

// Like interface
export interface Like {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: Date | string;
}

// Comment interface
export interface Comment {
  id: string;
  userId: string;
  recipeId: string;
  content: string;
  parentId?: string | null; // For nested comments/replies
  createdAt: Date | string;
  updatedAt: Date | string;
  author?: {
    username: string;
    fullName: string;
  };
  replies?: Comment[]; // For nested comment structure
}

// Create comment data interface
export interface CreateCommentData {
  content: string;
  parentId?: string | null;
}

// Like/Unlike response interface
export interface LikeResponse {
  success: boolean;
  isLiked: boolean;
  likeCount: number;
  error?: string;
}

// Comment response interface
export interface CommentResponse {
  success: boolean;
  comment?: Comment;
  error?: string;
}