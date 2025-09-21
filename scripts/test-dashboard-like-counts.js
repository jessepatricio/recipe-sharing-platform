const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test script to verify dashboard like counts
async function testDashboardLikeCounts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing dashboard like counts...');
    
    // Test the getRecipesWithLikeStatus function
    console.log('\n1. Testing getRecipesWithLikeStatus function:');
    
    // Simulate what the dashboard does
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (recipesError) {
      console.error('❌ Error fetching recipes:', recipesError.message);
      return;
    }

    console.log('📊 Recipes from database:');
    recipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    // Check actual likes in database
    console.log('\n2. Checking actual likes in database:');
    for (const recipe of recipes) {
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('id, user_id, created_at')
        .eq('recipe_id', recipe.id);
      
      if (likesError) {
        console.error(`❌ Error fetching likes for ${recipe.title}:`, likesError.message);
      } else {
        console.log(`   ${recipe.title}: ${likes.length} actual likes`);
        if (likes.length > 0) {
          likes.forEach(like => {
            console.log(`     - User ${like.user_id} at ${like.created_at}`);
          });
        }
      }
    }

    // Test like insertion (this will fail due to RLS, but we can see the structure)
    console.log('\n3. Testing like insertion structure:');
    const testRecipe = recipes[0];
    const testUserId = '00000000-0000-0000-0000-000000000000';
    
    // Try to insert a like
    const { data: likeData, error: likeError } = await supabase
      .from('likes')
      .insert({
        recipe_id: testRecipe.id,
        user_id: testUserId
      })
      .select('id');

    if (likeError) {
      console.log('ℹ️  Like insertion failed due to RLS (expected):', likeError.message);
      console.log('   This is correct behavior - only authenticated users can like');
    } else {
      console.log('✅ Like insertion successful:', likeData);
      
      // Check if like_count was updated
      const { data: updatedRecipe } = await supabase
        .from('recipes')
        .select('like_count')
        .eq('id', testRecipe.id)
        .single();
      
      console.log(`   Original like_count: ${testRecipe.like_count}`);
      console.log(`   Updated like_count: ${updatedRecipe?.like_count}`);
      
      // Clean up
      await supabase
        .from('likes')
        .delete()
        .eq('id', likeData[0].id);
      console.log('✅ Test like cleaned up');
    }

    // Check if there are any database triggers working
    console.log('\n4. Checking database triggers:');
    const { data: triggerInfo, error: triggerError } = await supabase
      .rpc('get_trigger_info', { table_name: 'likes' })
      .single();

    if (triggerError) {
      console.log('ℹ️  Could not check triggers directly (this is normal)');
    } else {
      console.log('Trigger info:', triggerInfo);
    }

    console.log('\n🎉 Dashboard like counts test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testDashboardLikeCounts();
