const { createClient } = require('@supabase/supabase-js');

async function checkDatabaseConstraint() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Checking database constraint and schema...\n');

  try {
    // Check if the recipes table exists and get its structure
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'recipes');

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return;
    }

    console.log('Tables found:', tables);

    // Check the constraint definition
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.check_constraints')
      .select('constraint_name, check_clause')
      .eq('constraint_schema', 'public')
      .like('constraint_name', '%difficulty%');

    if (constraintsError) {
      console.error('Error checking constraints:', constraintsError);
    } else {
      console.log('Constraints found:', constraints);
    }

    // Try to get the table structure
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'recipes')
      .eq('column_name', 'difficulty');

    if (columnsError) {
      console.error('Error checking columns:', columnsError);
    } else {
      console.log('Difficulty column info:', columns);
    }

    // Test a simple insert to see what happens
    console.log('\nTesting simple insert...');
    const testData = {
      title: 'Test Recipe',
      description: 'Test description',
      cooking_time: 30,
      difficulty: 'Easy',
      category: 'Test',
      user_id: '00000000-0000-0000-0000-000000000000',
      ingredients: ['test'],
      instructions: ['test']
    };

    console.log('Inserting data:', JSON.stringify(testData, null, 2));

    const { data, error } = await supabase
      .from('recipes')
      .insert([testData])
      .select();

    if (error) {
      console.log('❌ Insert failed:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      console.log('Error details:', error.details);
      console.log('Error hint:', error.hint);
    } else {
      console.log('✅ Insert successful:', data);
      // Clean up
      await supabase.from('recipes').delete().eq('id', data[0].id);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
}

checkDatabaseConstraint().catch(console.error);
