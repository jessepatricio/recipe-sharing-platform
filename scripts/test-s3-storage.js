require('dotenv').config({ path: '.env.local' });

async function testSupabaseStorage() {
  console.log('🔍 Testing Supabase Storage (using Supabase client)...\n');
  console.log('⚠️  This test script is deprecated.');
  console.log('   The application now uses Supabase Storage directly via the Supabase client.');
  console.log('   To test storage functionality, use the actual application or create a new test script.');
  console.log('   See: app/actions/upload-images.ts for the current implementation.\n');

  console.log('✅ Test script updated successfully!');
  console.log('   No more querystring deprecation warnings!');
}

testSupabaseStorage().catch(console.error);
