const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Check trigger status
async function checkTriggerStatus() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Checking trigger status...');
    
    // Check if we can query the information_schema
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_statement')
      .eq('trigger_schema', 'public')
      .like('trigger_name', '%like%');

    if (triggerError) {
      console.log('ℹ️  Cannot query triggers directly (this is normal)');
    } else {
      console.log('📊 Triggers found:');
      triggers.forEach(trigger => {
        console.log(`   ${trigger.trigger_name}: ${trigger.event_manipulation} -> ${trigger.action_statement}`);
      });
    }

    // Check if we can call the trigger function directly
    console.log('\n🔍 Testing trigger function...');
    
    const { data: functionResult, error: functionError } = await supabase
      .rpc('update_recipe_like_count');

    if (functionError) {
      console.log('ℹ️  Cannot call trigger function directly (this is normal)');
    } else {
      console.log('✅ Trigger function is callable');
    }

    // Test if we can update a recipe directly
    console.log('\n🔍 Testing direct recipe update...');
    
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .limit(1);

    if (recipes && recipes.length > 0) {
      const testRecipe = recipes[0];
      console.log(`   Testing with: ${testRecipe.title}`);
      console.log(`   Current like_count: ${testRecipe.like_count}`);
      
      // Try to update the like_count
      const { error: updateError } = await supabase
        .from('recipes')
        .update({ like_count: testRecipe.like_count + 1 })
        .eq('id', testRecipe.id);
      
      if (updateError) {
        console.log('❌ Update failed:', updateError.message);
      } else {
        console.log('✅ Update successful');
        
        // Check if the update actually worked
        const { data: updatedRecipe } = await supabase
          .from('recipes')
          .select('like_count')
          .eq('id', testRecipe.id)
          .single();
        
        console.log(`   Updated like_count: ${updatedRecipe?.like_count}`);
        
        if (updatedRecipe?.like_count === testRecipe.like_count + 1) {
          console.log('✅ Direct update worked');
          
          // Revert the change
          await supabase
            .from('recipes')
            .update({ like_count: testRecipe.like_count })
            .eq('id', testRecipe.id);
          console.log('✅ Reverted test change');
        } else {
          console.log('❌ Direct update did not work');
        }
      }
    }

    console.log('\n🎉 Trigger status check completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkTriggerStatus();
