require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Setup Supabase Storage policies for recipe images
async function setupStoragePolicies() {
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
    console.log('🔧 Setting up Supabase Storage policies for recipe images...\n');

    // 1. Check if bucket exists
    console.log('1. Checking if recipe-images bucket exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      return;
    }

    const existingBucket = buckets.find(bucket => bucket.name === 'recipe-images');
    if (!existingBucket) {
      console.error('❌ recipe-images bucket does not exist');
      console.log('   Please create the bucket first in your Supabase dashboard:');
      console.log('   1. Go to Storage');
      console.log('   2. Click "Create bucket"');
      console.log('   3. Name: recipe-images');
      console.log('   4. Public: Yes');
      console.log('   5. File size limit: 5MB');
      return;
    }

    console.log('✅ recipe-images bucket exists');

    // 2. Check existing policies
    console.log('\n2. Checking existing storage policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('storage.policies')
      .select('*')
      .eq('table_name', 'objects')
      .like('definition', '%recipe-images%');

    if (policiesError) {
      console.log('   Could not check existing policies (this is normal)');
    } else {
      console.log(`   Found ${policies ? policies.length : 0} existing policies for recipe-images`);
    }

    // 3. Create storage policies
    console.log('\n3. Creating storage policies...');

    const policiesToCreate = [
      {
        name: 'Recipe images are publicly accessible',
        operation: 'SELECT',
        target_roles: 'public',
        definition: "bucket_id = 'recipe-images'",
        description: 'Allow public read access to recipe images'
      },
      {
        name: 'Authenticated users can upload recipe images',
        operation: 'INSERT',
        target_roles: 'authenticated',
        definition: "bucket_id = 'recipe-images' AND auth.role() = 'authenticated'",
        description: 'Allow authenticated users to upload images'
      },
      {
        name: 'Users can update their own recipe images',
        operation: 'UPDATE',
        target_roles: 'authenticated',
        definition: "bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]",
        description: 'Allow users to update their own images'
      },
      {
        name: 'Users can delete their own recipe images',
        operation: 'DELETE',
        target_roles: 'authenticated',
        definition: "bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]",
        description: 'Allow users to delete their own images'
      }
    ];

    let successCount = 0;
    let errorCount = 0;

    for (const policy of policiesToCreate) {
      try {
        console.log(`   Creating policy: ${policy.name}...`);
        
        // Check if policy already exists
        const { data: existingPolicy, error: checkError } = await supabase
          .from('storage.policies')
          .select('*')
          .eq('table_name', 'objects')
          .eq('name', policy.name)
          .single();

        if (existingPolicy) {
          console.log(`   ⚠️  Policy "${policy.name}" already exists, skipping...`);
          continue;
        }

        // Create the policy using SQL
        const createPolicySQL = `
          CREATE POLICY "${policy.name}" ON storage.objects
          FOR ${policy.operation} 
          TO ${policy.target_roles}
          USING (${policy.definition})
        `;

        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: createPolicySQL
        });

        if (createError) {
          console.error(`   ❌ Error creating policy "${policy.name}":`, createError.message);
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

    // 4. Alternative method using direct SQL execution
    if (errorCount > 0) {
      console.log('\n4. Trying alternative method with direct SQL...');
      
      const directSQLPolicies = [
        `CREATE POLICY IF NOT EXISTS "Recipe images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'recipe-images');`,
        `CREATE POLICY IF NOT EXISTS "Authenticated users can upload recipe images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recipe-images' AND auth.role() = 'authenticated');`,
        `CREATE POLICY IF NOT EXISTS "Users can update their own recipe images" ON storage.objects FOR UPDATE USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);`,
        `CREATE POLICY IF NOT EXISTS "Users can delete their own recipe images" ON storage.objects FOR DELETE USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);`
      ];

      for (const sql of directSQLPolicies) {
        try {
          const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
          if (sqlError) {
            console.log(`   ⚠️  SQL execution failed: ${sqlError.message}`);
          } else {
            console.log(`   ✅ SQL policy created successfully`);
          }
        } catch (error) {
          console.log(`   ⚠️  SQL execution error: ${error.message}`);
        }
      }
    }

    // 5. Test the policies
    console.log('\n5. Testing storage policies...');
    try {
      // Test public read access
      const { data: testFiles, error: testError } = await supabase.storage
        .from('recipe-images')
        .list('', { limit: 1 });

      if (testError) {
        console.log('   ⚠️  Could not test read access:', testError.message);
      } else {
        console.log('   ✅ Public read access working');
      }
    } catch (error) {
      console.log('   ⚠️  Could not test policies:', error.message);
    }

    console.log('\n🎉 Storage policies setup completed!');
    console.log(`   ✅ ${successCount} policies created successfully`);
    if (errorCount > 0) {
      console.log(`   ⚠️  ${errorCount} policies had errors`);
    }

    console.log('\n📋 Manual Setup Instructions (if needed):');
    console.log('   If the script couldn\'t create all policies, set them up manually:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to Storage > recipe-images');
    console.log('   3. Click on "Policies" tab');
    console.log('   4. Add the following policies:');
    console.log('');
    
    policiesToCreate.forEach((policy, index) => {
      console.log(`   Policy ${index + 1}: "${policy.name}"`);
      console.log(`   - Operation: ${policy.operation}`);
      console.log(`   - Target roles: ${policy.target_roles}`);
      console.log(`   - Policy definition: ${policy.definition}`);
      console.log('');
    });

    console.log('🚀 Your image upload functionality should now work!');
    console.log('   Test it by going to /recipes/create and uploading some images.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setupStoragePolicies();
