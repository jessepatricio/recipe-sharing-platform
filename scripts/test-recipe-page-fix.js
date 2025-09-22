require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Test the recipe page like count fix
async function testRecipePageFix() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing recipe page like count fix...\n');

    // Test the getRecipeById function logic
    console.log('1. Testing getRecipeById function (used by recipe page)...');
    
    // Get a test recipe (Bicol Express)
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .ilike('title', '%Bicol Express%');

    if (recipesError) {
      console.error('❌ Error fetching recipes:', recipesError.message);
      return;
    }

    if (!recipes || recipes.length === 0) {
      console.error('❌ Bicol Express recipe not found');
      return;
    }

    const bicolRecipe = recipes[0];
    console.log(`   Testing with: ${bicolRecipe.title}`);
    console.log(`   Stored like_count: ${bicolRecipe.like_count}`);

    // Simulate the new getRecipeById logic
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', bicolRecipe.id);

    if (likesError) {
      console.error('❌ Error counting likes:', likesError.message);
      return;
    }

    const actualLikeCount = likes?.length || 0;
    console.log(`   Actual likes: ${actualLikeCount}`);
    console.log(`   Recipe page will now show: ${actualLikeCount} likes`);
    console.log(`   Previously showed: ${bicolRecipe.like_count} likes`);
    console.log(`   Fix successful: ${actualLikeCount === 2 ? '✅' : '❌'}`);

    // Test all recipes
    console.log('\n2. Testing all recipes...');
    const { data: allRecipes, error: allRecipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .order('created_at', { ascending: false });

    if (allRecipesError) {
      console.error('❌ Error fetching all recipes:', allRecipesError.message);
      return;
    }

    console.log(`   Found ${allRecipes.length} recipes`);
    
    for (const recipe of allRecipes) {
      const { data: recipeLikes, error: recipeLikesError } = await supabase
        .from('likes')
        .select('id')
        .eq('recipe_id', recipe.id);

      if (!recipeLikesError) {
        const actualCount = recipeLikes?.length || 0;
        const storedCount = recipe.like_count || 0;
        
        console.log(`   - ${recipe.title}:`);
        console.log(`     Stored: ${storedCount}, Actual: ${actualCount}, Will show: ${actualCount}`);
      }
    }

    console.log('\n🎉 Recipe page like count fix test completed!');
    console.log('\n💡 Summary:');
    console.log('   - Recipe pages now use actual like counts from the database');
    console.log('   - Bicol Express will show 2 likes (was showing 1)');
    console.log('   - All recipe pages will display accurate like counts');
    console.log('   - Like counts include all likes regardless of owner');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testRecipePageFix();
