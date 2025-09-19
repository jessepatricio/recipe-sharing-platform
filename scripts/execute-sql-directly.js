const { createClient } = require('@supabase/supabase-js');

async function executeSQLDirectly() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    console.log('Please make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY set');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Executing SQL to remove constraint directly...\n');

  const sqlCommands = [
    'ALTER TABLE recipes ALTER COLUMN difficulty DROP NOT NULL;',
    'ALTER TABLE recipes ALTER COLUMN difficulty DROP DEFAULT;',
    'ALTER TABLE recipes ALTER COLUMN difficulty TYPE TEXT;'
  ];

  for (let i = 0; i < sqlCommands.length; i++) {
    const sql = sqlCommands[i];
    console.log(`${i + 1}. Executing: ${sql}`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        // Try alternative approach
        console.log('Trying alternative execution...');
        const { error: altError } = await supabase
          .from('recipes')
          .select('*')
          .limit(1);
        
        if (altError) {
          console.log(`❌ Alternative also failed: ${altError.message}`);
        } else {
          console.log('✅ Connection works, trying direct SQL execution...');
          // Try using the raw SQL endpoint if available
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey
            },
            body: JSON.stringify({ sql })
          });
          
          if (response.ok) {
            console.log('✅ SQL executed successfully via REST API');
          } else {
            const errorText = await response.text();
            console.log(`❌ REST API error: ${errorText}`);
          }
        }
      } else {
        console.log('✅ Success');
      }
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`);
    }
    console.log('---');
  }

  // Test the result
  console.log('\nTesting recipe creation after constraint removal...');
  
  const testData = {
    title: 'Test Recipe After Constraint Removal',
    description: 'Testing after constraint removal',
    cooking_time: 30,
    difficulty: 'Easy',
    category: 'Test',
    user_id: '00000000-0000-0000-0000-000000000000',
    ingredients: ['test ingredient'],
    instructions: ['test instruction']
  };

  try {
    const { data, error } = await supabase
      .from('recipes')
      .insert([testData])
      .select();

    if (error) {
      console.log('❌ Recipe insertion failed:', error);
    } else {
      console.log('✅ Recipe insertion successful:', data[0].id);
      // Clean up
      await supabase.from('recipes').delete().eq('id', data[0].id);
      console.log('✅ Test record cleaned up');
    }
  } catch (err) {
    console.log('❌ Exception during test:', err.message);
  }
}

executeSQLDirectly().catch(console.error);
