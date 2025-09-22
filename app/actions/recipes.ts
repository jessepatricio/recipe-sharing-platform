"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "../../lib/supabase/server";
import { createSupabaseServerClient } from "../../lib/supabase/server";
// import { RecipeImage } from "../../lib/types"; // Unused for now

// Helper function to get image dimensions (simplified for server-side)
async function getImageDimensions(_file: File): Promise<{ width: number; height: number }> {
  // For server-side, we'll use default dimensions
  // In a production app, you might want to use a library like 'sharp' for image processing
  return { width: 800, height: 600 };
}

// Helper function to upload recipe images
async function uploadRecipeImages(recipeId: string, formData: FormData, _userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const imageCount = parseInt(formData.get('image_count') as string) || 0;
  
  if (imageCount === 0) return;

  console.log(`Uploading ${imageCount} images for recipe ${recipeId}`);

  for (let i = 0; i < imageCount; i++) {
    const imageFile = formData.get(`image_${i}`) as File;
    if (!imageFile) continue;

    try {
      // Upload to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${recipeId}/${Date.now()}-${i}.${fileExt}`;
      
      console.log(`Uploading image ${i + 1}: ${fileName}`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, imageFile);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        console.log('This might be because the storage bucket does not exist yet.');
        console.log('Please create the "recipe-images" bucket in your Supabase dashboard.');
        continue;
      }

      // Get the public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(uploadData.path);
      
      const publicUrl = urlData.publicUrl;
      console.log(`Image uploaded successfully: ${publicUrl}`);

      // Get image dimensions
      const dimensions = await getImageDimensions(imageFile);
      
      // Save image metadata to database
      const { error: dbError } = await supabase
        .from('recipe_images')
        .insert({
          recipe_id: recipeId,
          image_url: publicUrl, // Use the full public URL
          alt_text: imageFile.name,
          file_size: imageFile.size,
          mime_type: imageFile.type,
          width: dimensions.width,
          height: dimensions.height,
          is_primary: i === 0, // First image is primary
          sort_order: i
        });
      
      if (dbError) {
        console.error('Database error:', dbError);
      } else {
        console.log(`Image metadata saved to database`);
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }
}

export async function createRecipe(formData: FormData) {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  try {
    // Parse form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const cookTime = parseInt(formData.get("cookTime") as string); // Convert to number
    const difficulty = formData.get("difficulty") as string || null; // Simple text field, can be null
    const category = formData.get("category") as string;
    const ingredients = JSON.parse(formData.get("ingredients") as string || "[]");
    const instructions = JSON.parse(formData.get("instructions") as string || "[]");

    // Validation
    if (!title || title.trim().length < 3) {
      return {
        success: false,
        error: "Title must be at least 3 characters long"
      };
    }

    if (!description || description.trim().length < 10) {
      return {
        success: false,
        error: "Description must be at least 10 characters long"
      };
    }

    if (cookTime === null || cookTime === undefined || isNaN(cookTime) || cookTime < 1) {
      return {
        success: false,
        error: "Cook time must be a positive number"
      };
    }

    // Remove difficulty validation since we allow flexible values
    // The difficulty field is optional and can be any string or null


    if (!ingredients || ingredients.length === 0) {
      return {
        success: false,
        error: "At least one ingredient is required"
      };
    }

    if (!instructions || instructions.length === 0) {
      return {
        success: false,
        error: "At least one instruction is required"
      };
    }

    // Create recipe data
    const recipeData = {
      title: title.trim(),
      description: description.trim(),
      cooking_time: cookTime,
      difficulty: difficulty || "", // Simple text field, can be null
      category: category || "General",
      user_id: session.user.id,
      ingredients: ingredients || [],
      instructions: instructions || []
    };

    // Debug logging
    console.log("Creating recipe with difficulty:", difficulty);

    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("recipes")
      .insert([recipeData])
      .select()
      .single();

    if (error) {
      console.error("Error creating recipe:", error);
      return {
        success: false,
        error: error.message || "Failed to create recipe"
      };
    }

        // Note: Image uploads are now handled separately in the form component

    revalidatePath("/dashboard");
    revalidatePath("/recipes");
    revalidatePath("/my-recipes");
    
    return {
      success: true,
      recipeId: data.id
    };
  } catch (error) {
    console.error("Error creating recipe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create recipe"
    };
  }
}

export async function updateRecipe(recipeId: string, formData: FormData) {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  try {
    // First, fetch the existing recipe to verify it exists and belongs to the user
    const supabase = await createSupabaseServerClient();
    
    const { data: existingRecipe, error: fetchError } = await supabase
      .from("recipes")
      .select("id, title, user_id")
      .eq("id", recipeId)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !existingRecipe) {
      console.error("Error fetching recipe for update:", fetchError);
      return {
        success: false,
        error: "Recipe not found or you don't have permission to update it"
      };
    }

    console.log("Found recipe to update:", existingRecipe.title, "ID:", existingRecipe.id);

    // Parse form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const cookTime = parseInt(formData.get("cookTime") as string); // Convert to number
    const difficulty = formData.get("difficulty") as string || null; // Simple text field, can be null
    const category = formData.get("category") as string;
    const ingredients = JSON.parse(formData.get("ingredients") as string || "[]");
    const instructions = JSON.parse(formData.get("instructions") as string || "[]");

    // Validation
    if (!title || title.trim().length < 3) {
      return {
        success: false,
        error: "Title must be at least 3 characters long"
      };
    }

    if (!description || description.trim().length < 10) {
      return {
        success: false,
        error: "Description must be at least 10 characters long"
      };
    }

    if (cookTime === null || cookTime === undefined || isNaN(cookTime) || cookTime < 1) {
      return {
        success: false,
        error: "Cook time must be a positive number"
      };
    }

    // Remove difficulty validation since we allow flexible values
    // The difficulty field is optional and can be any string or null


    if (!ingredients || ingredients.length === 0) {
      return {
        success: false,
        error: "At least one ingredient is required"
      };
    }

    if (!instructions || instructions.length === 0) {
      return {
        success: false,
        error: "At least one instruction is required"
      };
    }

    // Update recipe data
    const recipeData = {
      id: recipeId, // Include recipe ID for updates
      title: title.trim(),
      description: description.trim(),
      cooking_time: cookTime,
      difficulty: difficulty || null, // Simple text field, can be null
      category: category || "General",
      ingredients: ingredients || [],
      instructions: instructions || []
    };

    // Debug logging
    console.log("Updating recipe ID:", recipeId, "with difficulty:", difficulty);
    
    const { error } = await supabase
      .from("recipes")
      .update(recipeData)
      .eq("id", recipeId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error updating recipe:", error);
      return {
        success: false,
        error: error.message || "Failed to update recipe"
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/recipes");
    revalidatePath("/my-recipes");
    revalidatePath(`/recipes/${recipeId}`);
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error updating recipe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update recipe"
    };
  }
}

export async function getRecipe(recipeId: string) {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("recipes")
      .select(`
        id,
        title,
        description,
        cooking_time,
        difficulty,
        category,
        ingredients,
        instructions,
        user_id,
        created_at
      `)
      .eq("id", recipeId)
      .eq("user_id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching recipe:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch recipe"
      };
    }

    if (!data) {
      return {
        success: false,
        error: "Recipe not found"
      };
    }

    // Transform the data to match our interface
    const recipe = {
      id: data.id,
      title: data.title,
      description: data.description,
      cookTime: data.cooking_time,
      difficulty: data.difficulty || "", // Allow any text or empty (handles null)
      category: data.category,
      ingredients: data.ingredients || [],
      instructions: data.instructions || [],
      createdAt: data.created_at
    };

    return {
      success: true,
      recipe
    };
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch recipe"
    };
  }
}

export async function deleteRecipe(recipeId: string) {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/sign-in");
  }

  try {
    const supabase = await createSupabaseServerClient();
    
    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", recipeId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error deleting recipe:", error);
      return {
        success: false,
        error: error.message || "Failed to delete recipe"
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/recipes");
    revalidatePath("/my-recipes");
    
    return {
      success: true
    };
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete recipe"
    };
  }
}