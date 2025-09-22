import { Recipe } from "../types";

export function getFallbackRecipes(): Recipe[] {
  return [
    {
      id: "fallback-1",
      title: "Welcome to Recipe Sharing Platform",
      description: "This is a sample recipe. The database connection is not available yet, but you can still explore the interface.",
      author: "System",
      authorId: "system",
      cookTime: 5, // minutes
      difficulty: "Easy" as const,
      createdAt: new Date(),
      category: "Welcome",
      ingredients: ["Sample ingredient 1", "Sample ingredient 2"],
      instructions: ["Step 1: Do something", "Step 2: Do something else"],
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
    },
    {
      id: "fallback-2",
      title: "Set up your database",
      description: "To see real recipes, please set up your Supabase database and run the migration scripts.",
      author: "System",
      authorId: "system",
      cookTime: 10, // minutes
      difficulty: "Easy" as const,
      createdAt: new Date(),
      category: "Setup",
      ingredients: ["Database setup", "Migration scripts"],
      instructions: ["Step 1: Set up Supabase", "Step 2: Run migrations"],
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
    },
  ];
}
