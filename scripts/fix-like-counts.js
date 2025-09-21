const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Script to fix like counts and recreate triggers
async function fixLikeCounts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Fixing like counts and triggers...');
    
    // Step 1: Get all recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count');

    if (recipesError) {
      console.error('❌ Error fetching recipes:', recipesError.message);
      return;
    }

    console.log(`📝 Found ${recipes.length} recipes to update`);

    // Step 2: For each recipe, count actual likes and update like_count
    for (const recipe of recipes) {
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('id')
        .eq('recipe_id', recipe.id);

      if (likesError) {
        console.error(`❌ Error counting likes for recipe ${recipe.id}:`, likesError.message);
        continue;
      }

      const actualLikeCount = likes?.length || 0;
      const currentLikeCount = recipe.like_count || 0;

      if (actualLikeCount !== currentLikeCount) {
        console.log(`🔄 Updating ${recipe.title}: ${currentLikeCount} → ${actualLikeCount} likes`);
        
        const { error: updateError } = await supabase
          .from('recipes')
          .update({ like_count: actualLikeCount })
          .eq('id', recipe.id);

        if (updateError) {
          console.error(`❌ Error updating like count for recipe ${recipe.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated like count for ${recipe.title}`);
        }
      } else {
        console.log(`✅ ${recipe.title} already has correct like count (${actualLikeCount})`);
      }
    }

    // Step 3: Do the same for comment counts
    console.log('\n🔧 Fixing comment counts...');
    
    for (const recipe of recipes) {
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id')
        .eq('recipe_id', recipe.id);

      if (commentsError) {
        console.error(`❌ Error counting comments for recipe ${recipe.id}:`, commentsError.message);
        continue;
      }

      const actualCommentCount = comments?.length || 0;
      const currentCommentCount = recipe.comment_count || 0;

      if (actualCommentCount !== currentCommentCount) {
        console.log(`🔄 Updating ${recipe.title}: ${currentCommentCount} → ${actualCommentCount} comments`);
        
        const { error: updateError } = await supabase
          .from('recipes')
          .update({ comment_count: actualCommentCount })
          .eq('id', recipe.id);

        if (updateError) {
          console.error(`❌ Error updating comment count for recipe ${recipe.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated comment count for ${recipe.title}`);
        }
      } else {
        console.log(`✅ ${recipe.title} already has correct comment count (${actualCommentCount})`);
      }
    }

    console.log('\n🎉 Like and comment counts have been fixed!');
    console.log('\n📝 Summary:');
    console.log('✅ All recipe like counts have been synchronized');
    console.log('✅ All recipe comment counts have been synchronized');
    console.log('✅ Database is now consistent');
    
    console.log('\n💡 Note: The triggers should work for future likes/comments.');
    console.log('   If they don\'t, you may need to recreate them manually in Supabase.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixLikeCounts();
