export interface Recipe {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  cookTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  imageUrl: string;
  createdAt: Date;
  tags: string[];
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
  bio?: string | null;
  created_at: string;
  updated_at: string;
}