// Simple script to check what fields exist in your Supabase recipes table
// Run this with: node scripts/check-db-fields.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecipeFields() {
  try {
    // Get a sample recipe to see what fields exist
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching recipe:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('Fields that exist in your recipes table:');
      console.log('=====================================');
      Object.keys(data[0]).forEach(field => {
        console.log(`✓ ${field}: ${typeof data[0][field]}`);
      });
      
      console.log('\nFields from migration 001 (should exist):');
      console.log('id, title, description, cooking_time, difficulty, servings, tags, user_id, created_at, updated_at');
      
      console.log('\nFields from migration 002 (may not exist yet):');
      console.log('prep_time, total_time, ingredients, instructions, cuisine_type, meal_type, nutrition, is_public');
    } else {
      console.log('No recipes found. Creating a test recipe...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('recipes')
        .insert([{
          title: 'Test Recipe',
          description: 'Test description',
          cooking_time: '15 mins',
          difficulty: 'Easy',
          servings: 2,
          user_id: '00000000-0000-0000-0000-000000000000' // Dummy ID
        }])
        .select();

      if (insertError) {
        console.error('Error creating test recipe:', insertError);
      } else {
        console.log('Test recipe created. Fields available:');
        Object.keys(insertData[0]).forEach(field => {
          console.log(`✓ ${field}: ${typeof insertData[0][field]}`);
        });
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkRecipeFields();
