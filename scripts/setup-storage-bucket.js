require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Setup Supabase Storage bucket for recipe images
async function setupStorageBucket() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('   Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Setting up Supabase Storage bucket for recipe images...\n');

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
      return;
    }

    console.log('✅ Successfully created recipe-images bucket');
    console.log('   Bucket details:', bucketData);

    // 3. Set up storage policies
    console.log('\n3. Setting up storage policies...');
    console.log('   Note: Storage policies need to be set up manually in the Supabase dashboard');
    console.log('   Go to: Storage > recipe-images > Policies');
    console.log('   Add the following policies:');
    console.log('');
    console.log('   Policy 1: "Recipe images are publicly accessible"');
    console.log('   - Operation: SELECT');
    console.log('   - Target roles: public');
    console.log('   - Policy definition: true');
    console.log('');
    console.log('   Policy 2: "Authenticated users can upload recipe images"');
    console.log('   - Operation: INSERT');
    console.log('   - Target roles: authenticated');
    console.log('   - Policy definition: true');
    console.log('');
    console.log('   Policy 3: "Users can update their own recipe images"');
    console.log('   - Operation: UPDATE');
    console.log('   - Target roles: authenticated');
    console.log('   - Policy definition: auth.uid()::text = (storage.foldername(name))[1]');
    console.log('');
    console.log('   Policy 4: "Users can delete their own recipe images"');
    console.log('   - Operation: DELETE');
    console.log('   - Target roles: authenticated');
    console.log('   - Policy definition: auth.uid()::text = (storage.foldername(name))[1]');

    console.log('\n🎉 Storage bucket setup completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to Storage > recipe-images');
    console.log('   3. Set up the storage policies as shown above');
    console.log('   4. Test image upload in your application');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setupStorageBucket();
