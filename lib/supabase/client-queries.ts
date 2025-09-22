import { createSupabaseBrowserClient } from "./client";
import { Recipe, RecipeImage } from "../types";

// Utility function to ensure consistent date handling
function parseDate(dateString: string | null | undefined): Date {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

// Helper function to fetch recipe images
async function fetchRecipeImagesClient(recipeIds: string[]): Promise<Map<string, RecipeImage[]>> {
  if (recipeIds.length === 0) return new Map();
  
  const supabase = createSupabaseBrowserClient();
  const { data: images, error } = await supabase
    .from('recipe_images')
    .select('*')
    .in('recipe_id', recipeIds)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching recipe images:', error);
    return new Map();
  }

  // Group images by recipe_id
  const imageMap = new Map<string, RecipeImage[]>();
  if (images) {
    images.forEach((image: any) => {
      const recipeId = image.recipe_id;
      if (!imageMap.has(recipeId)) {
        imageMap.set(recipeId, []);
      }
      
      const recipeImage: RecipeImage = {
        id: image.id,
        recipeId: image.recipe_id,
        imageUrl: image.image_url,
        altText: image.alt_text,
        caption: image.caption,
        isPrimary: image.is_primary,
        sortOrder: image.sort_order,
        fileSize: image.file_size,
        mimeType: image.mime_type,
        width: image.width,
        height: image.height,
        createdAt: parseDate(image.created_at),
        updatedAt: parseDate(image.updated_at)
      };
      
      imageMap.get(recipeId)!.push(recipeImage);
    });
  }

  return imageMap;
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

    // Fetch recipe images
    const recipeIds = data.map(recipe => recipe.id);
    const imageMap = await fetchRecipeImagesClient(recipeIds);

    return data.map((recipe: any) => {
      const recipeImages = imageMap.get(recipe.id) || [];
      const primaryImage = recipeImages.find(img => img.isPrimary) || recipeImages[0];
      
      return {
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
        images: recipeImages,
        primaryImage: primaryImage
      };
    });
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

    // Fetch recipe images
    const recipeIds = data.map(recipe => recipe.id);
    const imageMap = await fetchRecipeImagesClient(recipeIds);

    return data.map((recipe: any) => {
      const recipeImages = imageMap.get(recipe.id) || [];
      const primaryImage = recipeImages.find(img => img.isPrimary) || recipeImages[0];
      
      return {
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
        images: recipeImages,
        primaryImage: primaryImage
      };
    });
  } catch (err) {
    console.error("Error fetching user recipes:", err);
    return [];
  }
}