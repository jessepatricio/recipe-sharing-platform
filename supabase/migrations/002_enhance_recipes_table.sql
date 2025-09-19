-- Enhance recipes table with additional fields
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS prep_time TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS total_time TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS instructions JSONB DEFAULT '[]';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cuisine_type TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS meal_type TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS nutrition JSONB;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS recipes_tags_gin_idx ON recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS recipes_cuisine_type_idx ON recipes(cuisine_type);
CREATE INDEX IF NOT EXISTS recipes_meal_type_idx ON recipes(meal_type);
CREATE INDEX IF NOT EXISTS recipes_is_public_idx ON recipes(is_public);
CREATE INDEX IF NOT EXISTS recipes_ingredients_gin_idx ON recipes USING GIN(ingredients);
CREATE INDEX IF NOT EXISTS recipes_instructions_gin_idx ON recipes USING GIN(instructions);

-- Update existing recipes to have default values
UPDATE recipes SET 
  ingredients = '[]'::jsonb,
  instructions = '[]'::jsonb,
  is_public = true
WHERE ingredients IS NULL OR instructions IS NULL OR is_public IS NULL;
