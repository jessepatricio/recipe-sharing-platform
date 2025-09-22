require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Fix Bicol Express using service role key for higher permissions
async function fixBicolWithServiceRole() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Try service role key first, fallback to anon key
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Available keys:', {
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Fixing Bicol Express with service role permissions...\n');

    // 1. Find Bicol Express recipe
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .ilike('title', '%Bicol Express%');

    if (recipesError) {
      console.error('❌ Error fetching Bicol Express:', recipesError.message);
      return;
    }

    const bicolRecipe = recipes[0];
    console.log(`📝 Bicol Express: ${bicolRecipe.like_count} likes`);

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

    if (bicolRecipe.like_count === actualLikeCount) {
      console.log('✅ Like count already correct');
      return;
    }

    // 3. Update with service role permissions
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
        console.log(`   Updated like_count: ${updateData[0].like_count}`);
      }
    }

    // 4. Wait a moment and verify
    console.log('\n⏳ Waiting 2 seconds before verification...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Final verification
    console.log('🔍 Final verification...');
    const { data: finalRecipe, error: finalError } = await supabase
      .from('recipes')
      .select('like_count')
      .eq('id', bicolRecipe.id)
      .single();

    if (finalError) {
      console.error('❌ Final verification failed:', finalError.message);
    } else {
      console.log(`   Final like_count: ${finalRecipe.like_count}`);
      console.log(`   Expected: ${actualLikeCount}`);
      console.log(`   Match: ${finalRecipe.like_count === actualLikeCount ? '✅' : '❌'}`);
    }

    // 6. Test all UI queries
    console.log('\n🔍 Testing all UI queries...');
    
    // Dashboard query
    const { data: dashboardRecipes } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .eq('id', bicolRecipe.id);

    if (dashboardRecipes && dashboardRecipes.length > 0) {
      console.log(`   Dashboard: ${dashboardRecipes[0].like_count} likes`);
    }

    // My Recipes query (for the owner)
    const { data: myRecipes } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .eq('id', bicolRecipe.id)
      .eq('user_id', bicolRecipe.user_id);

    if (myRecipes && myRecipes.length > 0) {
      console.log(`   My Recipes: ${myRecipes[0].like_count} likes`);
    }

    // Individual recipe query
    const { data: singleRecipe } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .eq('id', bicolRecipe.id)
      .single();

    if (singleRecipe) {
      console.log(`   Individual: ${singleRecipe.like_count} likes`);
    }

    console.log('\n🎉 Bicol Express fix completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixBicolWithServiceRole();
