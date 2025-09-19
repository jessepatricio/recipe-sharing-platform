-- Add ingredients and instructions as text arrays to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS ingredients TEXT[] DEFAULT '{}';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS instructions TEXT[] DEFAULT '{}';

-- Add comments to document the fields
COMMENT ON COLUMN recipes.ingredients IS 'Array of ingredient strings for the recipe';
COMMENT ON COLUMN recipes.instructions IS 'Array of instruction strings for the recipe';

-- Update existing recipes to have empty arrays if they don't have any
UPDATE recipes SET 
  ingredients = '{}'::text[] 
WHERE ingredients IS NULL;

UPDATE recipes SET 
  instructions = '{}'::text[] 
WHERE instructions IS NULL;
