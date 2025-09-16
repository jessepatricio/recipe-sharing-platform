import { createSupabaseServerClient } from "./server";
import { Recipe } from "../types";

export async function getRecipes(): Promise<Recipe[]> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recipes:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title || "Untitled Recipe",
      description: recipe.description || "",
      author: "Anonymous",
      authorId: recipe.user_id || "",
      cookTime: recipe.cook_time || "Unknown",
      difficulty: (recipe.difficulty as "Easy" | "Medium" | "Hard") || "Easy",
      servings: recipe.servings || 1,
      imageUrl: recipe.image_url || "/api/placeholder/400/300",
      createdAt: recipe.created_at ? new Date(recipe.created_at) : new Date(),
      tags: Array.isArray(recipe.tags) ? recipe.tags : [],
    }));
  } catch (err) {
    console.error("Error fetching recipes:", err);
    return [];
  }
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    if (!id || typeof id !== 'string') {
      return null;
    }

    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      title: data.title || "Untitled Recipe",
      description: data.description || "",
      author: "Anonymous",
      authorId: data.user_id || "",
      cookTime: data.cook_time || "Unknown",
      difficulty: (data.difficulty as "Easy" | "Medium" | "Hard") || "Easy",
      servings: data.servings || 1,
      imageUrl: data.image_url || "/api/placeholder/400/300",
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  } catch (err) {
    console.error("Error fetching recipe:", err);
    return null;
  }
}