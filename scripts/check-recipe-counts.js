const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Script to check current recipe counts
async function checkRecipeCounts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Checking current recipe counts...');
    
    // Get all recipes with their counts
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count')
      .order('created_at', { ascending: false });

    if (recipesError) {
      console.error('❌ Error fetching recipes:', recipesError.message);
      return;
    }

    console.log(`📝 Found ${recipes.length} recipes:`);
    
    for (const recipe of recipes) {
      console.log(`\n🍽️  ${recipe.title}`);
      console.log(`   ID: ${recipe.id}`);
      console.log(`   like_count: ${recipe.like_count}`);
      console.log(`   comment_count: ${recipe.comment_count}`);
      
      // Check actual likes
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('id', { count: 'exact' })
        .eq('recipe_id', recipe.id);
      
      if (!likesError) {
        console.log(`   Actual likes: ${likes.length}`);
      }
      
      // Check actual comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id', { count: 'exact' })
        .eq('recipe_id', recipe.id);
      
      if (!commentsError) {
        console.log(`   Actual comments: ${comments.length}`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkRecipeCounts();
