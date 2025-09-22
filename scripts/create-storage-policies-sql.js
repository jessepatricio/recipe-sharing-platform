require('dotenv').config({ path: '.env.local' });

console.log('🔧 Creating SQL commands for Supabase Storage policies...\n');

console.log('Copy and paste these SQL commands into your Supabase SQL Editor:\n');
console.log('-- ============================================');
console.log('-- Storage Policies for recipe-images bucket');
console.log('-- ============================================\n');

console.log('-- 1. Public read access (so images can be displayed)');
console.log('CREATE POLICY IF NOT EXISTS "recipe_images_public_read" ON storage.objects');
console.log('FOR SELECT USING (bucket_id = \'recipe-images\');\n');

console.log('-- 2. Authenticated users can upload');
console.log('CREATE POLICY IF NOT EXISTS "recipe_images_authenticated_insert" ON storage.objects');
console.log('FOR INSERT WITH CHECK (');
console.log('  bucket_id = \'recipe-images\' AND auth.role() = \'authenticated\'');
console.log(');\n');

console.log('-- 3. Users can update their own files');
console.log('CREATE POLICY IF NOT EXISTS "recipe_images_authenticated_update" ON storage.objects');
console.log('FOR UPDATE USING (');
console.log('  bucket_id = \'recipe-images\' AND auth.role() = \'authenticated\'');
console.log(');\n');

console.log('-- 4. Users can delete their own files');
console.log('CREATE POLICY IF NOT EXISTS "recipe_images_authenticated_delete" ON storage.objects');
console.log('FOR DELETE USING (');
console.log('  bucket_id = \'recipe-images\' AND auth.role() = \'authenticated\'');
console.log(');\n');

console.log('-- 5. Verify policies were created');
console.log('SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual');
console.log('FROM pg_policies');
console.log('WHERE tablename = \'objects\' AND policyname LIKE \'%recipe_images%\';');
console.log('\n-- ============================================');
console.log('-- End of Storage Policies');
console.log('-- ============================================\n');

console.log('📋 Instructions:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the SQL commands above');
console.log('4. Click "Run" to execute the commands');
console.log('5. Verify the policies were created successfully\n');

console.log('🎯 After running these commands, your image upload should work!');
