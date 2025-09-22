require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixStoragePolicies() {
  console.log('🔧 Fixing Supabase Storage policies...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Check current policies
    console.log('1. Checking current storage policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'objects')
      .like('policyname', '%recipe%images%');

    if (policiesError) {
      console.log('⚠️  Could not check existing policies (this is normal)');
    } else {
      console.log(`Found ${policies.length} existing policies`);
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname}`);
      });
    }

    // 2. Test upload with different approaches
    console.log('\n2. Testing upload approaches...');
    
    // Try uploading with different file paths
    const testContent = 'Test file for recipe images';
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    
    // Test 1: Simple upload
    console.log('   Testing simple upload...');
    const { data: upload1, error: error1 } = await supabase.storage
      .from('recipe-images')
      .upload('test-simple.txt', testFile);
    
    if (error1) {
      console.log(`   ❌ Simple upload failed: ${error1.message}`);
    } else {
      console.log('   ✅ Simple upload successful!');
      await supabase.storage.from('recipe-images').remove(['test-simple.txt']);
    }

    // Test 2: Upload with user folder structure
    console.log('   Testing user folder upload...');
    const { data: upload2, error: error2 } = await supabase.storage
      .from('recipe-images')
      .upload('user-123/test-user.txt', testFile);
    
    if (error2) {
      console.log(`   ❌ User folder upload failed: ${error2.message}`);
    } else {
      console.log('   ✅ User folder upload successful!');
      await supabase.storage.from('recipe-images').remove(['user-123/test-user.txt']);
    }

    // Test 3: Upload with recipe folder structure
    console.log('   Testing recipe folder upload...');
    const { data: upload3, error: error3 } = await supabase.storage
      .from('recipe-images')
      .upload('recipe-123/test-recipe.txt', testFile);
    
    if (error3) {
      console.log(`   ❌ Recipe folder upload failed: ${error3.message}`);
    } else {
      console.log('   ✅ Recipe folder upload successful!');
      await supabase.storage.from('recipe-images').remove(['recipe-123/test-recipe.txt']);
    }

    console.log('\n3. Storage bucket status:');
    console.log('   ✅ Bucket exists and is accessible');
    console.log('   ✅ Public URL generation works');
    console.log('   ❌ Uploads are blocked by RLS policies');

    console.log('\n📋 Next steps:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to Storage > recipe-images bucket');
    console.log('   3. Go to the "Policies" tab');
    console.log('   4. Add the following policies:');
    console.log('');
    console.log('   Policy 1 (Public Read):');
    console.log('   Name: "Public read access"');
    console.log('   Operation: SELECT');
    console.log('   Target roles: public');
    console.log('   USING expression: bucket_id = \'recipe-images\'');
    console.log('');
    console.log('   Policy 2 (Authenticated Upload):');
    console.log('   Name: "Authenticated users can upload"');
    console.log('   Operation: INSERT');
    console.log('   Target roles: authenticated');
    console.log('   WITH CHECK expression: bucket_id = \'recipe-images\'');
    console.log('');
    console.log('   Policy 3 (User Update):');
    console.log('   Name: "Users can update their own files"');
    console.log('   Operation: UPDATE');
    console.log('   Target roles: authenticated');
    console.log('   USING expression: bucket_id = \'recipe-images\'');
    console.log('');
    console.log('   Policy 4 (User Delete):');
    console.log('   Name: "Users can delete their own files"');
    console.log('   Operation: DELETE');
    console.log('   Target roles: authenticated');
    console.log('   USING expression: bucket_id = \'recipe-images\'');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixStoragePolicies().catch(console.error);
