require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Generate SQL commands for setting up storage policies
async function generateStoragePoliciesSQL() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Generating SQL commands for Supabase Storage policies...\n');

    // 1. Check if bucket exists
    console.log('1. Checking if recipe-images bucket exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      return;
    }

    const existingBucket = buckets.find(bucket => bucket.name === 'recipe-images');
    if (!existingBucket) {
      console.log('⚠️  recipe-images bucket does not exist');
      console.log('   Please create it first in your Supabase dashboard');
    } else {
      console.log('✅ recipe-images bucket exists');
    }

    // 2. Generate SQL commands
    console.log('\n2. Generated SQL commands for storage policies:');
    console.log('   Copy and paste these into your Supabase SQL editor:\n');

    const sqlCommands = [
      '-- Storage policies for recipe-images bucket',
      '-- Run these commands in your Supabase SQL editor',
      '',
      '-- Policy 1: Public read access',
      'CREATE POLICY IF NOT EXISTS "Recipe images are publicly accessible" ON storage.objects',
      'FOR SELECT USING (bucket_id = \'recipe-images\');',
      '',
      '-- Policy 2: Authenticated users can upload',
      'CREATE POLICY IF NOT EXISTS "Authenticated users can upload recipe images" ON storage.objects',
      'FOR INSERT WITH CHECK (',
      '  bucket_id = \'recipe-images\' AND auth.role() = \'authenticated\'',
      ');',
      '',
      '-- Policy 3: Users can update their own images',
      'CREATE POLICY IF NOT EXISTS "Users can update their own recipe images" ON storage.objects',
      'FOR UPDATE USING (',
      '  bucket_id = \'recipe-images\' AND auth.uid()::text = (storage.foldername(name))[1]',
      ');',
      '',
      '-- Policy 4: Users can delete their own images',
      'CREATE POLICY IF NOT EXISTS "Users can delete their own recipe images" ON storage.objects',
      'FOR DELETE USING (',
      '  bucket_id = \'recipe-images\' AND auth.uid()::text = (storage.foldername(name))[1]',
      ');',
      '',
      '-- Verify policies were created',
      'SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual',
      'FROM pg_policies',
      'WHERE tablename = \'objects\' AND policyname LIKE \'%recipe%images%\';'
    ];

    sqlCommands.forEach(line => {
      console.log(line);
    });

    console.log('\n📋 Instructions:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the SQL commands above');
    console.log('   4. Click "Run" to execute the commands');
    console.log('   5. Verify the policies were created successfully');

    // 3. Test current policies
    console.log('\n3. Checking current storage policies...');
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('storage.policies')
        .select('*')
        .eq('table_name', 'objects')
        .like('definition', '%recipe-images%');

      if (policiesError) {
        console.log('   Could not check existing policies (this is normal)');
      } else {
        console.log(`   Found ${policies ? policies.length : 0} existing policies for recipe-images`);
        if (policies && policies.length > 0) {
          policies.forEach(policy => {
            console.log(`   - ${policy.name}: ${policy.cmd}`);
          });
        }
      }
    } catch (error) {
      console.log('   Could not check existing policies');
    }

    console.log('\n🎉 SQL commands generated successfully!');
    console.log('   Follow the instructions above to set up the storage policies.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

generateStoragePoliciesSQL();
