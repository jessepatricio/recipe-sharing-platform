const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Check database directly
async function checkDbDirectly() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Checking database directly...');
    
    // Check if we can read the recipes table
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count, created_at')
      .order('created_at', { ascending: false });

    if (recipesError) {
      console.error('❌ Error fetching recipes:', recipesError.message);
      return;
    }

    console.log('📊 Recipes in database:');
    recipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    // Check if we can update a recipe
    console.log('\n🔍 Testing recipe update...');
    const testRecipe = recipes[0];
    console.log(`   Testing with: ${testRecipe.title}`);
    console.log(`   Current like_count: ${testRecipe.like_count}`);
    
    // Try to update the like_count
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ like_count: testRecipe.like_count + 1 })
      .eq('id', testRecipe.id);
    
    if (updateError) {
      console.log('❌ Update failed:', updateError.message);
    } else {
      console.log('✅ Update successful');
      
      // Check if the update actually worked
      const { data: updatedRecipe } = await supabase
        .from('recipes')
        .select('like_count')
        .eq('id', testRecipe.id)
        .single();
      
      console.log(`   Updated like_count: ${updatedRecipe?.like_count}`);
      
      if (updatedRecipe?.like_count === testRecipe.like_count + 1) {
        console.log('✅ Update actually worked');
        
        // Revert the change
        await supabase
          .from('recipes')
          .update({ like_count: testRecipe.like_count })
          .eq('id', testRecipe.id);
        console.log('✅ Reverted test change');
      } else {
        console.log('❌ Update did not work - value unchanged');
      }
    }

    // Check actual social data
    console.log('\n🔍 Checking actual social data...');
    for (const recipe of recipes) {
      const { data: likes } = await supabase
        .from('likes')
        .select('id, user_id, created_at')
        .eq('recipe_id', recipe.id);
      
      const { data: comments } = await supabase
        .from('comments')
        .select('id, user_id, created_at')
        .eq('recipe_id', recipe.id);
      
      console.log(`\n📝 ${recipe.title}:`);
      console.log(`   Database: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
      console.log(`   Actual:   like_count=${likes?.length || 0}, comment_count=${comments?.length || 0}`);
      
      if (likes && likes.length > 0) {
        console.log(`   Likes:`);
        likes.forEach(like => {
          console.log(`     - User ${like.user_id} at ${like.created_at}`);
        });
      }
      
      if (comments && comments.length > 0) {
        console.log(`   Comments:`);
        comments.forEach(comment => {
          console.log(`     - User ${comment.user_id} at ${comment.created_at}`);
        });
      }
    }

    console.log('\n🎉 Database check completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkDbDirectly();
