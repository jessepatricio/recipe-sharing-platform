// Test script to verify recipe creation with arrays works
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRecipeCreationWithArrays() {
  try {
    console.log('Testing recipe creation with arrays...');
    
    // Test data with arrays
    const testRecipe = {
      title: 'Test Recipe with Arrays',
      description: 'This is a test recipe to verify the creation works with arrays',
      cooking_time: '20 mins',
      difficulty: 'Easy',
      servings: 3,
      tags: ['test', 'quick', 'healthy'],
      ingredients: ['2 cups flour', '1 cup sugar', '3 eggs', '1 tsp vanilla'],
      instructions: [
        'Preheat oven to 350°F',
        'Mix flour and sugar in a bowl',
        'Add eggs and vanilla',
        'Bake for 20 minutes'
      ],
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

    console.log('✅ Recipe created successfully with arrays!');
    console.log('Recipe ID:', data[0].id);
    console.log('Ingredients:', data[0].ingredients);
    console.log('Instructions:', data[0].instructions);

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

testRecipeCreationWithArrays();
