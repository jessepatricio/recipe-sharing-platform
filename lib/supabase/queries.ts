import { createSupabaseServerClient } from "./server";
import { Recipe } from "../types";

// Utility function to ensure consistent date handling
function parseDate(dateString: string | null | undefined): Date {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

export async function getRecipes(): Promise<Recipe[]> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // First, try to fetch recipes without join to see if basic query works
    const { data: recipesData, error: recipesError } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (recipesError) {
      console.error("Error fetching recipes:", recipesError);
      console.error("Error details:", JSON.stringify(recipesError, null, 2));
      return [];
    }

    console.log("Fetched recipes data:", recipesData?.length || 0, "recipes");

    if (!recipesData || recipesData.length === 0) {
      console.log("No recipes found");
      return [];
    }

    // Now fetch profiles for the recipes
    const userIds = [...new Set(recipesData.map(recipe => recipe.user_id))];
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      // Continue without profiles - just use Anonymous
    }

    // Create a map of user_id to profile full_name
    const profileMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profileMap.set(profile.id, profile.full_name);
      });
    }

    return recipesData.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title || "Untitled Recipe",
      description: recipe.description || "",
      author: profileMap.get(recipe.user_id) || "Anonymous",
      authorId: recipe.user_id || "",
      cookTime: recipe.cooking_time || 0, // INTEGER in minutes
      difficulty: recipe.difficulty || null,
      createdAt: parseDate(recipe.created_at),
      category: recipe.category || "General",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
      likeCount: recipe.like_count || 0,
      commentCount: recipe.comment_count || 0,
      isLiked: false, // Will be set by client-side logic
    }));
  } catch (err) {
    console.error("Error fetching recipes:", err);
    return [];
  }
}

export async function getUserRecipes(userId: string): Promise<Recipe[]> {
  try {
    if (!userId) {
      console.error("No user ID provided");
      return [];
    }

    const supabase = await createSupabaseServerClient();
    
    // Fetch recipes for the specific user
    const { data: recipesData, error: recipesError } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (recipesError) {
      console.error("Error fetching user recipes:", recipesError);
      return [];
    }

    if (!recipesData || recipesData.length === 0) {
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

    return recipesData.map((recipe: any) => ({
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
      likeCount: recipe.like_count || 0,
      commentCount: recipe.comment_count || 0,
      isLiked: false, // Will be set by client-side logic
    }));
  } catch (err) {
    console.error("Error fetching user recipes:", err);
    return [];
  }
}

export async function getUserRecipesWithLikeStatus(userId: string): Promise<Recipe[]> {
  try {
    if (!userId) {
      console.error("No user ID provided");
      return [];
    }

    const supabase = await createSupabaseServerClient();
    
    // Fetch recipes for the specific user
    const { data: recipesData, error: recipesError } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (recipesError) {
      console.error("Error fetching user recipes:", recipesError);
      return [];
    }

    if (!recipesData || recipesData.length === 0) {
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
    }

    // Fetch user's likes for these recipes
    const recipeIds = recipesData.map(recipe => recipe.id);
    const { data: likesData, error: likesError } = await supabase
      .from("likes")
      .select("recipe_id")
      .eq("user_id", userId)
      .in("recipe_id", recipeIds);

    if (likesError) {
      console.error("Error fetching user likes:", likesError);
    }

    // Create a set of liked recipe IDs
    const likedRecipeIds = new Set();
    if (likesData) {
      likesData.forEach(like => likedRecipeIds.add(like.recipe_id));
    }

    return recipesData.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title || "Untitled Recipe",
      description: recipe.description || "",
      author: profileData?.full_name || "Anonymous",
      authorId: recipe.user_id || "",
      cookTime: recipe.cooking_time || 0,
      difficulty: recipe.difficulty || null,
      createdAt: parseDate(recipe.created_at),
      category: recipe.category || "General",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
      likeCount: recipe.like_count || 0,
      commentCount: recipe.comment_count || 0,
      isLiked: likedRecipeIds.has(recipe.id),
    }));
  } catch (err) {
    console.error("Error fetching user recipes with like status:", err);
    return [];
  }
}

