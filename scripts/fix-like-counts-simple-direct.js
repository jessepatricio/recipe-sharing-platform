require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Simple direct fix for like counts
async function fixLikeCountsSimple() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Fixing like counts with simple direct approach...\n');

    // Get all recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count');

    if (recipesError) {
      console.error('❌ Error fetching recipes:', recipesError.message);
      return;
    }

    console.log(`📝 Found ${recipes.length} recipes to fix\n`);

    // Fix each recipe
    for (const recipe of recipes) {
      console.log(`🍽️  Fixing ${recipe.title}...`);
      
      // Count actual likes
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('id')
        .eq('recipe_id', recipe.id);

      if (likesError) {
        console.error(`   ❌ Error counting likes:`, likesError.message);
        continue;
      }

      const actualLikeCount = likes?.length || 0;
      const currentLikeCount = recipe.like_count || 0;

      console.log(`   Current like_count: ${currentLikeCount}`);
      console.log(`   Actual likes: ${actualLikeCount}`);

      if (actualLikeCount !== currentLikeCount) {
        console.log(`   🔄 Updating: ${currentLikeCount} → ${actualLikeCount}`);
        
        const { error: updateError } = await supabase
          .from('recipes')
          .update({ like_count: actualLikeCount })
          .eq('id', recipe.id);

        if (updateError) {
          console.error(`   ❌ Update failed:`, updateError.message);
        } else {
          console.log(`   ✅ Updated successfully`);
        }
      } else {
        console.log(`   ✅ Already correct`);
      }
      console.log('');
    }

    console.log('🎉 Like counts fix completed!');
    
    // Final verification
    console.log('\n📊 Final verification:');
    const { data: finalRecipes } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .order('created_at', { ascending: false });

    for (const recipe of finalRecipes) {
      const { data: likes } = await supabase
        .from('likes')
        .select('id')
        .eq('recipe_id', recipe.id);
      
      const actualCount = likes?.length || 0;
      const storedCount = recipe.like_count || 0;
      const match = actualCount === storedCount;
      
      console.log(`   ${recipe.title}: ${storedCount} likes (actual: ${actualCount}) ${match ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixLikeCountsSimple();
