require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Direct SQL approach to fix Bicol Express like count
async function fixBicolDirectSQL() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Fixing Bicol Express with direct SQL approach...\n');

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

    // 3. Try multiple update approaches
    console.log('\n🔄 Attempting different update methods...\n');

    // Method 1: Simple update
    console.log('Method 1: Simple update...');
    const { error: update1Error } = await supabase
      .from('recipes')
      .update({ like_count: actualLikeCount })
      .eq('id', bicolRecipe.id);

    if (update1Error) {
      console.error('❌ Method 1 failed:', update1Error.message);
    } else {
      console.log('✅ Method 1 successful');
    }

    // Method 2: Update with select
    console.log('\nMethod 2: Update with select...');
    const { data: update2Data, error: update2Error } = await supabase
      .from('recipes')
      .update({ like_count: actualLikeCount })
      .eq('id', bicolRecipe.id)
      .select('like_count');

    if (update2Error) {
      console.error('❌ Method 2 failed:', update2Error.message);
    } else {
      console.log('✅ Method 2 successful');
      if (update2Data && update2Data.length > 0) {
        console.log(`   Returned like_count: ${update2Data[0].like_count}`);
      }
    }

    // Method 3: Upsert approach
    console.log('\nMethod 3: Upsert approach...');
    const { data: update3Data, error: update3Error } = await supabase
      .from('recipes')
      .upsert({ 
        id: bicolRecipe.id, 
        like_count: actualLikeCount 
      })
      .select('like_count');

    if (update3Error) {
      console.error('❌ Method 3 failed:', update3Error.message);
    } else {
      console.log('✅ Method 3 successful');
      if (update3Data && update3Data.length > 0) {
        console.log(`   Returned like_count: ${update3Data[0].like_count}`);
      }
    }

    // 4. Final verification
    console.log('\n🔍 Final verification...');
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

    // 5. Test dashboard query
    console.log('\n🔍 Testing dashboard query...');
    const { data: dashboardRecipes } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .eq('id', bicolRecipe.id);

    if (dashboardRecipes && dashboardRecipes.length > 0) {
      console.log(`   Dashboard shows: ${dashboardRecipes[0].like_count} likes`);
    }

    console.log('\n🎉 Direct SQL fix completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixBicolDirectSQL();
