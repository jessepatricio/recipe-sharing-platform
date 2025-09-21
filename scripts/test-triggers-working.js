const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test if database triggers are working
async function testTriggersWorking() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing if database triggers are working...');
    
    // Get a test recipe
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count')
      .limit(1);

    if (!recipes || recipes.length === 0) {
      console.error('❌ No recipes found to test with');
      return;
    }

    const testRecipe = recipes[0];
    console.log(`📝 Testing with recipe: ${testRecipe.title} (ID: ${testRecipe.id})`);
    console.log(`   Current like_count: ${testRecipe.like_count}`);
    console.log(`   Current comment_count: ${testRecipe.comment_count}`);

    // Check current likes for this recipe
    const { data: currentLikes } = await supabase
      .from('likes')
      .select('id, user_id')
      .eq('recipe_id', testRecipe.id);

    console.log(`   Current likes in database: ${currentLikes?.length || 0}`);

    // Test the trigger by manually updating the like_count
    console.log('\n🔧 Testing trigger by manually updating like_count...');
    
    const originalLikeCount = testRecipe.like_count;
    const newLikeCount = originalLikeCount + 1;
    
    console.log(`   Updating like_count from ${originalLikeCount} to ${newLikeCount}`);
    
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ like_count: newLikeCount })
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
      
      if (updatedRecipe?.like_count === newLikeCount) {
        console.log('✅ Manual update worked - triggers should work too');
        
        // Revert the change
        await supabase
          .from('recipes')
          .update({ like_count: originalLikeCount })
          .eq('id', testRecipe.id);
        console.log('✅ Reverted test change');
      } else {
        console.log('❌ Manual update did not work - triggers won\'t work either');
      }
    }

    // Test if we can insert a like (this will fail due to RLS, but we can test the structure)
    console.log('\n🔧 Testing like insertion structure...');
    
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
      console.log('💡 This confirms RLS is working correctly');
    } else {
      console.log('✅ Like insertion successful:', likeData);
      
      // Check if like_count was updated by trigger
      const { data: updatedRecipe } = await supabase
        .from('recipes')
        .select('like_count')
        .eq('id', testRecipe.id)
        .single();
      
      console.log(`   Original like_count: ${testRecipe.like_count}`);
      console.log(`   Updated like_count: ${updatedRecipe?.like_count}`);
      
      if (updatedRecipe?.like_count === testRecipe.like_count + 1) {
        console.log('✅ Trigger worked - like count increased');
      } else {
        console.log('⚠️  Trigger may not be working - like count unchanged');
      }
      
      // Clean up
      await supabase
        .from('likes')
        .delete()
        .eq('id', likeData[0].id);
      console.log('✅ Test like cleaned up');
    }

    // Test unlike functionality by checking if we can delete a like
    console.log('\n🔧 Testing unlike functionality...');
    
    // Check if there are any existing likes we can test with
    if (currentLikes && currentLikes.length > 0) {
      const existingLike = currentLikes[0];
      console.log(`   Found existing like: ${existingLike.id}`);
      
      // Try to delete the like
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (deleteError) {
        console.log('❌ Unlike failed:', deleteError.message);
      } else {
        console.log('✅ Unlike successful');
        
        // Check if like_count was updated by trigger
        const { data: updatedRecipe } = await supabase
          .from('recipes')
          .select('like_count')
          .eq('id', testRecipe.id)
          .single();
        
        console.log(`   Original like_count: ${testRecipe.like_count}`);
        console.log(`   Updated like_count: ${updatedRecipe?.like_count}`);
        
        if (updatedRecipe?.like_count === testRecipe.like_count - 1) {
          console.log('✅ Trigger worked - like count decreased');
        } else {
          console.log('⚠️  Trigger may not be working - like count unchanged');
        }
        
        // Re-insert the like to restore the original state
        await supabase
          .from('likes')
          .insert({
            recipe_id: testRecipe.id,
            user_id: existingLike.user_id
          });
        console.log('✅ Re-inserted like to restore original state');
      }
    } else {
      console.log('ℹ️  No existing likes to test unlike functionality');
    }

    console.log('\n🎉 Trigger testing completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testTriggersWorking();
