const { createClient } = require('@supabase/supabase-js');

async function checkCurrentConstraints() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Checking current constraints on recipes table...\n');

  try {
    // Check all constraints on the recipes table
    const { data: constraints, error } = await supabase
      .from('information_schema.check_constraints')
      .select('constraint_name, check_clause, table_name')
      .eq('constraint_schema', 'public')
      .eq('table_name', 'recipes');

    if (error) {
      console.error('Error checking constraints:', error);
      return;
    }

    console.log('Current constraints on recipes table:');
    if (constraints.length === 0) {
      console.log('No constraints found');
    } else {
      constraints.forEach(constraint => {
        console.log(`- ${constraint.constraint_name}: ${constraint.check_clause}`);
      });
    }

    // Also check table structure
    console.log('\nChecking table structure...');
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('constraint_schema', 'public')
      .eq('table_name', 'recipes')
      .eq('column_name', 'difficulty');

    if (columnError) {
      console.error('Error checking columns:', columnError);
    } else {
      console.log('Difficulty column info:');
      columns.forEach(col => {
        console.log(`- Name: ${col.column_name}`);
        console.log(`- Type: ${col.data_type}`);
        console.log(`- Nullable: ${col.is_nullable}`);
        console.log(`- Default: ${col.column_default}`);
      });
    }

  } catch (err) {
    console.error('Exception:', err);
  }
}

checkCurrentConstraints().catch(console.error);
