-- Add instructions field to recipes table
-- Run this in your Supabase SQL Editor

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Add a comment to document the field
COMMENT ON COLUMN recipes.instructions IS 'Step-by-step cooking instructions for the recipe';

-- Update existing recipes to have empty instructions if they don't have any
UPDATE recipes SET instructions = '' WHERE instructions IS NULL;
