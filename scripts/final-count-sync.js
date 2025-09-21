const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Final count synchronization script
async function finalCountSync() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Final count synchronization...');
    
    // Get all recipes
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count');

    console.log('📊 Current counts:');
    recipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    console.log('\n🔍 Synchronizing with actual data...');
    
    for (const recipe of recipes) {
      // Count actual likes
      const { data: likes } = await supabase
        .from('likes')
        .select('id')
        .eq('recipe_id', recipe.id);
      
      // Count actual comments
      const { data: comments } = await supabase
        .from('comments')
        .select('id')
        .eq('recipe_id', recipe.id);
      
      const actualLikeCount = likes?.length || 0;
      const actualCommentCount = comments?.length || 0;
      
      console.log(`\n📝 ${recipe.title}:`);
      console.log(`   Current: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
      console.log(`   Actual:  like_count=${actualLikeCount}, comment_count=${actualCommentCount}`);
      
      // Update counts
      const { error: updateError } = await supabase
        .from('recipes')
        .update({
          like_count: actualLikeCount,
          comment_count: actualCommentCount
        })
        .eq('id', recipe.id);
      
      if (updateError) {
        console.error(`   ❌ Update failed:`, updateError.message);
      } else {
        console.log(`   ✅ Updated successfully`);
      }
    }

    console.log('\n🎉 Final count synchronization completed!');
    
    // Final verification
    console.log('\n📊 Final verification:');
    const { data: finalRecipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count')
      .order('created_at', { ascending: false });

    finalRecipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    // Verify counts match actual data
    console.log('\n🔍 Verifying counts match actual data...');
    let allCountsMatch = true;
    
    for (const recipe of finalRecipes) {
      const { data: likes } = await supabase
        .from('likes')
        .select('id')
        .eq('recipe_id', recipe.id);
      
      const { data: comments } = await supabase
        .from('comments')
        .select('id')
        .eq('recipe_id', recipe.id);
      
      const actualLikeCount = likes?.length || 0;
      const actualCommentCount = comments?.length || 0;
      
      const likeCountMatch = recipe.like_count === actualLikeCount;
      const commentCountMatch = recipe.comment_count === actualCommentCount;
      
      if (likeCountMatch && commentCountMatch) {
        console.log(`   ✅ ${recipe.title}: Counts are accurate`);
      } else {
        console.log(`   ❌ ${recipe.title}: Count mismatch detected`);
        allCountsMatch = false;
      }
    }

    if (allCountsMatch) {
      console.log('\n🎉 All counts are now perfectly synchronized!');
    } else {
      console.log('\n⚠️  Some counts still have mismatches');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

finalCountSync();
