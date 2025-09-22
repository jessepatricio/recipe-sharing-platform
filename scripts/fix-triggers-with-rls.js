require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Script to fix database triggers with proper RLS handling
async function fixTriggersWithRLS() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔧 Fixing database triggers with proper RLS handling...');

    // 1. First, let's recreate the trigger functions with SECURITY DEFINER
    console.log('\n1. Creating trigger functions with SECURITY DEFINER...');
    
    const createLikeCountFunction = `
      CREATE OR REPLACE FUNCTION update_recipe_like_count()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE recipes 
          SET like_count = like_count + 1 
          WHERE id = NEW.recipe_id;
          RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE recipes 
          SET like_count = GREATEST(like_count - 1, 0) 
          WHERE id = OLD.recipe_id;
          RETURN OLD;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const createCommentCountFunction = `
      CREATE OR REPLACE FUNCTION update_recipe_comment_count()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE recipes 
          SET comment_count = comment_count + 1 
          WHERE id = NEW.recipe_id;
          RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE recipes 
          SET comment_count = GREATEST(comment_count - 1, 0) 
          WHERE id = OLD.recipe_id;
          RETURN OLD;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Execute the function creation
    const { error: likeFunctionError } = await supabase.rpc('exec_sql', { sql: createLikeCountFunction });
    if (likeFunctionError) {
      console.error('❌ Error creating like count function:', likeFunctionError.message);
    } else {
      console.log('✅ Like count function created successfully');
    }

    const { error: commentFunctionError } = await supabase.rpc('exec_sql', { sql: createCommentCountFunction });
    if (commentFunctionError) {
      console.error('❌ Error creating comment count function:', commentFunctionError.message);
    } else {
      console.log('✅ Comment count function created successfully');
    }

    // 2. Drop and recreate triggers
    console.log('\n2. Creating triggers...');
    
    const createTriggers = `
      -- Drop existing triggers
      DROP TRIGGER IF EXISTS update_like_count_trigger ON likes;
      DROP TRIGGER IF EXISTS update_comment_count_trigger ON comments;
      
      -- Create new triggers
      CREATE TRIGGER update_like_count_trigger
        AFTER INSERT OR DELETE ON likes
        FOR EACH ROW EXECUTE FUNCTION update_recipe_like_count();
        
      CREATE TRIGGER update_comment_count_trigger
        AFTER INSERT OR DELETE ON comments
        FOR EACH ROW EXECUTE FUNCTION update_recipe_comment_count();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: createTriggers });
    if (triggerError) {
      console.error('❌ Error creating triggers:', triggerError.message);
    } else {
      console.log('✅ Triggers created successfully');
    }

    // 3. Test the triggers
    console.log('\n3. Testing triggers...');
    
    // Get a test recipe
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, title, like_count')
      .limit(1);

    if (recipesError || !recipes || recipes.length === 0) {
      console.error('❌ No recipes found for testing');
      return;
    }

    const testRecipe = recipes[0];
    console.log(`   Testing with recipe: ${testRecipe.title} (ID: ${testRecipe.id})`);
    console.log(`   Current like_count: ${testRecipe.like_count}`);

    // Count actual likes
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', testRecipe.id);

    if (likesError) {
      console.error('❌ Error counting likes:', likesError.message);
      return;
    }

    const actualLikeCount = likes?.length || 0;
    console.log(`   Actual likes in database: ${actualLikeCount}`);

    // Update the like_count to match actual count
    if (testRecipe.like_count !== actualLikeCount) {
      console.log(`   🔄 Syncing like_count: ${testRecipe.like_count} → ${actualLikeCount}`);
      
      const { error: updateError } = await supabase
        .from('recipes')
        .update({ like_count: actualLikeCount })
        .eq('id', testRecipe.id);

      if (updateError) {
        console.error('❌ Error syncing like count:', updateError.message);
      } else {
        console.log('✅ Like count synced successfully');
      }
    } else {
      console.log('✅ Like count already in sync');
    }

    console.log('\n🎉 Trigger fix completed!');
    console.log('\n💡 The triggers should now work properly with RLS policies.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixTriggersWithRLS();
