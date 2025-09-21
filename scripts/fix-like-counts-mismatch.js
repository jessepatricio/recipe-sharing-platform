const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Script to fix the mismatch between like_count and actual likes
async function fixLikeCountsMismatch() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Fixing like counts mismatch...');
    
    // Get all recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count');

    if (recipesError) {
      console.error('❌ Error fetching recipes:', recipesError.message);
      return;
    }

    console.log('📊 Current state:');
    recipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    console.log('\n🔍 Checking actual data and fixing counts...');
    
    for (const recipe of recipes) {
      // Count actual likes
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('id')
        .eq('recipe_id', recipe.id);
      
      if (likesError) {
        console.error(`❌ Error counting likes for ${recipe.title}:`, likesError.message);
        continue;
      }
      
      const actualLikeCount = likes.length;
      
      // Count actual comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id')
        .eq('recipe_id', recipe.id);
      
      if (commentsError) {
        console.error(`❌ Error counting comments for ${recipe.title}:`, commentsError.message);
        continue;
      }
      
      const actualCommentCount = comments.length;
      
      console.log(`\n📝 ${recipe.title}:`);
      console.log(`   Current: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
      console.log(`   Actual:  like_count=${actualLikeCount}, comment_count=${actualCommentCount}`);
      
      // Update if there's a mismatch
      if (recipe.like_count !== actualLikeCount || recipe.comment_count !== actualCommentCount) {
        console.log(`   🔄 Updating counts...`);
        
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
      } else {
        console.log(`   ✅ Counts are already correct`);
      }
    }

    console.log('\n🎉 Like counts mismatch fix completed!');
    
    // Verify the fix
    console.log('\n📊 Final verification:');
    const { data: updatedRecipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count')
      .order('created_at', { ascending: false });

    updatedRecipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixLikeCountsMismatch();
