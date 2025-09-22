-- Fix triggers to work properly with RLS policies
-- This migration ensures triggers have proper permissions

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_like_count_trigger ON likes;
DROP TRIGGER IF EXISTS update_comment_count_trigger ON comments;

-- Recreate the trigger functions with SECURITY DEFINER
-- This allows the functions to bypass RLS when updating recipe counts
CREATE OR REPLACE FUNCTION update_recipe_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recipes 
    SET like_count = like_count + 1 
    WHERE id = NEW.recipe_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipes 
    SET like_count = GREATEST(like_count - 1, 0) 
    WHERE id = OLD.recipe_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_recipe_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recipes 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.recipe_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipes 
    SET comment_count = GREATEST(comment_count - 1, 0) 
    WHERE id = OLD.recipe_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers
CREATE TRIGGER update_like_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_recipe_like_count();

CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_recipe_comment_count();

-- Add comments to document the fix
COMMENT ON FUNCTION update_recipe_like_count() IS 'Trigger function to update recipe like counts, uses SECURITY DEFINER to bypass RLS';
COMMENT ON FUNCTION update_recipe_comment_count() IS 'Trigger function to update recipe comment counts, uses SECURITY DEFINER to bypass RLS';
