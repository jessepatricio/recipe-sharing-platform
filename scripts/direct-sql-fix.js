const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Direct SQL fix script
async function directSqlFix() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Direct SQL fix...');
    
    // Get all recipes first
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count');

    console.log('📊 Current counts:');
    recipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    console.log('\n🔍 Using direct SQL updates...');
    
    // Try using rpc to execute SQL directly
    const { data: result1, error: error1 } = await supabase
      .rpc('exec_sql', { 
        sql: `UPDATE recipes SET like_count = 0, comment_count = 1 WHERE title LIKE '%Cebu Chorizo%'` 
      });

    if (error1) {
      console.log('ℹ️  Cannot use exec_sql (this is normal)');
    } else {
      console.log('✅ Cebu Chorizo updated via SQL');
    }

    const { data: result2, error: error2 } = await supabase
      .rpc('exec_sql', { 
        sql: `UPDATE recipes SET like_count = 1, comment_count = 1 WHERE title LIKE '%Bicol Express%'` 
      });

    if (error2) {
      console.log('ℹ️  Cannot use exec_sql (this is normal)');
    } else {
      console.log('✅ Bicol Express updated via SQL');
    }

    // Try a different approach - update one field at a time
    console.log('\n🔍 Trying individual field updates...');
    
    // Fix Cebu Chorizo
    const cebuChorizo = recipes.find(r => r.title.includes('Cebu Chorizo'));
    if (cebuChorizo) {
      console.log(`\n📝 Fixing ${cebuChorizo.title}:`);
      
      // Update like_count first
      const { error: likeError } = await supabase
        .from('recipes')
        .update({ like_count: 0 })
        .eq('id', cebuChorizo.id);
      
      if (likeError) {
        console.log(`   ❌ Like count update failed:`, likeError.message);
      } else {
        console.log(`   ✅ Like count updated to 0`);
      }
      
      // Update comment_count
      const { error: commentError } = await supabase
        .from('recipes')
        .update({ comment_count: 1 })
        .eq('id', cebuChorizo.id);
      
      if (commentError) {
        console.log(`   ❌ Comment count update failed:`, commentError.message);
      } else {
        console.log(`   ✅ Comment count updated to 1`);
      }
    }

    // Fix Bicol Express
    const bicolExpress = recipes.find(r => r.title.includes('Bicol Express'));
    if (bicolExpress) {
      console.log(`\n📝 Fixing ${bicolExpress.title}:`);
      
      // Update like_count first
      const { error: likeError } = await supabase
        .from('recipes')
        .update({ like_count: 1 })
        .eq('id', bicolExpress.id);
      
      if (likeError) {
        console.log(`   ❌ Like count update failed:`, likeError.message);
      } else {
        console.log(`   ✅ Like count updated to 1`);
      }
      
      // Update comment_count
      const { error: commentError } = await supabase
        .from('recipes')
        .update({ comment_count: 1 })
        .eq('id', bicolExpress.id);
      
      if (commentError) {
        console.log(`   ❌ Comment count update failed:`, commentError.message);
      } else {
        console.log(`   ✅ Comment count updated to 1`);
      }
    }

    console.log('\n🎉 Direct SQL fix completed!');
    
    // Final verification
    console.log('\n📊 Final verification:');
    const { data: finalRecipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count')
      .order('created_at', { ascending: false });

    finalRecipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

directSqlFix();
