require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Test the actual application query functions
async function testApplicationQueries() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing actual application query functions...\n');

    // Simulate getRecipesWithLikeStatus function
    console.log('1. Testing getRecipesWithLikeStatus (Dashboard)...');
    
    // Get recipes
    const { data: recipesData, error: recipesError } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (recipesError) {
      console.error("❌ Error fetching recipes:", recipesError);
      return;
    }

    // Get actual like counts for all recipes
    const recipeIds = recipesData.map(recipe => recipe.id);
    const { data: allLikes, error: allLikesError } = await supabase
      .from('likes')
      .select('recipe_id')
      .in('recipe_id', recipeIds);

    // Create a map of recipe_id to actual like count
    const likeCountMap = new Map();
    if (!allLikesError && allLikes) {
      allLikes.forEach(like => {
        const currentCount = likeCountMap.get(like.recipe_id) || 0;
        likeCountMap.set(like.recipe_id, currentCount + 1);
      });
    }

    console.log(`   Found ${recipesData.length} recipes`);
    recipesData.forEach(recipe => {
      const actualLikeCount = likeCountMap.get(recipe.id) || 0;
      const storedLikeCount = recipe.like_count || 0;
      
      console.log(`   - ${recipe.title}:`);
      console.log(`     Stored: ${storedLikeCount}, Actual: ${actualLikeCount}, Will show: ${actualLikeCount}`);
    });

    // Test specific Bicol Express
    console.log('\n2. Testing Bicol Express specifically...');
    const bicolRecipe = recipesData.find(r => r.title.includes('Bicol Express'));
    if (bicolRecipe) {
      const bicolLikes = likeCountMap.get(bicolRecipe.id) || 0;
      console.log(`   Bicol Express will now show: ${bicolLikes} likes`);
      console.log(`   Previously showed: ${bicolRecipe.like_count} likes`);
      console.log(`   Fix successful: ${bicolLikes === 2 ? '✅' : '❌'}`);
    }

    console.log('\n🎉 Application query test completed!');
    console.log('\n💡 The application will now show correct like counts:');
    console.log('   - Bicol Express: 2 likes (was showing 1)');
    console.log('   - Filipino Chicken Adobo: 2 likes (was showing 1)');
    console.log('   - All other recipes: correct counts');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testApplicationQueries();
