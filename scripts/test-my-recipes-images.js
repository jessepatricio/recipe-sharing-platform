require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testMyRecipesImages() {
  console.log('🔍 Testing My Recipes page image display...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Test server-side query (getUserRecipesWithLikeStatus simulation)
    console.log('1. Testing server-side query simulation...');
    
    // First, get a user ID from the recipes table
    const { data: sampleRecipes, error: sampleError } = await supabase
      .from('recipes')
      .select('user_id')
      .limit(1);

    if (sampleError || !sampleRecipes || sampleRecipes.length === 0) {
      console.error('❌ No recipes found to test with');
      return;
    }

    const userId = sampleRecipes[0].user_id;
    console.log(`   Testing with user ID: ${userId}`);

    // Simulate getUserRecipesWithLikeStatus
    const { data: recipesData, error: recipesError } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (recipesError) {
      console.error('❌ Error fetching user recipes:', recipesError.message);
      return;
    }

    console.log(`   Found ${recipesData.length} recipes for user`);

    if (recipesData.length === 0) {
      console.log('   No recipes found for this user');
      return;
    }

    // 2. Test image fetching for these recipes
    console.log('\n2. Testing image fetching...');
    const recipeIds = recipesData.map(recipe => recipe.id);
    
    const { data: images, error: imagesError } = await supabase
      .from('recipe_images')
      .select('*')
      .in('recipe_id', recipeIds)
      .order('sort_order', { ascending: true });

    if (imagesError) {
      console.error('❌ Error fetching images:', imagesError.message);
    } else {
      console.log(`   Found ${images.length} images for user's recipes`);
      
      // Group images by recipe_id
      const imageMap = new Map();
      images.forEach(image => {
        if (!imageMap.has(image.recipe_id)) {
          imageMap.set(image.recipe_id, []);
        }
        imageMap.get(image.recipe_id).push(image);
      });

      // Check each recipe
      recipesData.forEach(recipe => {
        const recipeImages = imageMap.get(recipe.id) || [];
        const primaryImage = recipeImages.find(img => img.is_primary) || recipeImages[0];
        
        console.log(`   Recipe "${recipe.title}":`);
        console.log(`     - Total images: ${recipeImages.length}`);
        if (primaryImage) {
          console.log(`     - Primary image: ${primaryImage.image_url}`);
        } else {
          console.log(`     - No primary image`);
        }
      });
    }

    // 3. Test client-side query simulation
    console.log('\n3. Testing client-side query simulation...');
    
    // Simulate getUserRecipesClient
    const { data: clientRecipes, error: clientError } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (clientError) {
      console.error('❌ Client query failed:', clientError.message);
    } else {
      console.log(`   Client query successful (${clientRecipes.length} recipes)`);
      
      // Simulate the image fetching that happens in client queries
      for (const recipe of clientRecipes) {
        const { data: recipeImages } = await supabase
          .from('recipe_images')
          .select('*')
          .eq('recipe_id', recipe.id)
          .order('sort_order', { ascending: true });

        const primaryImage = recipeImages?.find(img => img.is_primary) || recipeImages?.[0];
        
        console.log(`   Recipe "${recipe.title}":`);
        if (primaryImage) {
          console.log(`     ✅ Primary image available: ${primaryImage.image_url}`);
        } else {
          console.log(`     ❌ No primary image found`);
        }
      }
    }

    // 4. Test the actual data structure that would be passed to RecipeCard
    console.log('\n4. Testing RecipeCard data structure...');
    for (const recipe of recipesData) {
      const { data: recipeImages } = await supabase
        .from('recipe_images')
        .select('*')
        .eq('recipe_id', recipe.id)
        .order('sort_order', { ascending: true });

      const primaryImage = recipeImages?.find(img => img.is_primary) || recipeImages?.[0];
      
      const recipeData = {
        id: recipe.id,
        title: recipe.title,
        primaryImage: primaryImage ? {
          imageUrl: primaryImage.image_url,
          altText: primaryImage.alt_text,
          isPrimary: primaryImage.is_primary
        } : null
      };

      console.log(`   Recipe "${recipeData.title}":`);
      console.log(`     - primaryImage: ${recipeData.primaryImage ? 'EXISTS' : 'NULL'}`);
      if (recipeData.primaryImage) {
        console.log(`     - imageUrl: ${recipeData.primaryImage.imageUrl}`);
      }
    }

    console.log('\n✅ My Recipes image test completed');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testMyRecipesImages().catch(console.error);
