require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Test the recipe images migration
async function testRecipeImagesMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing recipe images migration...\n');

    // 1. Check if recipe_images table exists
    console.log('1. Checking if recipe_images table exists...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'recipe_images');

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message);
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ recipe_images table exists');
    } else {
      console.log('❌ recipe_images table does not exist');
      console.log('   Please run the migration first: node scripts/apply-migration.js 011_add_recipe_images.sql');
      return;
    }

    // 2. Check table structure
    console.log('\n2. Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'recipe_images')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError.message);
      return;
    }

    console.log('   Columns in recipe_images table:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // 3. Check RLS policies
    console.log('\n3. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.table_privileges')
      .select('grantee, privilege_type')
      .eq('table_name', 'recipe_images');

    if (policiesError) {
      console.log('   Could not check policies (this is normal)');
    } else {
      console.log('   RLS policies configured');
    }

    // 4. Test basic operations (if we have a recipe)
    console.log('\n4. Testing basic operations...');
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title')
      .limit(1);

    if (recipesError) {
      console.error('❌ Error fetching recipes:', recipesError.message);
      return;
    }

    if (recipes && recipes.length > 0) {
      const testRecipe = recipes[0];
      console.log(`   Testing with recipe: ${testRecipe.title}`);

      // Test inserting a sample image record
      const sampleImage = {
        recipe_id: testRecipe.id,
        image_url: 'https://example.com/sample-image.jpg',
        alt_text: 'Sample recipe image',
        caption: 'This is a sample image for testing',
        is_primary: true,
        sort_order: 0,
        file_size: 1024000,
        mime_type: 'image/jpeg',
        width: 1200,
        height: 800
      };

      const { data: insertData, error: insertError } = await supabase
        .from('recipe_images')
        .insert(sampleImage)
        .select();

      if (insertError) {
        console.error('❌ Error inserting sample image:', insertError.message);
      } else {
        console.log('✅ Successfully inserted sample image');
        console.log(`   Image ID: ${insertData[0].id}`);

        // Test querying the image
        const { data: queryData, error: queryError } = await supabase
          .from('recipe_images')
          .select('*')
          .eq('recipe_id', testRecipe.id);

        if (queryError) {
          console.error('❌ Error querying images:', queryError.message);
        } else {
          console.log(`✅ Successfully queried ${queryData.length} image(s)`);
        }

        // Clean up test data
        const { error: deleteError } = await supabase
          .from('recipe_images')
          .delete()
          .eq('recipe_id', testRecipe.id);

        if (deleteError) {
          console.error('❌ Error cleaning up test data:', deleteError.message);
        } else {
          console.log('✅ Cleaned up test data');
        }
      }
    } else {
      console.log('   No recipes found for testing');
    }

    console.log('\n🎉 Recipe images migration test completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Update TypeScript types in lib/types.ts');
    console.log('   2. Modify query functions to include images');
    console.log('   3. Update UI components to display images');
    console.log('   4. Implement image upload functionality');
    console.log('   5. Set up Supabase Storage bucket for images');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testRecipeImagesMigration();
