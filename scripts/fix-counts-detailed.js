const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Detailed script to fix counts with better error handling
async function fixCountsDetailed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Fixing counts with detailed error handling...');
    
    // Get all recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count');

    if (recipesError) {
      console.error('❌ Error fetching recipes:', recipesError.message);
      return;
    }

    console.log(`📝 Found ${recipes.length} recipes to update`);

    // Fix like counts
    for (const recipe of recipes) {
      console.log(`\n🍽️  Processing ${recipe.title}...`);
      
      // Count actual likes
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('id')
        .eq('recipe_id', recipe.id);

      if (likesError) {
        console.error(`❌ Error counting likes:`, likesError.message);
        continue;
      }

      const actualLikeCount = likes?.length || 0;
      const currentLikeCount = recipe.like_count || 0;

      console.log(`   Current like_count: ${currentLikeCount}`);
      console.log(`   Actual likes: ${actualLikeCount}`);

      if (actualLikeCount !== currentLikeCount) {
        console.log(`   🔄 Updating like_count: ${currentLikeCount} → ${actualLikeCount}`);
        
        const { data: updateData, error: updateError } = await supabase
          .from('recipes')
          .update({ like_count: actualLikeCount })
          .eq('id', recipe.id)
          .select('like_count');

        if (updateError) {
          console.error(`   ❌ Error updating like count:`, updateError.message);
          console.error(`   ❌ Error details:`, JSON.stringify(updateError, null, 2));
        } else {
          console.log(`   ✅ Like count updated successfully:`, updateData);
        }
      } else {
        console.log(`   ✅ Like count already correct`);
      }

      // Count actual comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id')
        .eq('recipe_id', recipe.id);

      if (commentsError) {
        console.error(`❌ Error counting comments:`, commentsError.message);
        continue;
      }

      const actualCommentCount = comments?.length || 0;
      const currentCommentCount = recipe.comment_count || 0;

      console.log(`   Current comment_count: ${currentCommentCount}`);
      console.log(`   Actual comments: ${actualCommentCount}`);

      if (actualCommentCount !== currentCommentCount) {
        console.log(`   🔄 Updating comment_count: ${currentCommentCount} → ${actualCommentCount}`);
        
        const { data: updateData, error: updateError } = await supabase
          .from('recipes')
          .update({ comment_count: actualCommentCount })
          .eq('id', recipe.id)
          .select('comment_count');

        if (updateError) {
          console.error(`   ❌ Error updating comment count:`, updateError.message);
          console.error(`   ❌ Error details:`, JSON.stringify(updateError, null, 2));
        } else {
          console.log(`   ✅ Comment count updated successfully:`, updateData);
        }
      } else {
        console.log(`   ✅ Comment count already correct`);
      }
    }

    console.log('\n🎉 Count fixing completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixCountsDetailed();
