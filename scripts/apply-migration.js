const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    console.log('Please make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Applying migration to remove difficulty constraint...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '009_remove_difficulty_constraint_allow_null.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Migration SQL:');
    console.log(migrationSQL);
    console.log('\nExecuting migration...');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try executing the SQL directly
      console.log('\nTrying direct SQL execution...');
      
      // Split the migration into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        if (stmtError) {
          console.error(`❌ Statement failed:`, stmtError);
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    } else {
      console.log('✅ Migration applied successfully');
    }

    // Test the migration by trying to insert a recipe
    console.log('\nTesting migration with recipe insertion...');
    
    const testData = {
      title: 'Test Recipe After Migration',
      description: 'Testing the migration',
      cooking_time: 30,
      difficulty: 'Easy',
      category: 'Test',
      user_id: '00000000-0000-0000-0000-000000000000',
      ingredients: ['test ingredient'],
      instructions: ['test instruction']
    };

    const { data: insertData, error: insertError } = await supabase
      .from('recipes')
      .insert([testData])
      .select();

    if (insertError) {
      console.error('❌ Recipe insertion failed:', insertError);
    } else {
      console.log('✅ Recipe insertion successful:', insertData[0].id);
      // Clean up
      await supabase.from('recipes').delete().eq('id', insertData[0].id);
      console.log('✅ Test record cleaned up');
    }

  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

applyMigration().catch(console.error);
