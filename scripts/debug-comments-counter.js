require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Debug script for comments counter issue
async function debugCommentsCounter() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Debugging comments counter issue...\n');

    // 1. Find Bicol Express recipe
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, comment_count')
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
    console.log(`📝 Bicol Express recipe:`);
    console.log(`   ID: ${bicolRecipe.id}`);
    console.log(`   Title: ${bicolRecipe.title}`);
    console.log(`   Stored comment_count: ${bicolRecipe.comment_count}\n`);

    // 2. Count actual comments in database
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, user_id, content, created_at')
      .eq('recipe_id', bicolRecipe.id)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('❌ Error counting comments:', commentsError.message);
      return;
    }

    console.log(`💬 Actual comments in database: ${comments.length}`);
    comments.forEach((comment, index) => {
      console.log(`   ${index + 1}. User: ${comment.user_id}, Created: ${comment.created_at}`);
      console.log(`      Content: ${comment.content.substring(0, 50)}...`);
    });

    // 3. Test all query functions that return comment counts
    console.log('\n🔍 Testing query functions used by UI...\n');

    // Test getRecipesWithLikeStatus (Dashboard)
    console.log('1. Testing getRecipesWithLikeStatus (Dashboard)...');
    const { data: dashboardRecipes, error: dashboardError } = await supabase
      .from('recipes')
      .select('id, title, comment_count')
      .eq('id', bicolRecipe.id);

    if (dashboardError) {
      console.error('❌ Dashboard query error:', dashboardError.message);
    } else {
      const dashboardRecipe = dashboardRecipes[0];
      console.log(`   Dashboard shows: ${dashboardRecipe.comment_count} comments`);
    }

    // Test getUserRecipesWithLikeStatus (My Recipes)
    console.log('\n2. Testing getUserRecipesWithLikeStatus (My Recipes)...');
    const { data: myRecipes, error: myRecipesError } = await supabase
      .from('recipes')
      .select('id, title, comment_count')
      .eq('id', bicolRecipe.id)
      .eq('user_id', bicolRecipe.user_id);

    if (myRecipesError) {
      console.error('❌ My Recipes query error:', myRecipesError.message);
    } else {
      if (myRecipes && myRecipes.length > 0) {
        const myRecipe = myRecipes[0];
        console.log(`   My Recipes shows: ${myRecipe.comment_count} comments`);
      } else {
        console.log('   Recipe not found in user\'s recipes');
      }
    }

    // Test getRecipeById (Individual Recipe Page)
    console.log('\n3. Testing getRecipeById (Individual Recipe Page)...');
    const { data: singleRecipe, error: singleRecipeError } = await supabase
      .from('recipes')
      .select('id, title, comment_count')
      .eq('id', bicolRecipe.id)
      .single();

    if (singleRecipeError) {
      console.error('❌ Single recipe query error:', singleRecipeError.message);
    } else {
      console.log(`   Individual page shows: ${singleRecipe.comment_count} comments`);
    }

    // 4. Check if there are any RLS issues with comment updates
    console.log('\n🔍 Checking for RLS or permission issues...');
    
    // Try to update the comment_count directly
    console.log('4. Testing direct comment_count update...');
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ comment_count: comments.length })
      .eq('id', bicolRecipe.id);

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      console.error('   This might be an RLS permission issue');
    } else {
      console.log('✅ Update successful');
      
      // Verify the update
      const { data: updatedRecipe } = await supabase
        .from('recipes')
        .select('comment_count')
        .eq('id', bicolRecipe.id)
        .single();
      
      console.log(`   Updated comment_count: ${updatedRecipe.comment_count}`);
    }

    console.log('\n🎉 Comments counter debug completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

debugCommentsCounter();
