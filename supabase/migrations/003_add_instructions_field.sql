-- Add instructions field to recipes table if it doesn't exist
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Add a comment to document the field
COMMENT ON COLUMN recipes.instructions IS 'Step-by-step cooking instructions for the recipe';
