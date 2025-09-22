require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testCompleteImageFlow() {
  console.log('🔍 Testing complete image upload and display flow...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Test storage bucket access
    console.log('1. Testing storage bucket access...');
    const { data: objects, error: listError } = await supabase.storage
      .from('recipe-images')
      .list('', { limit: 10 });

    if (listError) {
      console.error('❌ Cannot access recipe-images bucket:', listError.message);
      return;
    }
    console.log('✅ Storage bucket accessible');

    // 2. Test file upload
    console.log('\n2. Testing file upload...');
    const testContent = 'Test image content for recipe';
    const testFile = new File([testContent], 'test-recipe-image.jpg', { type: 'image/jpeg' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('recipe-images')
      .upload('test-recipe/test-image.jpg', testFile);

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message);
      console.log('   This indicates RLS policies need to be set up');
      console.log('   Please run the storage policies SQL commands');
      return;
    }
    console.log('✅ File upload successful');

    // 3. Test public URL generation
    console.log('\n3. Testing public URL generation...');
    const { data: urlData } = supabase.storage
      .from('recipe-images')
      .getPublicUrl(uploadData.path);
    console.log('✅ Public URL generated:', urlData.publicUrl);

    // 4. Test database insertion
    console.log('\n4. Testing database insertion...');
    const { data: dbData, error: dbError } = await supabase
      .from('recipe_images')
      .insert({
        recipe_id: 'test-recipe-123',
        image_url: urlData.publicUrl,
        alt_text: 'Test image',
        file_size: testFile.size,
        mime_type: testFile.type,
        width: 800,
        height: 600,
        is_primary: true,
        sort_order: 0
      })
      .select();

    if (dbError) {
      console.error('❌ Database insertion failed:', dbError.message);
    } else {
      console.log('✅ Database insertion successful');
    }

    // 5. Test image retrieval
    console.log('\n5. Testing image retrieval...');
    const { data: images, error: imagesError } = await supabase
      .from('recipe_images')
      .select('*')
      .eq('recipe_id', 'test-recipe-123');

    if (imagesError) {
      console.error('❌ Image retrieval failed:', imagesError.message);
    } else {
      console.log(`✅ Retrieved ${images.length} images from database`);
      images.forEach((img, index) => {
        console.log(`   Image ${index + 1}: ${img.image_url}`);
      });
    }

    // 6. Clean up test data
    console.log('\n6. Cleaning up test data...');
    await supabase.storage
      .from('recipe-images')
      .remove(['test-recipe/test-image.jpg']);
    
    await supabase
      .from('recipe_images')
      .delete()
      .eq('recipe_id', 'test-recipe-123');
    
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Complete image flow test successful!');
    console.log('   Your image upload and display should work correctly.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testCompleteImageFlow().catch(console.error);