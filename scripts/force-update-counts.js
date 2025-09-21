const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Force update counts script
async function forceUpdateCounts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Force updating counts...');
    
    // Get all recipes
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count');

    console.log('📊 Current counts:');
    recipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    console.log('\n🔍 Force updating each recipe individually...');
    
    // Fix Bicol Express: should have 1 like, 1 comment
    const bicolExpress = recipes.find(r => r.title.includes('Bicol Express'));
    if (bicolExpress) {
      console.log(`\n📝 Force updating ${bicolExpress.title}:`);
      
      // Update like_count to 1
      const { error: likeError } = await supabase
        .from('recipes')
        .update({ like_count: 1 })
        .eq('id', bicolExpress.id);
      
      if (likeError) {
        console.log(`   ❌ Like count update failed:`, likeError.message);
      } else {
        console.log(`   ✅ Like count updated to 1`);
      }
      
      // Update comment_count to 1
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

    // Fix Cebu Chorizo: should have 1 like, 1 comment
    const cebuChorizo = recipes.find(r => r.title.includes('Cebu Chorizo'));
    if (cebuChorizo) {
      console.log(`\n📝 Force updating ${cebuChorizo.title}:`);
      
      // Update like_count to 1
      const { error: likeError } = await supabase
        .from('recipes')
        .update({ like_count: 1 })
        .eq('id', cebuChorizo.id);
      
      if (likeError) {
        console.log(`   ❌ Like count update failed:`, likeError.message);
      } else {
        console.log(`   ✅ Like count updated to 1`);
      }
      
      // Update comment_count to 1
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

    console.log('\n🎉 Force update completed!');
    
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

forceUpdateCounts();
