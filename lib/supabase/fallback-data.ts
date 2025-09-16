import { Recipe } from "../types";

export function getFallbackRecipes(): Recipe[] {
  return [
    {
      id: "fallback-1",
      title: "Welcome to Recipe Sharing Platform",
      description: "This is a sample recipe. The database connection is not available yet, but you can still explore the interface.",
      author: "System",
      authorId: "system",
      cookTime: "5 mins",
      difficulty: "Easy" as const,
      servings: 1,
      imageUrl: "/api/placeholder/400/300",
      createdAt: new Date(),
      tags: ["welcome", "sample"],
    },
    {
      id: "fallback-2",
      title: "Set up your database",
      description: "To see real recipes, please set up your Supabase database and run the migration scripts.",
      author: "System",
      authorId: "system",
      cookTime: "10 mins",
      difficulty: "Easy" as const,
      servings: 1,
      imageUrl: "/api/placeholder/400/300",
      createdAt: new Date(),
      tags: ["setup", "database"],
    },
  ];
}
