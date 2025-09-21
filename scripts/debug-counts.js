const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Debug script to investigate count issues
async function debugCounts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Debugging count issues...');
    
    // Get all recipes
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count')
      .order('created_at', { ascending: false });

    console.log('📊 Recipe counts in database:');
    recipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    console.log('\n🔍 Actual social data:');
    
    for (const recipe of recipes) {
      console.log(`\n📝 ${recipe.title} (ID: ${recipe.id}):`);
      
      // Get actual likes
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('id, user_id, created_at')
        .eq('recipe_id', recipe.id);
      
      if (likesError) {
        console.log(`   ❌ Error fetching likes: ${likesError.message}`);
      } else {
        console.log(`   👍 Likes (${likes.length}):`);
        likes.forEach(like => {
          console.log(`     - User ${like.user_id} at ${like.created_at}`);
        });
      }
      
      // Get actual comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('id, user_id, created_at, content')
        .eq('recipe_id', recipe.id);
      
      if (commentsError) {
        console.log(`   ❌ Error fetching comments: ${commentsError.message}`);
      } else {
        console.log(`   💬 Comments (${comments.length}):`);
        comments.forEach(comment => {
          console.log(`     - User ${comment.user_id}: "${comment.content.substring(0, 50)}..." at ${comment.created_at}`);
        });
      }
      
      // Check for any orphaned records
      const { data: orphanedLikes } = await supabase
        .from('likes')
        .select('id, recipe_id')
        .eq('recipe_id', recipe.id);
      
      const { data: orphanedComments } = await supabase
        .from('comments')
        .select('id, recipe_id')
        .eq('recipe_id', recipe.id);
      
      console.log(`   📊 Summary:`);
      console.log(`     - Database like_count: ${recipe.like_count}`);
      console.log(`     - Actual likes: ${likes?.length || 0}`);
      console.log(`     - Database comment_count: ${recipe.comment_count}`);
      console.log(`     - Actual comments: ${comments?.length || 0}`);
      
      const likeMatch = recipe.like_count === (likes?.length || 0);
      const commentMatch = recipe.comment_count === (comments?.length || 0);
      
      if (likeMatch && commentMatch) {
        console.log(`     ✅ All counts match`);
      } else {
        console.log(`     ❌ Count mismatch detected`);
      }
    }

    console.log('\n🎉 Debug completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

debugCounts();
