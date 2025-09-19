// Test script to verify recipe creation works
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRecipeCreation() {
  try {
    console.log('Testing recipe creation...');
    
    // Test data with only core fields
    const testRecipe = {
      title: 'Test Recipe',
      description: 'This is a test recipe to verify the creation works',
      cooking_time: '15 mins',
      difficulty: 'Easy',
      servings: 2,
      tags: ['test', 'quick'],
      user_id: '00000000-0000-0000-0000-000000000000' // Dummy user ID
    };

    const { data, error } = await supabase
      .from('recipes')
      .insert([testRecipe])
      .select();

    if (error) {
      console.error('❌ Error creating recipe:', error);
      return;
    }

    console.log('✅ Recipe created successfully!');
    console.log('Recipe ID:', data[0].id);
    console.log('Recipe data:', data[0]);

    // Clean up - delete the test recipe
    const { error: deleteError } = await supabase
      .from('recipes')
      .delete()
      .eq('id', data[0].id);

    if (deleteError) {
      console.log('⚠️  Warning: Could not delete test recipe:', deleteError.message);
    } else {
      console.log('✅ Test recipe cleaned up successfully');
    }

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

testRecipeCreation();
