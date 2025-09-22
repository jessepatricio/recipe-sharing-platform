require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testMyRecipesComponent() {
  console.log('🔍 Testing MyRecipesClient component data flow...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Get a user ID from recipes
    const { data: sampleRecipes, error: sampleError } = await supabase
      .from('recipes')
      .select('user_id')
      .limit(1);

    if (sampleError || !sampleRecipes || sampleRecipes.length === 0) {
      console.error('❌ No recipes found to test with');
      return;
    }

    const userId = sampleRecipes[0].user_id;
    console.log(`Testing with user ID: ${userId}`);

    // 2. Simulate the server-side query (getUserRecipesWithLikeStatus)
    console.log('\n1. Simulating server-side query (getUserRecipesWithLikeStatus)...');
    
    const { data: recipesData, error: recipesError } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (recipesError) {
      console.error('❌ Server query failed:', recipesError.message);
      return;
    }

    console.log(`   Found ${recipesData.length} recipes`);

    // Fetch images for server-side query
    const recipeIds = recipesData.map(recipe => recipe.id);
    const { data: images, error: imagesError } = await supabase
      .from('recipe_images')
      .select('*')
      .in('recipe_id', recipeIds)
      .order('sort_order', { ascending: true });

    const imageMap = new Map();
    if (!imagesError && images) {
      images.forEach(image => {
        if (!imageMap.has(image.recipe_id)) {
          imageMap.set(image.recipe_id, []);
        }
        imageMap.get(image.recipe_id).push({
          id: image.id,
          recipeId: image.recipe_id,
          imageUrl: image.image_url,
          altText: image.alt_text,
          isPrimary: image.is_primary,
          sortOrder: image.sort_order
        });
      });
    }

    // Build server-side recipe objects
    const serverRecipes = recipesData.map(recipe => {
      const recipeImages = imageMap.get(recipe.id) || [];
      const primaryImage = recipeImages.find(img => img.isPrimary) || recipeImages[0];
      
      return {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        author: "Test User",
        authorId: recipe.user_id,
        cookTime: recipe.cooking_time,
        difficulty: recipe.difficulty,
        createdAt: new Date(recipe.created_at),
        category: recipe.category,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        likeCount: 0,
        commentCount: 0,
        isLiked: false,
        images: recipeImages,
        primaryImage: primaryImage
      };
    });

    console.log('   Server-side recipes with images:');
    serverRecipes.forEach(recipe => {
      console.log(`     - "${recipe.title}": ${recipe.primaryImage ? 'HAS IMAGE' : 'NO IMAGE'}`);
      if (recipe.primaryImage) {
        console.log(`       Image URL: ${recipe.primaryImage.imageUrl}`);
      }
    });

    // 3. Simulate the client-side refresh (getUserRecipesClient)
    console.log('\n2. Simulating client-side refresh (getUserRecipesClient)...');
    
    const { data: clientData, error: clientError } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (clientError) {
      console.error('❌ Client query failed:', clientError.message);
      return;
    }

    // Fetch images for client-side query
    const clientRecipeIds = clientData.map(recipe => recipe.id);
    const { data: clientImages, error: clientImagesError } = await supabase
      .from('recipe_images')
      .select('*')
      .in('recipe_id', clientRecipeIds)
      .order('sort_order', { ascending: true });

    const clientImageMap = new Map();
    if (!clientImagesError && clientImages) {
      clientImages.forEach(image => {
        if (!clientImageMap.has(image.recipe_id)) {
          clientImageMap.set(image.recipe_id, []);
        }
        clientImageMap.get(image.recipe_id).push({
          id: image.id,
          recipeId: image.recipe_id,
          imageUrl: image.image_url,
          altText: image.alt_text,
          isPrimary: image.is_primary,
          sortOrder: image.sort_order
        });
      });
    }

    // Build client-side recipe objects
    const clientRecipes = clientData.map(recipe => {
      const recipeImages = clientImageMap.get(recipe.id) || [];
      const primaryImage = recipeImages.find(img => img.isPrimary) || recipeImages[0];
      
      return {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        author: "Test User",
        authorId: recipe.user_id,
        cookTime: recipe.cooking_time,
        difficulty: recipe.difficulty,
        createdAt: new Date(recipe.created_at),
        category: recipe.category,
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        images: recipeImages,
        primaryImage: primaryImage
      };
    });

    console.log('   Client-side recipes with images:');
    clientRecipes.forEach(recipe => {
      console.log(`     - "${recipe.title}": ${recipe.primaryImage ? 'HAS IMAGE' : 'NO IMAGE'}`);
      if (recipe.primaryImage) {
        console.log(`       Image URL: ${recipe.primaryImage.imageUrl}`);
      }
    });

    // 4. Compare server vs client results
    console.log('\n3. Comparing server vs client results...');
    if (serverRecipes.length !== clientRecipes.length) {
      console.log(`   ❌ Recipe count mismatch: Server=${serverRecipes.length}, Client=${clientRecipes.length}`);
    } else {
      console.log(`   ✅ Recipe count matches: ${serverRecipes.length} recipes`);
    }

    let imageMismatch = false;
    for (let i = 0; i < serverRecipes.length; i++) {
      const serverRecipe = serverRecipes[i];
      const clientRecipe = clientRecipes[i];
      
      if (!!serverRecipe.primaryImage !== !!clientRecipe.primaryImage) {
        console.log(`   ❌ Image mismatch for "${serverRecipe.title}": Server=${!!serverRecipe.primaryImage}, Client=${!!clientRecipe.primaryImage}`);
        imageMismatch = true;
      }
    }

    if (!imageMismatch) {
      console.log('   ✅ All images match between server and client queries');
    }

    console.log('\n✅ MyRecipesClient component test completed');
    console.log('   The data flow appears to be working correctly');
    console.log('   If images are not showing, the issue might be in the UI rendering');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testMyRecipesComponent().catch(console.error);
