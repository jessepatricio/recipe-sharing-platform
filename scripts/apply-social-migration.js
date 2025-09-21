const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function applySocialMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please check your .env.local file');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Applying social features migration...');

    // First, check if the migration has already been applied
    const { data: likesCheck, error: likesError } = await supabase
      .from('likes')
      .select('id')
      .limit(1);

    if (!likesError) {
      console.log('✅ Social features migration already applied');
      return;
    }

    console.log('📝 Migration needed. Please run the following SQL in your Supabase dashboard:');
    console.log('');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the migration from: supabase/migrations/007_add_likes_comments_tables.sql');
    console.log('4. Run the migration from: supabase/migrations/008_fix_profiles_table.sql');
    console.log('');
    console.log('Or use the Supabase CLI:');
    console.log('supabase db push');

  } catch (error) {
    console.error('❌ Error checking migration status:', error.message);
  }
}

applySocialMigration();
