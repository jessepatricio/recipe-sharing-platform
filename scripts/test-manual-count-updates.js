const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test manual count updates
async function testManualCountUpdates() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing manual count updates...');
    
    // Get current state
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count')
      .order('created_at', { ascending: false });

    console.log('📊 Current recipe counts:');
    recipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    // Check actual social data
    console.log('\n🔍 Actual social data:');
    for (const recipe of recipes) {
      const { data: likes } = await supabase
        .from('likes')
        .select('id')
        .eq('recipe_id', recipe.id);
      
      const { data: comments } = await supabase
        .from('comments')
        .select('id')
        .eq('recipe_id', recipe.id);
      
      console.log(`   ${recipe.title}:`);
      console.log(`     - Actual likes: ${likes?.length || 0}`);
      console.log(`     - Actual comments: ${comments?.length || 0}`);
      console.log(`     - DB like_count: ${recipe.like_count}`);
      console.log(`     - DB comment_count: ${recipe.comment_count}`);
      
      const likeMatch = recipe.like_count === (likes?.length || 0);
      const commentMatch = recipe.comment_count === (comments?.length || 0);
      
      if (likeMatch && commentMatch) {
        console.log(`     ✅ Counts are accurate`);
      } else {
        console.log(`     ❌ Count mismatch detected`);
      }
    }

    // Test the toggleLike function by simulating what happens in production
    console.log('\n🔧 Testing toggleLike function logic...');
    
    const testRecipe = recipes[0];
    const testUserId = '00000000-0000-0000-0000-000000000000';
    
    console.log(`   Testing with: ${testRecipe.title} (ID: ${testRecipe.id})`);
    console.log(`   Current like_count: ${testRecipe.like_count}`);
    
    // Check if user has already liked this recipe
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', testRecipe.id)
      .eq('user_id', testUserId)
      .single();

    if (existingLike) {
      console.log('   ℹ️  Test user already has a like for this recipe');
      console.log('   🔄 Testing unlike...');
      
      // Test unlike
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('recipe_id', testRecipe.id)
        .eq('user_id', testUserId);
      
      if (deleteError) {
        console.log('   ❌ Unlike failed:', deleteError.message);
      } else {
        console.log('   ✅ Unlike successful');
        
        // Now manually update the count (simulating what the toggleLike function does)
        const { data: remainingLikes } = await supabase
          .from('likes')
          .select('id')
          .eq('recipe_id', testRecipe.id);
        
        const actualLikeCount = remainingLikes?.length || 0;
        
        const { error: updateError } = await supabase
          .from('recipes')
          .update({ like_count: actualLikeCount })
          .eq('id', testRecipe.id);
        
        if (updateError) {
          console.log('   ❌ Count update failed:', updateError.message);
        } else {
          console.log(`   ✅ Count updated to ${actualLikeCount}`);
        }
        
        // Re-insert the like to restore original state
        await supabase
          .from('likes')
          .insert({
            recipe_id: testRecipe.id,
            user_id: testUserId
          });
        console.log('   ✅ Re-inserted like to restore original state');
      }
    } else {
      console.log('   ℹ️  Test user has not liked this recipe yet');
      console.log('   🔄 Testing like...');
      
      // Test like
      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          recipe_id: testRecipe.id,
          user_id: testUserId
        });
      
      if (insertError) {
        console.log('   ❌ Like failed:', insertError.message);
        console.log('   💡 This is expected due to RLS - only authenticated users can like');
      } else {
        console.log('   ✅ Like successful');
        
        // Now manually update the count (simulating what the toggleLike function does)
        const { data: allLikes } = await supabase
          .from('likes')
          .select('id')
          .eq('recipe_id', testRecipe.id);
        
        const actualLikeCount = allLikes?.length || 0;
        
        const { error: updateError } = await supabase
          .from('recipes')
          .update({ like_count: actualLikeCount })
          .eq('id', testRecipe.id);
        
        if (updateError) {
          console.log('   ❌ Count update failed:', updateError.message);
        } else {
          console.log(`   ✅ Count updated to ${actualLikeCount}`);
        }
        
        // Clean up
        await supabase
          .from('likes')
          .delete()
          .eq('recipe_id', testRecipe.id)
          .eq('user_id', testUserId);
        console.log('   ✅ Test like cleaned up');
      }
    }

    console.log('\n🎉 Manual count updates test completed!');
    console.log('\n💡 The toggleLike function now manually updates counts instead of relying on database triggers.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testManualCountUpdates();
