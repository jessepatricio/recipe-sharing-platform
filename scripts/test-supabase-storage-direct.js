require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseStorageDirect() {
  console.log('🔍 Testing Supabase Storage directly...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Try to list objects in the recipe-images bucket directly
    console.log('1. Testing direct access to recipe-images bucket...');
    const { data: objects, error: listError } = await supabase.storage
      .from('recipe-images')
      .list('', { limit: 10 });

    if (listError) {
      console.error('❌ Error listing objects:', listError.message);
      console.log('   This suggests the bucket might not be accessible via Supabase client');
    } else {
      console.log('✅ Successfully accessed recipe-images bucket!');
      console.log(`   Found ${objects.length} objects`);
      objects.forEach(obj => {
        console.log(`     - ${obj.name} (${obj.metadata?.size || 'unknown'} bytes)`);
      });
    }

    // 2. Try to upload a test file
    console.log('\n2. Testing file upload...');
    const testContent = 'This is a test file for recipe images';
    const testFile = new File([testContent], 'test-upload.txt', { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload('test/test-upload.txt', testFile);

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message);
      console.log('   This confirms the bucket is not accessible via Supabase client');
    } else {
      console.log('✅ Upload successful!');
      console.log(`   Path: ${uploadData.path}`);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(uploadData.path);
      console.log(`   Public URL: ${urlData.publicUrl}`);
      
      // Clean up
      await supabase.storage
        .from('recipe-images')
        .remove(['test/test-upload.txt']);
      console.log('   Test file cleaned up');
    }

    // 3. Check if we can get the public URL of a file
    console.log('\n3. Testing public URL generation...');
    const { data: urlData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl('test/sample.jpg');
    console.log('✅ Public URL generation works');
    console.log(`   Sample URL: ${urlData.publicUrl}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testSupabaseStorageDirect().catch(console.error);
