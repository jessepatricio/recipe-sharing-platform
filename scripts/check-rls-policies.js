const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Script to check RLS policies and test updates
async function checkRLSPolicies() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Checking RLS policies and update permissions...');
    
    // Test updating a recipe with like_count
    console.log('\n1. Testing recipe update permissions...');
    
    const { data: testRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .limit(1)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching test recipe:', fetchError.message);
      return;
    }

    console.log(`📝 Testing with recipe: ${testRecipe.title}`);
    console.log(`   Current like_count: ${testRecipe.like_count}`);

    // Try to update the like_count
    const { data: updateData, error: updateError } = await supabase
      .from('recipes')
      .update({ like_count: 999 })
      .eq('id', testRecipe.id)
      .select('like_count');

    if (updateError) {
      console.error('❌ Error updating recipe:', updateError.message);
      console.error('❌ Error details:', JSON.stringify(updateError, null, 2));
      
      if (updateError.code === '42501') {
        console.log('💡 This suggests RLS policies are preventing the update');
        console.log('💡 You may need to update the recipes table RLS policies');
      }
    } else {
      console.log('✅ Recipe update successful:', updateData);
      
      // Revert the change
      await supabase
        .from('recipes')
        .update({ like_count: testRecipe.like_count })
        .eq('id', testRecipe.id);
      console.log('✅ Reverted test change');
    }

    // Test inserting a new like
    console.log('\n2. Testing like insertion...');
    const testLikeData = {
      recipe_id: testRecipe.id,
      user_id: '00000000-0000-0000-0000-000000000000'
    };

    const { data: likeData, error: likeError } = await supabase
      .from('likes')
      .insert(testLikeData)
      .select('id');

    if (likeError) {
      console.log('ℹ️  Like insertion failed (expected due to RLS):', likeError.message);
    } else {
      console.log('✅ Like insertion successful:', likeData);
      
      // Clean up
      await supabase
        .from('likes')
        .delete()
        .eq('id', likeData[0].id);
      console.log('✅ Cleaned up test like');
    }

    console.log('\n🎉 RLS policy check completed!');
    console.log('\n💡 If recipe updates are failing, you may need to:');
    console.log('1. Check RLS policies on the recipes table');
    console.log('2. Ensure the service role key is being used for updates');
    console.log('3. Or manually update the counts in Supabase dashboard');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkRLSPolicies();
