const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Simple script to fix counts
async function fixCountsSimple() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Fixing counts with simple approach...');
    
    // Get all recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title');

    if (recipesError) {
      console.error('❌ Error fetching recipes:', recipesError.message);
      return;
    }

    console.log(`📝 Found ${recipes.length} recipes to update`);

    // Fix each recipe individually
    for (const recipe of recipes) {
      console.log(`\n🍽️  Processing ${recipe.title}...`);
      
      // Count likes
      const { data: likes } = await supabase
        .from('likes')
        .select('id')
        .eq('recipe_id', recipe.id);
      
      const likeCount = likes?.length || 0;
      
      // Count comments
      const { data: comments } = await supabase
        .from('comments')
        .select('id')
        .eq('recipe_id', recipe.id);
      
      const commentCount = comments?.length || 0;
      
      console.log(`   Found: ${likeCount} likes, ${commentCount} comments`);
      
      // Update both counts in one query
      const { error: updateError } = await supabase
        .from('recipes')
        .update({ 
          like_count: likeCount,
          comment_count: commentCount
        })
        .eq('id', recipe.id);

      if (updateError) {
        console.error(`   ❌ Update failed:`, updateError.message);
      } else {
        console.log(`   ✅ Updated successfully`);
      }
    }

    console.log('\n🎉 Count fixing completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixCountsSimple();
