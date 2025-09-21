const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test script to verify like functionality with a logged-in user
async function testLikeWithUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing like functionality with user authentication...');
    
    // Get a test recipe
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .limit(1);

    if (recipesError || !recipes || recipes.length === 0) {
      console.error('❌ No recipes found to test with');
      return;
    }

    const testRecipe = recipes[0];
    console.log(`\n📝 Testing with recipe: "${testRecipe.title}" (ID: ${testRecipe.id})`);
    console.log(`   Current like_count: ${testRecipe.like_count}`);

    // Check current likes for this recipe
    const { data: currentLikes, error: likesError } = await supabase
      .from('likes')
      .select('id, user_id, created_at')
      .eq('recipe_id', testRecipe.id);

    if (likesError) {
      console.error('❌ Error fetching current likes:', likesError.message);
    } else {
      console.log(`   Current likes in database: ${currentLikes.length}`);
      currentLikes.forEach(like => {
        console.log(`     - User ${like.user_id} liked at ${like.created_at}`);
      });
    }

    // Test the toggleLike function structure
    console.log('\n🔧 Testing toggleLike function structure...');
    
    // Simulate what happens when a user likes a recipe
    const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy user ID
    
    // Check if user has already liked this recipe
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', testRecipe.id)
      .eq('user_id', testUserId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ Error checking existing like:', checkError.message);
    } else if (existingLike) {
      console.log('✅ Found existing like (would unlike)');
      
      // Test unlike
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('recipe_id', testRecipe.id)
        .eq('user_id', testUserId);
      
      if (deleteError) {
        console.log('❌ Unlike failed:', deleteError.message);
      } else {
        console.log('✅ Unlike successful');
      }
    } else {
      console.log('✅ No existing like found (would like)');
      
      // Test like
      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          recipe_id: testRecipe.id,
          user_id: testUserId
        });
      
      if (insertError) {
        console.log('❌ Like failed:', insertError.message);
      } else {
        console.log('✅ Like successful');
      }
    }

    // Check if the like_count was updated
    console.log('\n📊 Checking if like_count was updated...');
    const { data: updatedRecipe, error: updateError } = await supabase
      .from('recipes')
      .select('like_count')
      .eq('id', testRecipe.id)
      .single();

    if (updateError) {
      console.error('❌ Error checking updated recipe:', updateError.message);
    } else {
      console.log(`   Original like_count: ${testRecipe.like_count}`);
      console.log(`   Updated like_count: ${updatedRecipe.like_count}`);
      
      if (updatedRecipe.like_count !== testRecipe.like_count) {
        console.log('✅ Like count was updated by triggers');
      } else {
        console.log('⚠️  Like count was NOT updated by triggers');
        console.log('💡 This suggests the database triggers are not working');
      }
    }

    console.log('\n🎉 Like functionality test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testLikeWithUser();
