import { createSupabaseServerClient } from "./server";
import { Recipe, RecipeImage } from "../types";

// Database record interfaces
interface DatabaseRecipeImage {
  id: string;
  recipe_id: string;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  is_primary: boolean;
  sort_order: number;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
}

interface DatabaseRecipe {
  id: string;
  title: string;
  description: string | null;
  cooking_time: number | null;
  difficulty: string | null;
  category: string | null;
  ingredients: string[] | null;
  instructions: string[] | null;
  user_id: string;
  like_count: number | null;
  comment_count: number | null;
  created_at: string;
  updated_at: string;
}

// Utility function to ensure consistent date handling
function parseDate(dateString: string | null | undefined): Date {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
}

// Helper function to fetch recipe images
async function fetchRecipeImages(recipeIds: string[]): Promise<Map<string, RecipeImage[]>> {
  if (recipeIds.length === 0) return new Map();
  
  const supabase = await createSupabaseServerClient();
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
    images.forEach((image: DatabaseRecipeImage) => {
      const recipeId = image.recipe_id;
      if (!imageMap.has(recipeId)) {
        imageMap.set(recipeId, []);
      }
      
      const recipeImage: RecipeImage = {
        id: image.id,
        recipeId: image.recipe_id,
        imageUrl: image.image_url,
        altText: image.alt_text || undefined,
        caption: image.caption || undefined,
        isPrimary: image.is_primary,
        sortOrder: image.sort_order,
        fileSize: image.file_size || undefined,
        mimeType: image.mime_type || undefined,
        width: image.width || undefined,
        height: image.height || undefined,
        createdAt: parseDate(image.created_at),
        updatedAt: parseDate(image.updated_at)
      };
      
      imageMap.get(recipeId)!.push(recipeImage);
    });
  }

  return imageMap;
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

    // Get actual like counts and comment counts for all recipes to ensure accuracy
    const allRecipeIds = recipesData.map(recipe => recipe.id);
    const { data: allLikes, error: allLikesError } = await supabase
      .from('likes')
      .select('recipe_id')
      .in('recipe_id', allRecipeIds);

    const { data: allComments, error: allCommentsError } = await supabase
      .from('comments')
      .select('recipe_id')
      .in('recipe_id', allRecipeIds);

    // Create maps of recipe_id to actual counts
    const likeCountMap = new Map();
    if (!allLikesError && allLikes) {
      allLikes.forEach(like => {
        const currentCount = likeCountMap.get(like.recipe_id) || 0;
        likeCountMap.set(like.recipe_id, currentCount + 1);
      });
    }

    const commentCountMap = new Map();
    if (!allCommentsError && allComments) {
      allComments.forEach(comment => {
        const currentCount = commentCountMap.get(comment.recipe_id) || 0;
        commentCountMap.set(comment.recipe_id, currentCount + 1);
      });
    }

    // Fetch recipe images
    const imageMap = await fetchRecipeImages(allRecipeIds);

    return recipesData.map((recipe: DatabaseRecipe) => {
      const recipeImages = imageMap.get(recipe.id) || [];
      const primaryImage = recipeImages.find(img => img.isPrimary) || recipeImages[0];
      
      return {
        id: recipe.id,
        title: recipe.title || "Untitled Recipe",
        description: recipe.description || "",
        author: profileMap.get(recipe.user_id) || "Anonymous",
        authorId: recipe.user_id || "",
        cookTime: recipe.cooking_time || 0, // INTEGER in minutes
        difficulty: recipe.difficulty || "Easy",
        createdAt: parseDate(recipe.created_at),
        category: recipe.category || "General",
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        likeCount: likeCountMap.get(recipe.id) || 0, // Use actual count instead of stored count
        commentCount: commentCountMap.get(recipe.id) || 0, // Use actual count instead of stored count
        isLiked: false, // Will be set by client-side logic
        images: recipeImages,
        primaryImage: primaryImage
      };
    });
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

    // Get actual like counts and comment counts for all recipes to ensure accuracy
    const allRecipeIds = recipesData.map(recipe => recipe.id);
    const { data: allLikes, error: allLikesError } = await supabase
      .from('likes')
      .select('recipe_id')
      .in('recipe_id', allRecipeIds);

    const { data: allComments, error: allCommentsError } = await supabase
      .from('comments')
      .select('recipe_id')
      .in('recipe_id', allRecipeIds);

    // Create maps of recipe_id to actual counts
    const likeCountMap = new Map();
    if (!allLikesError && allLikes) {
      allLikes.forEach(like => {
        const currentCount = likeCountMap.get(like.recipe_id) || 0;
        likeCountMap.set(like.recipe_id, currentCount + 1);
      });
    }

    const commentCountMap = new Map();
    if (!allCommentsError && allComments) {
      allComments.forEach(comment => {
        const currentCount = commentCountMap.get(comment.recipe_id) || 0;
        commentCountMap.set(comment.recipe_id, currentCount + 1);
      });
    }

    // Fetch recipe images
    const imageMap = await fetchRecipeImages(allRecipeIds);

    return recipesData.map((recipe: DatabaseRecipe) => {
      const recipeImages = imageMap.get(recipe.id) || [];
      const primaryImage = recipeImages.find(img => img.isPrimary) || recipeImages[0];
      
      return {
        id: recipe.id,
        title: recipe.title || "Untitled Recipe",
        description: recipe.description || "",
        author: profileData?.full_name || "Anonymous",
        authorId: recipe.user_id || "",
        cookTime: recipe.cooking_time || 0, // INTEGER in minutes
        difficulty: recipe.difficulty || "Easy",
        createdAt: parseDate(recipe.created_at),
        category: recipe.category || "General",
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        likeCount: likeCountMap.get(recipe.id) || 0, // Use actual count instead of stored count
        commentCount: commentCountMap.get(recipe.id) || 0, // Use actual count instead of stored count
        isLiked: false, // Will be set by client-side logic
        images: recipeImages,
        primaryImage: primaryImage
      };
    });
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

    // Get actual like counts and comment counts for all recipes to ensure accuracy
    const allRecipeIds = recipesData.map(recipe => recipe.id);
    const { data: allLikes, error: allLikesError } = await supabase
      .from('likes')
      .select('recipe_id')
      .in('recipe_id', allRecipeIds);

    const { data: allComments, error: allCommentsError } = await supabase
      .from('comments')
      .select('recipe_id')
      .in('recipe_id', allRecipeIds);

    // Create maps of recipe_id to actual counts
    const likeCountMap = new Map();
    if (!allLikesError && allLikes) {
      allLikes.forEach(like => {
        const currentCount = likeCountMap.get(like.recipe_id) || 0;
        likeCountMap.set(like.recipe_id, currentCount + 1);
      });
    }

    const commentCountMap = new Map();
    if (!allCommentsError && allComments) {
      allComments.forEach(comment => {
        const currentCount = commentCountMap.get(comment.recipe_id) || 0;
        commentCountMap.set(comment.recipe_id, currentCount + 1);
      });
    }

    // Fetch recipe images
    const imageMap = await fetchRecipeImages(allRecipeIds);

    return recipesData.map((recipe: DatabaseRecipe) => {
      const recipeImages = imageMap.get(recipe.id) || [];
      const primaryImage = recipeImages.find(img => img.isPrimary) || recipeImages[0];
      
      return {
        id: recipe.id,
        title: recipe.title || "Untitled Recipe",
        description: recipe.description || "",
        author: profileData?.full_name || "Anonymous",
        authorId: recipe.user_id || "",
        cookTime: recipe.cooking_time || 0,
        difficulty: recipe.difficulty || "Easy",
        createdAt: parseDate(recipe.created_at),
        category: recipe.category || "General",
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        likeCount: likeCountMap.get(recipe.id) || 0, // Use actual count instead of stored count
        commentCount: commentCountMap.get(recipe.id) || 0, // Use actual count instead of stored count
        isLiked: likedRecipeIds.has(recipe.id),
        images: recipeImages,
        primaryImage: primaryImage
      };
    });
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

    // Get actual like count and comment count for this recipe to ensure accuracy
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', id);

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id')
      .eq('recipe_id', id);

    const actualLikeCount = (!likesError && likes) ? likes.length : 0;
    const actualCommentCount = (!commentsError && comments) ? comments.length : 0;

    // Fetch recipe images
    const imageMap = await fetchRecipeImages([id]);
    const recipeImages = imageMap.get(id) || [];
    const primaryImage = recipeImages.find(img => img.isPrimary) || recipeImages[0];

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
      likeCount: actualLikeCount, // Use actual count instead of stored count
      commentCount: actualCommentCount, // Use actual count instead of stored count
      isLiked: isLiked,
      images: recipeImages,
      primaryImage: primaryImage
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

    // Get actual like counts and comment counts for all recipes to ensure accuracy
    const allRecipeIds = recipesData.map(recipe => recipe.id);
    const { data: allLikes, error: allLikesError } = await supabase
      .from('likes')
      .select('recipe_id')
      .in('recipe_id', allRecipeIds);

    const { data: allComments, error: allCommentsError } = await supabase
      .from('comments')
      .select('recipe_id')
      .in('recipe_id', allRecipeIds);

    // Create maps of recipe_id to actual counts
    const likeCountMap = new Map();
    if (!allLikesError && allLikes) {
      allLikes.forEach(like => {
        const currentCount = likeCountMap.get(like.recipe_id) || 0;
        likeCountMap.set(like.recipe_id, currentCount + 1);
      });
    }

    const commentCountMap = new Map();
    if (!allCommentsError && allComments) {
      allComments.forEach(comment => {
        const currentCount = commentCountMap.get(comment.recipe_id) || 0;
        commentCountMap.set(comment.recipe_id, currentCount + 1);
      });
    }

    // Fetch recipe images
    const imageMap = await fetchRecipeImages(allRecipeIds);

    return recipesData.map((recipe: DatabaseRecipe) => {
      const recipeImages = imageMap.get(recipe.id) || [];
      const primaryImage = recipeImages.find(img => img.isPrimary) || recipeImages[0];
      
      return {
        id: recipe.id,
        title: recipe.title || "Untitled Recipe",
        description: recipe.description || "",
        author: profileMap.get(recipe.user_id) || "Anonymous",
        authorId: recipe.user_id || "",
        cookTime: recipe.cooking_time || 0,
        difficulty: recipe.difficulty || "Easy",
        createdAt: parseDate(recipe.created_at),
        category: recipe.category || "General",
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        likeCount: likeCountMap.get(recipe.id) || 0, // Use actual count instead of stored count
        commentCount: commentCountMap.get(recipe.id) || 0, // Use actual count instead of stored count
        isLiked: userLikes.has(recipe.id),
        images: recipeImages,
        primaryImage: primaryImage
      };
    });
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

    // Get actual like count and comment count for this recipe to ensure accuracy
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', id);

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id')
      .eq('recipe_id', id);

    const actualLikeCount = (!likesError && likes) ? likes.length : 0;
    const actualCommentCount = (!commentsError && comments) ? comments.length : 0;

    // Fetch recipe images
    const imageMap = await fetchRecipeImages([id]);
    const recipeImages = imageMap.get(id) || [];
    const primaryImage = recipeImages.find(img => img.isPrimary) || recipeImages[0];

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
      likeCount: actualLikeCount, // Use actual count instead of stored count
      commentCount: actualCommentCount, // Use actual count instead of stored count
      isLiked,
      images: recipeImages,
      primaryImage: primaryImage
    };
  } catch (err) {
    console.error("Error fetching recipe with like status:", err);
    return null;
  }
}