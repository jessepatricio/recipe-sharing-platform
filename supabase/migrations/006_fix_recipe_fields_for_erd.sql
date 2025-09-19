-- Fix recipe fields to match ERD exactly
-- Change cooking_time from TEXT to INTEGER to match ERD specification

-- First, add a new column with the correct type
ALTER TABLE recipes ADD COLUMN cooking_time_minutes INTEGER;

-- Update existing records to convert cooking_time from text to integer
-- This assumes cooking_time is in format like "15 mins", "30 minutes", etc.
UPDATE recipes SET cooking_time_minutes = 
  CASE 
    WHEN cooking_time ~ '^\d+' THEN 
      CAST(REGEXP_REPLACE(cooking_time, '[^0-9]', '', 'g') AS INTEGER)
    ELSE 0
  END
WHERE cooking_time IS NOT NULL;

-- Drop the old cooking_time column
ALTER TABLE recipes DROP COLUMN cooking_time;

-- Rename the new column to cooking_time
ALTER TABLE recipes RENAME COLUMN cooking_time_minutes TO cooking_time;

-- Set a default value and make it NOT NULL
ALTER TABLE recipes ALTER COLUMN cooking_time SET DEFAULT 0;
ALTER TABLE recipes ALTER COLUMN cooking_time SET NOT NULL;

-- Add a comment to document the field
COMMENT ON COLUMN recipes.cooking_time IS 'Cooking time in minutes (integer)';

-- Ensure ingredients and instructions are TEXT[] arrays (not JSONB)
-- Drop JSONB columns if they exist and keep only TEXT[] arrays
ALTER TABLE recipes DROP COLUMN IF EXISTS ingredients_jsonb;
ALTER TABLE recipes DROP COLUMN IF EXISTS instructions_jsonb;

-- Rename the existing TEXT[] columns to match ERD exactly
-- (They should already be correct from migration 004)

-- Add comments to document the array fields
COMMENT ON COLUMN recipes.ingredients IS 'Array of ingredient strings (_text)';
COMMENT ON COLUMN recipes.instructions IS 'Array of instruction strings (_text)';

-- Create index for cooking_time for better performance
CREATE INDEX IF NOT EXISTS recipes_cooking_time_idx ON recipes(cooking_time);
