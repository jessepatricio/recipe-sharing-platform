-- Replace tags field with category field
-- First, add the new category column
ALTER TABLE recipes ADD COLUMN category TEXT;

-- Update existing records to have a default category
UPDATE recipes SET category = 'General' WHERE category IS NULL;

-- Make category NOT NULL with a default value
ALTER TABLE recipes ALTER COLUMN category SET NOT NULL;
ALTER TABLE recipes ALTER COLUMN category SET DEFAULT 'General';

-- Drop the old tags column
ALTER TABLE recipes DROP COLUMN tags;

-- Create an index for better performance on category searches
CREATE INDEX IF NOT EXISTS recipes_category_idx ON recipes(category);
