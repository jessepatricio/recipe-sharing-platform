-- Fix profiles table to ensure it has the correct columns
-- This migration ensures the profiles table has the expected structure

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add username column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'username') THEN
        ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
    END IF;
    
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
    END IF;
    
    -- Ensure avatar_url exists (it should from the original migration)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Update existing records to populate username and full_name from name if they're null
UPDATE profiles 
SET 
    username = COALESCE(username, LOWER(REPLACE(name, ' ', '_')) || '_' || SUBSTRING(id::text, 1, 8)),
    full_name = COALESCE(full_name, name)
WHERE username IS NULL OR full_name IS NULL;

-- Add comments to document the fields
COMMENT ON COLUMN profiles.username IS 'Unique username for the user';
COMMENT ON COLUMN profiles.full_name IS 'Full display name for the user';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user avatar image';
