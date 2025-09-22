require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function debugImageUpload() {
  console.log('🔍 Debugging image upload issue...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  console.log('✅ Environment variables found');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Supabase Key: ${supabaseKey.substring(0, 20)}...`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Check if we can connect to Supabase
    console.log('\n1. Testing Supabase connection...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('⚠️  Not authenticated (this is normal for anon key)');
    } else {
      console.log('✅ Authenticated user found');
    }

    // 2. Check storage buckets
    console.log('\n2. Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      return;
    }

    console.log(`Found ${buckets.length} buckets:`);
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public})`);
    });

    const recipeImagesBucket = buckets.find(b => b.name === 'recipe-images');
    if (recipeImagesBucket) {
      console.log('✅ recipe-images bucket exists');
      console.log(`   Public: ${recipeImagesBucket.public}`);
      console.log(`   Created: ${recipeImagesBucket.created_at}`);
    } else {
      console.log('❌ recipe-images bucket does NOT exist');
      console.log('   This is why image uploads are failing!');
    }

    // 3. Test file upload (if bucket exists)
    if (recipeImagesBucket) {
      console.log('\n3. Testing file upload...');
      
      // Create a simple test file
      const testContent = 'This is a test image file';
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload('test/test-file.txt', testFile);
      
      if (uploadError) {
        console.error('❌ Upload test failed:', uploadError.message);
        console.log('   This indicates a permissions issue');
      } else {
        console.log('✅ Upload test successful');
        console.log(`   File path: ${uploadData.path}`);
        
        // Clean up test file
        await supabase.storage
          .from('recipe-images')
          .remove(['test/test-file.txt']);
        console.log('   Test file cleaned up');
      }
    }

    // 4. Check database table
    console.log('\n4. Checking recipe_images table...');
    const { data: images, error: imagesError } = await supabase
      .from('recipe_images')
      .select('*')
      .limit(5);
    
    if (imagesError) {
      console.error('❌ Error querying recipe_images table:', imagesError.message);
    } else {
      console.log(`✅ recipe_images table accessible (${images.length} records found)`);
      if (images.length > 0) {
        console.log('   Sample record:', images[0]);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

debugImageUpload().catch(console.error);
