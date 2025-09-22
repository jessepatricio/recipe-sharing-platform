require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Fix Bicol Express like count specifically
async function fixBicolExpressCount() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Fixing Bicol Express like count...\n');

    // 1. Find Bicol Express recipe
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .ilike('title', '%Bicol Express%');

    if (recipesError) {
      console.error('❌ Error fetching Bicol Express:', recipesError.message);
      return;
    }

    if (!recipes || recipes.length === 0) {
      console.error('❌ Bicol Express recipe not found');
      return;
    }

    const bicolRecipe = recipes[0];
    console.log(`📝 Bicol Express recipe:`);
    console.log(`   Current like_count: ${bicolRecipe.like_count}`);

    // 2. Count actual likes
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', bicolRecipe.id);

    if (likesError) {
      console.error('❌ Error counting likes:', likesError.message);
      return;
    }

    const actualLikeCount = likes.length;
    console.log(`   Actual likes: ${actualLikeCount}`);

    // 3. Update the like_count
    if (bicolRecipe.like_count !== actualLikeCount) {
      console.log(`\n🔄 Updating like_count: ${bicolRecipe.like_count} → ${actualLikeCount}`);
      
      const { data: updateData, error: updateError } = await supabase
        .from('recipes')
        .update({ like_count: actualLikeCount })
        .eq('id', bicolRecipe.id)
        .select('like_count');

      if (updateError) {
        console.error('❌ Update failed:', updateError.message);
        console.error('   Error details:', JSON.stringify(updateError, null, 2));
      } else {
        console.log('✅ Update successful');
        if (updateData && updateData.length > 0) {
          console.log(`   New like_count: ${updateData[0].like_count}`);
        } else {
          console.log('   Update completed (no data returned)');
        }
      }
    } else {
      console.log('✅ Like count already correct');
    }

    // 4. Verify the fix
    console.log('\n🔍 Verifying the fix...');
    const { data: verifyRecipe, error: verifyError } = await supabase
      .from('recipes')
      .select('like_count')
      .eq('id', bicolRecipe.id)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log(`   Verified like_count: ${verifyRecipe.like_count}`);
      console.log(`   Expected: ${actualLikeCount}`);
      console.log(`   Match: ${verifyRecipe.like_count === actualLikeCount ? '✅' : '❌'}`);
    }

    // 5. Test UI queries
    console.log('\n🔍 Testing UI queries after fix...');
    
    // Test dashboard query
    const { data: dashboardRecipes } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .eq('id', bicolRecipe.id);

    if (dashboardRecipes && dashboardRecipes.length > 0) {
      console.log(`   Dashboard now shows: ${dashboardRecipes[0].like_count} likes`);
    }

    console.log('\n🎉 Bicol Express like count fix completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixBicolExpressCount();
