// Supabase table types based on your schema image

export interface Profile {
  id: string; // uuid (auth.users.id)
  username: string; // text
  full_name: string | null; // text
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface Recipe {
  id: string; // uuid
  created_at: string; // ISO timestamp
  user_id: string; // uuid (auth.users.id)
  title: string; // text
  description: string | null; // text (optional in UI)
  ingredients: string; // text
  instructions: string; // text
  cooking_time: number | null; // int4 (minutes)
  category: string | null; // text
  difficulty: string | null; // text (e.g., "easy" | "medium" | "hard")
}

// Difficulty helpers (avoid enums; export a const and a union type)
export const DIFFICULTY = {
  easy: "easy",
  medium: "medium",
  hard: "hard",
} as const;

export type Difficulty = typeof DIFFICULTY[keyof typeof DIFFICULTY];

// Minimal Database type compatible with supabase-js generics (optional use)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id" | "created_at">> & {
          id?: string;
          created_at?: string;
        };
      };
      recipes: {
        Row: Recipe;
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          title: string;
          description?: string | null;
          ingredients: string;
          instructions: string;
          cooking_time?: number | null;
          category?: string | null;
          difficulty?: string | null;
        };
        Update: Partial<Omit<Recipe, "id" | "user_id" | "created_at">> & {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
}


