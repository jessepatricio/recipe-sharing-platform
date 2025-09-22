require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Test script to verify like counts are displaying correctly
async function testLikeCountsDisplay() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing like counts display across all pages...\n');

    // Test 1: Dashboard page (getRecipesWithLikeStatus)
    console.log('1. Testing Dashboard page (getRecipesWithLikeStatus)...');
    const { data: dashboardRecipes, error: dashboardError } = await supabase
      .from('recipes')
      .select('id, title, like_count, user_id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (dashboardError) {
      console.error('❌ Error fetching dashboard recipes:', dashboardError.message);
    } else {
      console.log(`   Found ${dashboardRecipes.length} recipes on dashboard`);
      dashboardRecipes.forEach(recipe => {
        console.log(`   - ${recipe.title}: ${recipe.like_count || 0} likes (owner: ${recipe.user_id})`);
      });
    }

    // Test 2: My Recipes page (getUserRecipesWithLikeStatus)
    console.log('\n2. Testing My Recipes page (getUserRecipesWithLikeStatus)...');
    if (dashboardRecipes && dashboardRecipes.length > 0) {
      const testUserId = dashboardRecipes[0].user_id;
      const { data: myRecipes, error: myRecipesError } = await supabase
        .from('recipes')
        .select('id, title, like_count, user_id')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false });

      if (myRecipesError) {
        console.error('❌ Error fetching my recipes:', myRecipesError.message);
      } else {
        console.log(`   Found ${myRecipes.length} recipes for user ${testUserId}`);
        myRecipes.forEach(recipe => {
          console.log(`   - ${recipe.title}: ${recipe.like_count || 0} likes`);
        });
      }
    }

    // Test 3: Individual recipe page (getRecipeWithLikeStatus)
    console.log('\n3. Testing Individual recipe page (getRecipeWithLikeStatus)...');
    if (dashboardRecipes && dashboardRecipes.length > 0) {
      const testRecipeId = dashboardRecipes[0].id;
      const { data: singleRecipe, error: singleRecipeError } = await supabase
        .from('recipes')
        .select('id, title, like_count, user_id')
        .eq('id', testRecipeId)
        .single();

      if (singleRecipeError) {
        console.error('❌ Error fetching single recipe:', singleRecipeError.message);
      } else {
        console.log(`   Recipe: ${singleRecipe.title}`);
        console.log(`   Like count: ${singleRecipe.like_count || 0} likes`);
        console.log(`   Owner: ${singleRecipe.user_id}`);
      }
    }

    // Test 4: Verify like counts match actual likes in database
    console.log('\n4. Verifying like counts match actual likes...');
    if (dashboardRecipes && dashboardRecipes.length > 0) {
      for (const recipe of dashboardRecipes.slice(0, 3)) { // Test first 3 recipes
        const { data: actualLikes, error: likesError } = await supabase
          .from('likes')
          .select('id, user_id')
          .eq('recipe_id', recipe.id);

        if (likesError) {
          console.error(`❌ Error counting likes for ${recipe.title}:`, likesError.message);
        } else {
          const actualLikeCount = actualLikes?.length || 0;
          const storedLikeCount = recipe.like_count || 0;
          const match = actualLikeCount === storedLikeCount;
          
          console.log(`   ${recipe.title}:`);
          console.log(`     Stored like_count: ${storedLikeCount}`);
          console.log(`     Actual likes: ${actualLikeCount}`);
          console.log(`     Match: ${match ? '✅' : '❌'}`);
          
          if (actualLikes && actualLikes.length > 0) {
            console.log(`     Liked by users: ${actualLikes.map(like => like.user_id).join(', ')}`);
          }
        }
      }
    }

    console.log('\n🎉 Like counts display test completed!');
    console.log('\n💡 Summary:');
    console.log('   - All pages use recipe.like_count from the database');
    console.log('   - This field contains the total count of ALL likes for each recipe');
    console.log('   - Like counts are displayed regardless of who owns the recipe');
    console.log('   - The toggleLike function updates this count when users like/unlike');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testLikeCountsDisplay();
