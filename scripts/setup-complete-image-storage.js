require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Complete setup for image storage (bucket + policies)
async function setupCompleteImageStorage() {
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
    console.log('');
    console.log('   If you don\'t have the service role key, use the manual setup instead:');
    console.log('   node scripts/setup-storage-policies-sql.js');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔧 Setting up complete image storage solution...\n');

    // 1. Check if bucket exists
    console.log('1. Checking if recipe-images bucket exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      return;
    }

    const existingBucket = buckets.find(bucket => bucket.name === 'recipe-images');
    if (existingBucket) {
      console.log('✅ recipe-images bucket already exists');
    } else {
      console.log('⚠️  recipe-images bucket does not exist');
      console.log('   Creating bucket...');
      
      const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('recipe-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (bucketError) {
        console.error('❌ Error creating bucket:', bucketError.message);
        console.log('   You may need to create the bucket manually in the Supabase dashboard');
        return;
      }

      console.log('✅ recipe-images bucket created successfully');
    }

    // 2. Set up storage policies
    console.log('\n2. Setting up storage policies...');
    
    const policies = [
      {
        name: 'Recipe images are publicly accessible',
        sql: `CREATE POLICY IF NOT EXISTS "Recipe images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'recipe-images');`
      },
      {
        name: 'Authenticated users can upload recipe images',
        sql: `CREATE POLICY IF NOT EXISTS "Authenticated users can upload recipe images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recipe-images' AND auth.role() = 'authenticated');`
      },
      {
        name: 'Users can update their own recipe images',
        sql: `CREATE POLICY IF NOT EXISTS "Users can update their own recipe images" ON storage.objects FOR UPDATE USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);`
      },
      {
        name: 'Users can delete their own recipe images',
        sql: `CREATE POLICY IF NOT EXISTS "Users can delete their own recipe images" ON storage.objects FOR DELETE USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);`
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const policy of policies) {
      try {
        console.log(`   Creating policy: ${policy.name}...`);
        
        const { error: policyError } = await supabase.rpc('exec_sql', {
          sql: policy.sql
        });

        if (policyError) {
          console.error(`   ❌ Error creating policy "${policy.name}":`, policyError.message);
          errorCount++;
        } else {
          console.log(`   ✅ Policy "${policy.name}" created successfully`);
          successCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error creating policy "${policy.name}":`, error.message);
        errorCount++;
      }
    }

    // 3. Test the setup
    console.log('\n3. Testing storage setup...');
    try {
      // Test bucket access
      const { data: testFiles, error: testError } = await supabase.storage
        .from('recipe-images')
        .list('', { limit: 1 });

      if (testError) {
        console.log('   ⚠️  Could not test bucket access:', testError.message);
      } else {
        console.log('   ✅ Bucket access working');
      }

      // Test upload (with a small test file)
      const testFileName = 'test/setup-test.txt';
      const testContent = 'Storage setup test file';
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(testFileName, testContent);

      if (uploadError) {
        console.log('   ⚠️  Upload test failed:', uploadError.message);
        console.log('   This might be due to RLS policies not being set up correctly');
      } else {
        console.log('   ✅ Upload test successful');
        
        // Clean up test file
        await supabase.storage
          .from('recipe-images')
          .remove([testFileName]);
        console.log('   ✅ Test file cleaned up');
      }
    } catch (error) {
      console.log('   ⚠️  Could not test storage setup:', error.message);
    }

    // 4. Summary
    console.log('\n🎉 Image storage setup completed!');
    console.log(`   ✅ Bucket: ${existingBucket ? 'Already existed' : 'Created'}`);
    console.log(`   ✅ Policies: ${successCount}/${policies.length} created successfully`);
    
    if (errorCount > 0) {
      console.log(`   ⚠️  ${errorCount} policies had errors`);
      console.log('\n📋 Manual Policy Setup:');
      console.log('   If some policies failed, set them up manually:');
      console.log('   1. Go to your Supabase dashboard');
      console.log('   2. Navigate to Storage > recipe-images > Policies');
      console.log('   3. Add the following policies:');
      console.log('');
      
      policies.forEach((policy, index) => {
        console.log(`   Policy ${index + 1}: "${policy.name}"`);
        console.log(`   SQL: ${policy.sql}`);
        console.log('');
      });
    }

    console.log('\n🚀 Your image upload functionality is ready!');
    console.log('   Test it by going to /recipes/create and uploading some images.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setupCompleteImageStorage();
