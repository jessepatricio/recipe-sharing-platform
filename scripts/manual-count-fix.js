const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Manual count fix script
async function manualCountFix() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Manual count fix...');
    
    // Get all recipes
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count');

    console.log('📊 Current counts:');
    recipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    console.log('\n🔍 Fixing counts manually...');
    
    // Fix Cebu Chorizo: should have 0 likes, 1 comment
    const cebuChorizo = recipes.find(r => r.title.includes('Cebu Chorizo'));
    if (cebuChorizo) {
      console.log(`\n📝 Fixing ${cebuChorizo.title}:`);
      console.log(`   Current: like_count=${cebuChorizo.like_count}, comment_count=${cebuChorizo.comment_count}`);
      console.log(`   Should be: like_count=0, comment_count=1`);
      
      const { error: updateError1 } = await supabase
        .from('recipes')
        .update({
          like_count: 0,
          comment_count: 1
        })
        .eq('id', cebuChorizo.id);
      
      if (updateError1) {
        console.error(`   ❌ Update failed:`, updateError1.message);
      } else {
        console.log(`   ✅ Updated successfully`);
      }
    }

    // Fix Bicol Express: should have 1 like, 1 comment
    const bicolExpress = recipes.find(r => r.title.includes('Bicol Express'));
    if (bicolExpress) {
      console.log(`\n📝 Fixing ${bicolExpress.title}:`);
      console.log(`   Current: like_count=${bicolExpress.like_count}, comment_count=${bicolExpress.comment_count}`);
      console.log(`   Should be: like_count=1, comment_count=1`);
      
      const { error: updateError2 } = await supabase
        .from('recipes')
        .update({
          like_count: 1,
          comment_count: 1
        })
        .eq('id', bicolExpress.id);
      
      if (updateError2) {
        console.error(`   ❌ Update failed:`, updateError2.message);
      } else {
        console.log(`   ✅ Updated successfully`);
      }
    }

    // Filipino Chicken Adobo is already correct (0 likes, 0 comments)
    const chickenAdobo = recipes.find(r => r.title.includes('Filipino Chicken Adobo'));
    if (chickenAdobo) {
      console.log(`\n📝 ${chickenAdobo.title}: Already correct (0 likes, 0 comments)`);
    }

    console.log('\n🎉 Manual count fix completed!');
    
    // Final verification
    console.log('\n📊 Final verification:');
    const { data: finalRecipes } = await supabase
      .from('recipes')
      .select('id, title, like_count, comment_count')
      .order('created_at', { ascending: false });

    finalRecipes.forEach(recipe => {
      console.log(`   ${recipe.title}: like_count=${recipe.like_count}, comment_count=${recipe.comment_count}`);
    });

    // Verify all counts match actual data
    console.log('\n🔍 Verifying all counts match actual data...');
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
        console.log(`   ✅ ${recipe.title}: All counts are accurate`);
      } else {
        console.log(`   ❌ ${recipe.title}: Count mismatch detected`);
        allCountsMatch = false;
      }
    }

    if (allCountsMatch) {
      console.log('\n🎉 All counts are now perfectly synchronized!');
      console.log('\n✅ The like functionality is ready for authenticated users!');
    } else {
      console.log('\n⚠️  Some counts still have mismatches');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

manualCountFix();
