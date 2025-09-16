-- Add bio field to profiles table
ALTER TABLE profiles 
ADD COLUMN bio TEXT;

-- Add a comment to document the field
COMMENT ON COLUMN profiles.bio IS 'User bio/description, nullable text field';

