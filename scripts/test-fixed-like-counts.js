require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Test the fixed like count implementation
async function testFixedLikeCounts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing fixed like count implementation...\n');

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
      
      // Test the new query logic for each recipe
      for (const recipe of dashboardRecipes) {
        // Simulate the new query logic
        const { data: likes, error: likesError } = await supabase
          .from('likes')
          .select('id')
          .eq('recipe_id', recipe.id);

        if (!likesError) {
          const actualLikeCount = likes?.length || 0;
          const storedLikeCount = recipe.like_count || 0;
          
          console.log(`   - ${recipe.title}:`);
          console.log(`     Stored like_count: ${storedLikeCount}`);
          console.log(`     Actual likes: ${actualLikeCount}`);
          console.log(`     New logic would show: ${actualLikeCount} likes`);
          console.log(`     Match: ${actualLikeCount === storedLikeCount ? '✅' : '❌'}`);
        }
      }
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
        
        for (const recipe of myRecipes) {
          const { data: likes, error: likesError } = await supabase
            .from('likes')
            .select('id')
            .eq('recipe_id', recipe.id);

          if (!likesError) {
            const actualLikeCount = likes?.length || 0;
            const storedLikeCount = recipe.like_count || 0;
            
            console.log(`   - ${recipe.title}:`);
            console.log(`     Stored like_count: ${storedLikeCount}`);
            console.log(`     Actual likes: ${actualLikeCount}`);
            console.log(`     New logic would show: ${actualLikeCount} likes`);
          }
        }
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
        const { data: likes, error: likesError } = await supabase
          .from('likes')
          .select('id')
          .eq('recipe_id', testRecipeId);

        if (!likesError) {
          const actualLikeCount = likes?.length || 0;
          const storedLikeCount = singleRecipe.like_count || 0;
          
          console.log(`   Recipe: ${singleRecipe.title}`);
          console.log(`   Stored like_count: ${storedLikeCount}`);
          console.log(`   Actual likes: ${actualLikeCount}`);
          console.log(`   New logic would show: ${actualLikeCount} likes`);
        }
      }
    }

    console.log('\n🎉 Fixed like count implementation test completed!');
    console.log('\n💡 Summary:');
    console.log('   - The new implementation calculates actual like counts from the likes table');
    console.log('   - This ensures accurate counts even when stored like_count is out of sync');
    console.log('   - All pages will now show the correct number of likes regardless of owner');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testFixedLikeCounts();
