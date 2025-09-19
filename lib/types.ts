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
  avatarUrl?: string;
  createdAt: Date;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}