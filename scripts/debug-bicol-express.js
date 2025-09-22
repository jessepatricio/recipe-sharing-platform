require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Debug script specifically for Bicol Express like count issue
async function debugBicolExpress() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Debugging Bicol Express like count issue...\n');

    // 1. Find Bicol Express recipe
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count, user_id, created_at')
      .ilike('title', '%Bicol Express%');

    if (recipesError) {
      console.error('❌ Error fetching Bicol Express:', recipesError.message);
      return;
    }

    if (!recipes || recipes.length === 0) {
      console.error('❌ Bicol Express recipe not found');
      return;
    }

    const bicolRecipe = recipes[0];
    console.log(`📝 Found Bicol Express recipe:`);
    console.log(`   ID: ${bicolRecipe.id}`);
    console.log(`   Title: ${bicolRecipe.title}`);
    console.log(`   Owner: ${bicolRecipe.user_id}`);
    console.log(`   Stored like_count: ${bicolRecipe.like_count}`);
    console.log(`   Created: ${bicolRecipe.created_at}\n`);

    // 2. Count actual likes in database
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('id, user_id, created_at')
      .eq('recipe_id', bicolRecipe.id)
      .order('created_at', { ascending: true });

    if (likesError) {
      console.error('❌ Error counting likes:', likesError.message);
      return;
    }

    console.log(`💖 Actual likes in database: ${likes.length}`);
    likes.forEach((like, index) => {
      console.log(`   ${index + 1}. User: ${like.user_id}, Created: ${like.created_at}`);
    });

    // 3. Test the query functions that the UI uses
    console.log('\n🔍 Testing query functions used by UI...\n');

    // Test getRecipesWithLikeStatus (used by dashboard)
    console.log('1. Testing getRecipesWithLikeStatus (Dashboard)...');
    const { data: dashboardRecipes, error: dashboardError } = await supabase
      .from('recipes')
      .select('id, title, like_count, user_id')
      .eq('id', bicolRecipe.id);

    if (dashboardError) {
      console.error('❌ Dashboard query error:', dashboardError.message);
    } else {
      const dashboardRecipe = dashboardRecipes[0];
      console.log(`   Dashboard shows: ${dashboardRecipe.like_count} likes`);
    }

    // Test getUserRecipesWithLikeStatus (used by my-recipes)
    console.log('\n2. Testing getUserRecipesWithLikeStatus (My Recipes)...');
    const { data: myRecipes, error: myRecipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count, user_id')
      .eq('id', bicolRecipe.id)
      .eq('user_id', bicolRecipe.user_id);

    if (myRecipesError) {
      console.error('❌ My Recipes query error:', myRecipesError.message);
    } else {
      if (myRecipes && myRecipes.length > 0) {
        const myRecipe = myRecipes[0];
        console.log(`   My Recipes shows: ${myRecipe.like_count} likes`);
      } else {
        console.log('   Recipe not found in user\'s recipes');
      }
    }

    // Test getRecipeWithLikeStatus (used by individual recipe page)
    console.log('\n3. Testing getRecipeWithLikeStatus (Individual Recipe)...');
    const { data: singleRecipe, error: singleRecipeError } = await supabase
      .from('recipes')
      .select('id, title, like_count, user_id')
      .eq('id', bicolRecipe.id)
      .single();

    if (singleRecipeError) {
      console.error('❌ Single recipe query error:', singleRecipeError.message);
    } else {
      console.log(`   Individual page shows: ${singleRecipe.like_count} likes`);
    }

    // 4. Check if there are any RLS issues
    console.log('\n🔍 Checking for RLS or permission issues...');
    
    // Try to update the like_count directly
    console.log('4. Testing direct like_count update...');
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ like_count: likes.length })
      .eq('id', bicolRecipe.id);

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      console.error('   This might be an RLS permission issue');
    } else {
      console.log('✅ Update successful');
      
      // Verify the update
      const { data: updatedRecipe } = await supabase
        .from('recipes')
        .select('like_count')
        .eq('id', bicolRecipe.id)
        .single();
      
      console.log(`   Updated like_count: ${updatedRecipe.like_count}`);
    }

    console.log('\n🎉 Debug completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

debugBicolExpress();
