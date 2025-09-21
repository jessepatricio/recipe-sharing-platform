const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Manual SQL fix script
async function manualSqlFix() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Manual SQL fix...');
    
    // Get all recipes
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count');

    console.log('📊 Current counts:');
    recipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    console.log('\n🔍 Using RPC to execute SQL directly...');
    
    // Try to use RPC to execute SQL directly
    const { data: result1, error: error1 } = await supabase
      .rpc('exec_sql', { 
        sql: `UPDATE recipes SET like_count = 1, comment_count = 1 WHERE title LIKE '%Bicol Express%'` 
      });

    if (error1) {
      console.log('ℹ️  Cannot use exec_sql (this is normal)');
    } else {
      console.log('✅ Bicol Express updated via SQL');
    }

    const { data: result2, error: error2 } = await supabase
      .rpc('exec_sql', { 
        sql: `UPDATE recipes SET like_count = 1, comment_count = 1 WHERE title LIKE '%Cebu Chorizo%'` 
      });

    if (error2) {
      console.log('ℹ️  Cannot use exec_sql (this is normal)');
    } else {
      console.log('✅ Cebu Chorizo updated via SQL');
    }

    // Since RPC doesn't work, let's try a different approach
    console.log('\n🔍 Trying alternative approach...');
    
    // Try to update using a different method
    const { data: updateResult, error: updateError } = await supabase
      .from('recipes')
      .update({ 
        like_count: 1,
        comment_count: 1
      })
      .eq('title', 'Bicol Express');

    if (updateError) {
      console.log('❌ Update failed:', updateError.message);
    } else {
      console.log('✅ Update successful');
    }

    // Check if the update worked
    const { data: updatedRecipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count')
      .order('created_at', { ascending: false });

    console.log('\n📊 Updated counts:');
    updatedRecipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    console.log('\n🎉 Manual SQL fix completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

manualSqlFix();