export async function getRecipeById(id: string, userId?: string): Promise<Recipe | null> {
  try {
    if (!id || typeof id !== 'string') {
      return null;
    }

    const supabase = await createSupabaseServerClient();
    
    // First fetch the recipe
    const { data: recipeData, error: recipeError } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (recipeError || !recipeData) {
      console.error("Error fetching recipe:", recipeError);
      return null;
    }

    // Then fetch the profile for this recipe
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", recipeData.user_id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      // Continue without profile - just use Anonymous
    }

    // Check if user has liked this recipe (if userId is provided)
    let isLiked = false;
    if (userId) {
      try {
        const { data: likeData, error: likeError } = await supabase
          .from("likes")
          .select("id")
          .eq("recipe_id", id)
          .eq("user_id", userId)
          .single();

        if (!likeError && likeData) {
          isLiked = true;
        }
      } catch (likeErr) {
        console.error("Error checking like status:", likeErr);
        // Continue with isLiked = false
      }
    }

    return {
      id: recipeData.id,
      title: recipeData.title || "Untitled Recipe",
      description: recipeData.description || "",
      author: profileData?.full_name || "Anonymous",
      authorId: recipeData.user_id || "",
      cookTime: recipeData.cooking_time || 0, // INTEGER in minutes
      difficulty: (recipeData.difficulty as "Easy" | "Medium" | "Hard") || "Easy",
      createdAt: parseDate(recipeData.created_at),
      category: recipeData.category || "General",
      ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
      instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
      likeCount: recipeData.like_count || 0,
      commentCount: recipeData.comment_count || 0,
      isLiked: isLiked,
    };
  } catch (err) {
    console.error("Error fetching recipe:", err);
    return null;
  }
}

// Get recipes with like status for current user
export async function getRecipesWithLikeStatus(userId?: string): Promise<Recipe[]> {
  try {
    const supabase = await createSupabaseServerClient();
    
    // First, try to fetch recipes without join to see if basic query works
    const { data: recipesData, error: recipesError } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (recipesError) {
      console.error("Error fetching recipes:", recipesError);
      return [];
    }

    if (!recipesData || recipesData.length === 0) {
      return [];
    }

    // Fetch profiles for the recipes
    const userIds = [...new Set(recipesData.map(recipe => recipe.user_id))];
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Create a map of user_id to profile full_name
    const profileMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profileMap.set(profile.id, profile.full_name);
      });
    }

    // If user is logged in, fetch their likes
    let userLikes = new Set<string>();
    if (userId) {
      const { data: likesData, error: likesError } = await supabase
        .from("likes")
        .select("recipe_id")
        .eq("user_id", userId);

      if (!likesError && likesData) {
        userLikes = new Set(likesData.map(like => like.recipe_id));
      }
    }

    return recipesData.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title || "Untitled Recipe",
      description: recipe.description || "",
      author: profileMap.get(recipe.user_id) || "Anonymous",
      authorId: recipe.user_id || "",
      cookTime: recipe.cooking_time || 0,
      difficulty: recipe.difficulty || null,
      createdAt: parseDate(recipe.created_at),
      category: recipe.category || "General",
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
      instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
      likeCount: recipe.like_count || 0,
      commentCount: recipe.comment_count || 0,
      isLiked: userLikes.has(recipe.id),
    }));
  } catch (err) {
    console.error("Error fetching recipes with like status:", err);
    return [];
  }
}

// Get single recipe with like status for current user
export async function getRecipeWithLikeStatus(id: string, userId?: string): Promise<Recipe | null> {
  try {
    if (!id || typeof id !== 'string') {
      return null;
    }

    const supabase = await createSupabaseServerClient();
    
    // First fetch the recipe
    const { data: recipeData, error: recipeError } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (recipeError || !recipeData) {
      console.error("Error fetching recipe:", recipeError);
      return null;
    }

    // Then fetch the profile for this recipe
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", recipeData.user_id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    // Check if user has liked this recipe
    let isLiked = false;
    if (userId) {
      const { data: likeData, error: likeError } = await supabase
        .from("likes")
        .select("id")
        .eq("recipe_id", id)
        .eq("user_id", userId)
        .single();

      if (!likeError && likeData) {
        isLiked = true;
      }
    }

    return {
      id: recipeData.id,
      title: recipeData.title || "Untitled Recipe",
      description: recipeData.description || "",
      author: profileData?.full_name || "Anonymous",
      authorId: recipeData.user_id || "",
      cookTime: recipeData.cooking_time || 0,
      difficulty: (recipeData.difficulty as "Easy" | "Medium" | "Hard") || "Easy",
      createdAt: parseDate(recipeData.created_at),
      category: recipeData.category || "General",
      ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
      instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
      likeCount: recipeData.like_count || 0,
      commentCount: recipeData.comment_count || 0,
      isLiked,
    };
  } catch (err) {
    console.error("Error fetching recipe with like status:", err);
    return null;
  }
}