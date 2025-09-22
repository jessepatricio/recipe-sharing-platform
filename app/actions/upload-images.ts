"use server";

import { createSupabaseServerClient } from "../../lib/supabase/server";
import { getServerSession } from "../../lib/supabase/server";

// Helper function to get image dimensions (simplified for server-side)
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  // For server-side, we'll use default dimensions
  // In a production app, you might want to use a library like 'sharp' for image processing
  return { width: 800, height: 600 };
}

export async function uploadRecipeImages(recipeId: string, images: File[]): Promise<{ success: boolean; error?: string; imageUrls?: string[] }> {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return { success: false, error: "User not authenticated" };
    }

    if (!images || images.length === 0) {
      return { success: true, imageUrls: [] };
    }

    const supabase = await createSupabaseServerClient();
    const imageUrls: string[] = [];

    console.log(`Uploading ${images.length} images for recipe ${recipeId}`);

    for (let i = 0; i < images.length; i++) {
      const imageFile = images[i];
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
          // Try alternative approach - upload to a different path
          const altFileName = `public/${recipeId}/${Date.now()}-${i}.${fileExt}`;
          const { data: altUploadData, error: altUploadError } = await supabase.storage
            .from('recipe-images')
            .upload(altFileName, imageFile);
          
          if (altUploadError) {
            console.error('Alternative upload also failed:', altUploadError);
            continue;
          }
          
          // Use alternative upload data
          const { data: urlData } = supabase.storage
            .from('recipe-images')
            .getPublicUrl(altUploadData.path);
          
          imageUrls.push(urlData.publicUrl);
          
          // Save to database with alternative path
          const dimensions = await getImageDimensions(imageFile);
          await supabase
            .from('recipe_images')
            .insert({
              recipe_id: recipeId,
              image_url: urlData.publicUrl,
              alt_text: imageFile.name,
              file_size: imageFile.size,
              mime_type: imageFile.type,
              width: dimensions.width,
              height: dimensions.height,
              is_primary: i === 0,
              sort_order: i
            });
        } else {
          // Get the public URL for the uploaded image
          const { data: urlData } = supabase.storage
            .from('recipe-images')
            .getPublicUrl(uploadData.path);
          
          imageUrls.push(urlData.publicUrl);
          console.log(`Image uploaded successfully: ${urlData.publicUrl}`);

          // Get image dimensions
          const dimensions = await getImageDimensions(imageFile);
          
          // Save image metadata to database
          const { error: dbError } = await supabase
            .from('recipe_images')
            .insert({
              recipe_id: recipeId,
              image_url: urlData.publicUrl,
              alt_text: imageFile.name,
              file_size: imageFile.size,
              mime_type: imageFile.type,
              width: dimensions.width,
              height: dimensions.height,
              is_primary: i === 0,
              sort_order: i
            });
          
          if (dbError) {
            console.error('Database error:', dbError);
          } else {
            console.log(`Image metadata saved to database`);
          }
        }
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    return { success: true, imageUrls };
  } catch (error) {
    console.error('Error in uploadRecipeImages:', error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
