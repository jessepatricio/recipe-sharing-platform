const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function applyCompleteMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please check your .env.local file contains:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  console.log('🔗 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '009_complete_social_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Applying complete social schema migration...');
    console.log('This will create:');
    console.log('- likes table');
    console.log('- comments table');
    console.log('- Add social columns to recipes table');
    console.log('- Add missing columns to profiles table');
    console.log('- Create indexes and triggers');
    console.log('- Set up Row Level Security policies');
    console.log('');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error);
      
      // If the RPC function doesn't exist, provide manual instructions
      if (error.code === '42883') {
        console.log('');
        console.log('💡 The exec_sql function is not available. Please run the migration manually:');
        console.log('');
        console.log('1. Go to your Supabase project dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the contents of: supabase/migrations/009_complete_social_schema.sql');
        console.log('4. Click "Run" to execute the migration');
        console.log('');
        console.log('Or use the Supabase CLI:');
        console.log('supabase db push');
        return;
      }
      
      throw error;
    }

    console.log('✅ Migration applied successfully!');
    
    // Test the migration by checking if tables exist
    console.log('🔍 Verifying migration...');
    
    const { data: likesCheck, error: likesError } = await supabase
      .from('likes')
      .select('id')
      .limit(1);

    if (likesError) {
      console.error('❌ Likes table not found:', likesError.message);
      return;
    }

    const { data: commentsCheck, error: commentsError } = await supabase
      .from('comments')
      .select('id')
      .limit(1);

    if (commentsError) {
      console.error('❌ Comments table not found:', commentsError.message);
      return;
    }

    const { data: profilesCheck, error: profilesError } = await supabase
      .from('profiles')
      .select('username, full_name')
      .limit(1);

    if (profilesError) {
      console.error('❌ Profiles table missing columns:', profilesError.message);
      return;
    }

    const { data: recipesCheck, error: recipesError } = await supabase
      .from('recipes')
      .select('like_count, comment_count')
      .limit(1);

    if (recipesError) {
      console.error('❌ Recipes table missing social columns:', recipesError.message);
      return;
    }

    console.log('✅ All tables and columns verified successfully!');
    console.log('');
    console.log('🎉 Social features are now ready to use!');
    console.log('You can now:');
    console.log('- Like and unlike recipes');
    console.log('- Add comments to recipes');
    console.log('- Reply to comments (nested comments)');
    console.log('- See like and comment counts on recipe cards');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('');
    console.log('💡 Please run the migration manually:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of: supabase/migrations/009_complete_social_schema.sql');
    console.log('4. Click "Run" to execute the migration');
  }
}

applyCompleteMigration();

