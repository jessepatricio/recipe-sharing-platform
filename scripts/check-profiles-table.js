const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkProfilesTable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Checking profiles table structure...');
    
    // Get a sample profile to see what fields exist
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching profiles:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Fields that exist in your profiles table:');
      console.log('==========================================');
      Object.keys(data[0]).forEach(field => {
        console.log(`✓ ${field}: ${typeof data[0][field]}`);
      });
    } else {
      console.log('ℹ️  No profiles found. This might be expected if no users have signed up yet.');
    }

    // Check if specific columns exist by trying to select them
    console.log('\n🔍 Checking for specific social feature columns...');
    
    const columnsToCheck = ['username', 'full_name', 'bio', 'updated_at'];
    
    for (const column of columnsToCheck) {
      try {
        const { error: columnError } = await supabase
          .from('profiles')
          .select(column)
          .limit(1);
        
        if (columnError) {
          console.log(`❌ Column '${column}' does not exist`);
        } else {
          console.log(`✅ Column '${column}' exists`);
        }
      } catch (err) {
        console.log(`❌ Error checking column '${column}':`, err.message);
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

checkProfilesTable();
