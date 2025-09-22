require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Verify image storage setup
async function verifyImageStorageSetup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Verifying image storage setup...\n');

    // 1. Check bucket exists
    console.log('1. Checking storage bucket...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      return;
    }

    const recipeImagesBucket = buckets.find(bucket => bucket.name === 'recipe-images');
    if (recipeImagesBucket) {
      console.log('✅ recipe-images bucket exists');
      console.log(`   - Public: ${recipeImagesBucket.public}`);
      console.log(`   - File size limit: ${recipeImagesBucket.file_size_limit || 'Not set'}`);
    } else {
      console.log('❌ recipe-images bucket does not exist');
      console.log('   Please create it in your Supabase dashboard');
      return;
    }

    // 2. Test bucket access
    console.log('\n2. Testing bucket access...');
    const { data: files, error: listError } = await supabase.storage
      .from('recipe-images')
      .list('', { limit: 5 });

    if (listError) {
      console.log('❌ Cannot access bucket:', listError.message);
      console.log('   This might be due to missing storage policies');
    } else {
      console.log('✅ Bucket access working');
      console.log(`   Found ${files ? files.length : 0} files in bucket`);
    }

    // 3. Test database schema
    console.log('\n3. Testing database schema...');
    const { data: images, error: imagesError } = await supabase
      .from('recipe_images')
      .select('*')
      .limit(1);

    if (imagesError) {
      console.log('❌ Cannot access recipe_images table:', imagesError.message);
    } else {
      console.log('✅ recipe_images table accessible');
      console.log(`   Found ${images ? images.length : 0} images in database`);
    }

    // 4. Test recipe queries with images
    console.log('\n4. Testing recipe queries with images...');
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_images(*)
      `)
      .limit(3);

    if (recipesError) {
      console.log('❌ Cannot query recipes with images:', recipesError.message);
    } else {
      console.log('✅ Recipe queries with images working');
      recipes.forEach(recipe => {
        const imageCount = recipe.recipe_images ? recipe.recipe_images.length : 0;
        console.log(`   - ${recipe.title}: ${imageCount} images`);
      });
    }

    // 5. Test upload (if possible)
    console.log('\n5. Testing image upload...');
    try {
      const testFileName = 'test/verification-test.txt';
      const testContent = 'Verification test file';
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(testFileName, testContent);

      if (uploadError) {
        console.log('⚠️  Upload test failed:', uploadError.message);
        console.log('   This might be due to missing storage policies');
      } else {
        console.log('✅ Upload test successful');
        
        // Clean up test file
        await supabase.storage
          .from('recipe-images')
          .remove([testFileName]);
        console.log('✅ Test file cleaned up');
      }
    } catch (error) {
      console.log('⚠️  Upload test error:', error.message);
    }

    // 6. Summary
    console.log('\n📋 Setup Status:');
    console.log(`   ${recipeImagesBucket ? '✅' : '❌'} Storage bucket exists`);
    console.log(`   ${!listError ? '✅' : '❌'} Bucket access working`);
    console.log(`   ${!imagesError ? '✅' : '❌'} Database schema working`);
    console.log(`   ${!recipesError ? '✅' : '❌'} Recipe queries working`);

    if (recipeImagesBucket && !listError && !imagesError && !recipesError) {
      console.log('\n🎉 Image storage setup is working correctly!');
      console.log('   You can now test image uploads in your application.');
    } else {
      console.log('\n⚠️  Some issues found with the setup.');
      console.log('   Please check the errors above and fix them.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

verifyImageStorageSetup();
