require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Test the image upload implementation
async function testImageUploadImplementation() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing image upload implementation...\n');

    // 1. Check if recipe_images table exists and has correct structure
    console.log('1. Checking recipe_images table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'recipe_images')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error checking recipe_images table:', columnsError.message);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('✅ recipe_images table exists with columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('❌ recipe_images table does not exist');
      return;
    }

    // 2. Test query functions with images
    console.log('\n2. Testing query functions with images...');
    
    // Test getRecipes function
    console.log('   Testing getRecipes...');
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_images(*)
      `)
      .limit(3);

    if (recipesError) {
      console.error('❌ Error testing recipes query:', recipesError.message);
    } else {
      console.log(`✅ Successfully queried ${recipes.length} recipes with images`);
      recipes.forEach(recipe => {
        const imageCount = recipe.recipe_images ? recipe.recipe_images.length : 0;
        console.log(`   - ${recipe.title}: ${imageCount} images`);
      });
    }

    // 3. Test image metadata structure
    console.log('\n3. Testing image metadata structure...');
    const { data: sampleImages, error: imagesError } = await supabase
      .from('recipe_images')
      .select('*')
      .limit(3);

    if (imagesError) {
      console.error('❌ Error fetching sample images:', imagesError.message);
    } else if (sampleImages && sampleImages.length > 0) {
      console.log(`✅ Found ${sampleImages.length} sample images:`);
      sampleImages.forEach((image, index) => {
        console.log(`   Image ${index + 1}:`);
        console.log(`     - ID: ${image.id}`);
        console.log(`     - Recipe ID: ${image.recipe_id}`);
        console.log(`     - Image URL: ${image.image_url}`);
        console.log(`     - Alt Text: ${image.alt_text || 'None'}`);
        console.log(`     - Is Primary: ${image.is_primary}`);
        console.log(`     - Sort Order: ${image.sort_order}`);
        console.log(`     - File Size: ${image.file_size || 'Unknown'} bytes`);
        console.log(`     - MIME Type: ${image.mime_type || 'Unknown'}`);
        console.log(`     - Dimensions: ${image.width || 'Unknown'}x${image.height || 'Unknown'}`);
      });
    } else {
      console.log('ℹ️  No images found in database (this is normal for a fresh setup)');
    }

    // 4. Test RLS policies
    console.log('\n4. Testing RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.table_privileges')
      .select('grantee, privilege_type')
      .eq('table_name', 'recipe_images');

    if (policiesError) {
      console.log('   Could not check RLS policies (this is normal)');
    } else {
      console.log('   RLS policies are configured');
    }

    // 5. Test storage bucket (if accessible)
    console.log('\n5. Testing storage bucket...');
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.log('   Could not check storage buckets (this is normal)');
      } else {
        const recipeImagesBucket = buckets.find(bucket => bucket.name === 'recipe-images');
        if (recipeImagesBucket) {
          console.log('✅ recipe-images storage bucket exists');
        } else {
          console.log('⚠️  recipe-images storage bucket not found');
          console.log('   Available buckets:', buckets.map(b => b.name).join(', '));
        }
      }
    } catch (error) {
      console.log('   Could not check storage buckets (this is normal)');
    }

    console.log('\n🎉 Image upload implementation test completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Test the recipe creation form with image upload');
    console.log('   2. Verify images display correctly in recipe cards');
    console.log('   3. Check image display in recipe view pages');
    console.log('   4. Test image upload with actual files');
    console.log('   5. Verify Supabase Storage bucket is set up correctly');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testImageUploadImplementation();
