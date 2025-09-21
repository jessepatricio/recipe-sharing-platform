const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test script to verify social features database setup
async function testSocialFeatures() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('recipes')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }

    console.log('✅ Database connection successful');

    // Check if likes table exists
    console.log('🔍 Checking if likes table exists...');
    const { data: likesData, error: likesError } = await supabase
      .from('likes')
      .select('id')
      .limit(1);

    if (likesError) {
      console.error('❌ Likes table not found:', likesError.message);
      console.log('💡 You need to run the migration: supabase/migrations/007_add_likes_comments_tables.sql');
      return;
    }

    console.log('✅ Likes table exists');

    // Check if comments table exists
    console.log('🔍 Checking if comments table exists...');
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('id')
      .limit(1);

    if (commentsError) {
      console.error('❌ Comments table not found:', commentsError.message);
      console.log('💡 You need to run the migration: supabase/migrations/007_add_likes_comments_tables.sql');
      return;
    }

    console.log('✅ Comments table exists');

    // Check if recipes table has like_count and comment_count columns
    console.log('🔍 Checking if recipes table has social columns...');
    const { data: recipesData, error: recipesError } = await supabase
      .from('recipes')
      .select('like_count, comment_count')
      .limit(1);

    if (recipesError) {
      console.error('❌ Recipes table missing social columns:', recipesError.message);
      console.log('💡 You need to run the migration: supabase/migrations/007_add_likes_comments_tables.sql');
      return;
    }

    console.log('✅ Recipes table has social columns');

    console.log('🎉 All social features are properly set up!');
    console.log('You can now test the like and comment functionality.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testSocialFeatures();
