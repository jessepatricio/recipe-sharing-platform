require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create storage bucket manually using service role key
async function createStorageBucket() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('   Make sure you have:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    console.log('');
    console.log('   You can find the service role key in your Supabase dashboard:');
    console.log('   Settings > API > service_role key');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔧 Creating Supabase Storage bucket for recipe images...\n');

    // 1. Check if bucket already exists
    console.log('1. Checking existing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      return;
    }

    const existingBucket = buckets.find(bucket => bucket.name === 'recipe-images');
    if (existingBucket) {
      console.log('✅ recipe-images bucket already exists');
      console.log('   Bucket details:', existingBucket);
      return;
    }

    // 2. Create the bucket
    console.log('2. Creating recipe-images bucket...');
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('recipe-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (bucketError) {
      console.error('❌ Error creating bucket:', bucketError.message);
      console.log('   This might be due to RLS policies or permissions');
      console.log('   You may need to create the bucket manually in the Supabase dashboard');
      return;
    }

    console.log('✅ Successfully created recipe-images bucket');
    console.log('   Bucket details:', bucketData);

    // 3. Test upload to verify bucket works
    console.log('\n3. Testing bucket functionality...');
    const testFileName = 'test/test-image.txt';
    const testContent = 'This is a test file';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload(testFileName, testContent);

    if (uploadError) {
      console.log('⚠️  Test upload failed:', uploadError.message);
      console.log('   This is normal if RLS policies are not set up yet');
    } else {
      console.log('✅ Test upload successful');
      
      // Clean up test file
      await supabase.storage
        .from('recipe-images')
        .remove([testFileName]);
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 Storage bucket setup completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to Storage > recipe-images');
    console.log('   3. Set up the storage policies (see below)');
    console.log('   4. Test image upload in your application');
    
    console.log('\n🔐 Required Storage Policies:');
    console.log('   Go to: Storage > recipe-images > Policies');
    console.log('   Add these policies:');
    console.log('');
    console.log('   1. "Public read access"');
    console.log('      - Operation: SELECT');
    console.log('      - Target roles: public');
    console.log('      - Policy definition: true');
    console.log('');
    console.log('   2. "Authenticated upload"');
    console.log('      - Operation: INSERT');
    console.log('      - Target roles: authenticated');
    console.log('      - Policy definition: true');
    console.log('');
    console.log('   3. "User update own files"');
    console.log('      - Operation: UPDATE');
    console.log('      - Target roles: authenticated');
    console.log('      - Policy definition: auth.uid()::text = (storage.foldername(name))[1]');
    console.log('');
    console.log('   4. "User delete own files"');
    console.log('      - Operation: DELETE');
    console.log('      - Target roles: authenticated');
    console.log('      - Policy definition: auth.uid()::text = (storage.foldername(name))[1]');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createStorageBucket();
