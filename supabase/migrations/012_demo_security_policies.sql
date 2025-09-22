-- Enhanced security policies for demo mode
-- This migration adds additional restrictions for public demo deployment

-- Add demo mode flag to track demo usage
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_demo_user BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS demo_created_at TIMESTAMP DEFAULT NOW();

-- Update existing profiles to be demo users if they don't have a real email domain
UPDATE profiles 
SET is_demo_user = true 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email NOT LIKE '%@gmail.com' 
  AND email NOT LIKE '%@yahoo.com' 
  AND email NOT LIKE '%@outlook.com'
  AND email NOT LIKE '%@hotmail.com'
  AND email NOT LIKE '%@icloud.com'
  AND email NOT LIKE '%@protonmail.com'
  AND email NOT LIKE '%@fastmail.com'
);

-- Add demo usage tracking
CREATE TABLE IF NOT EXISTS demo_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_demo_usage_user_action ON demo_usage(user_id, action_type, created_at);
CREATE INDEX IF NOT EXISTS idx_demo_usage_created_at ON demo_usage(created_at);

-- Enhanced RLS policies with demo restrictions

-- Recipe creation with demo limits
DROP POLICY IF EXISTS "Authenticated users can insert recipes" ON recipes;
CREATE POLICY "Authenticated users can insert recipes with demo limits" ON recipes
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    -- Demo users can only create 2 recipes per hour
    (
      NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_demo_user = true
      ) OR
      (
        SELECT COUNT(*) FROM recipes 
        WHERE user_id = auth.uid() 
        AND created_at > NOW() - INTERVAL '1 hour'
      ) < 2
    )
  );

-- Recipe updates with demo limits
DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
CREATE POLICY "Users can update their own recipes with demo limits" ON recipes
  FOR UPDATE USING (
    auth.uid() = user_id AND
    -- Demo users can only update 3 times per hour
    (
      NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_demo_user = true
      ) OR
      (
        SELECT COUNT(*) FROM demo_usage 
        WHERE user_id = auth.uid() 
        AND action_type = 'update' 
        AND resource_type = 'recipe'
        AND created_at > NOW() - INTERVAL '1 hour'
      ) < 3
    )
  );

-- Like actions with demo limits
DROP POLICY IF EXISTS "Authenticated users can like recipes" ON likes;
CREATE POLICY "Authenticated users can like recipes with demo limits" ON likes
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    -- Demo users can only like 10 recipes per hour
    (
      NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_demo_user = true
      ) OR
      (
        SELECT COUNT(*) FROM demo_usage 
        WHERE user_id = auth.uid() 
        AND action_type = 'like' 
        AND resource_type = 'recipe'
        AND created_at > NOW() - INTERVAL '1 hour'
      ) < 10
    )
  );

-- Comment actions with demo limits
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments with demo limits" ON comments
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    -- Demo users can only comment 5 times per hour
    (
      NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_demo_user = true
      ) OR
      (
        SELECT COUNT(*) FROM demo_usage 
        WHERE user_id = auth.uid() 
        AND action_type = 'comment' 
        AND resource_type = 'recipe'
        AND created_at > NOW() - INTERVAL '1 hour'
      ) < 5
    )
  );

-- Image upload with demo limits
DROP POLICY IF EXISTS "Authenticated users can insert recipe images" ON recipe_images;
CREATE POLICY "Authenticated users can insert recipe images with demo limits" ON recipe_images
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    -- Demo users can only upload 1 image per hour
    (
      NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_demo_user = true
      ) OR
      (
        SELECT COUNT(*) FROM demo_usage 
        WHERE user_id = auth.uid() 
        AND action_type = 'upload' 
        AND resource_type = 'image'
        AND created_at > NOW() - INTERVAL '1 hour'
      ) < 1
    )
  );

-- Function to track demo usage
CREATE OR REPLACE FUNCTION track_demo_usage(
  p_user_id UUID,
  p_action_type TEXT,
  p_resource_type TEXT
) RETURNS VOID AS $$
BEGIN
  -- Only track for demo users
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_user_id AND is_demo_user = true
  ) THEN
    INSERT INTO demo_usage (user_id, action_type, resource_type)
    VALUES (p_user_id, p_action_type, p_resource_type);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old demo usage data (run daily)
CREATE OR REPLACE FUNCTION cleanup_demo_usage() RETURNS VOID AS $$
BEGIN
  DELETE FROM demo_usage WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up demo usage (if using pg_cron)
-- SELECT cron.schedule('cleanup-demo-usage', '0 2 * * *', 'SELECT cleanup_demo_usage();');

-- Add comments
COMMENT ON TABLE demo_usage IS 'Tracks usage for demo users to enforce rate limits';
COMMENT ON COLUMN profiles.is_demo_user IS 'Flag to identify demo users with restricted access';
COMMENT ON COLUMN profiles.demo_created_at IS 'When the demo user was created';
COMMENT ON FUNCTION track_demo_usage IS 'Tracks usage for demo users to enforce rate limits';
COMMENT ON FUNCTION cleanup_demo_usage IS 'Cleans up old demo usage data to prevent table bloat';
