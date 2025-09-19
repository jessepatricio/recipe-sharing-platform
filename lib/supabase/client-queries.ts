import { createSupabaseBrowserClient } from "./client";
import { Recipe } from "../types";

// Utility function to ensure consistent date handling
function parseDate(dateString: string | null | undefined): Date {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

export async function getRecipesClient(): Promise<Recipe[]> {
  try {
    const supabase = createSupabaseBrowserClient();
    
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
      author: "Anonymous", // This will be populated from profiles table in future
      authorId: recipe.user_id || "",
      cookTime: recipe.cooking_time || 0, // INTEGER in minutes
      difficulty: recipe.difficulty || null,
      createdAt: parseDate(recipe.created_at),
      category: recipe.category || "General",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
    }));
  } catch (err) {
    console.error("Error fetching recipes:", err);
    return [];
  }
}

export async function getUserRecipesClient(userId: string): Promise<Recipe[]> {
  try {
    if (!userId) {
      console.error("No user ID provided");
      return [];
    }

    const supabase = createSupabaseBrowserClient();
    
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user recipes:", error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Fetch the user's profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      // Continue without profile - just use Anonymous
    }

    return data.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title || "Untitled Recipe",
      description: recipe.description || "",
      author: profileData?.full_name || "Anonymous",
      authorId: recipe.user_id || "",
      cookTime: recipe.cooking_time || 0, // INTEGER in minutes
      difficulty: recipe.difficulty || null,
      createdAt: parseDate(recipe.created_at),
      category: recipe.category || "General",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
    }));
  } catch (err) {
    console.error("Error fetching user recipes:", err);
    return [];
  }
}