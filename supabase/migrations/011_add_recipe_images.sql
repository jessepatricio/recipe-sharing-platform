-- Add recipe image support
-- This migration adds image handling capabilities to recipes

-- Option 1: Simple approach - add image fields to recipes table
-- Uncomment the following lines if you want the simple approach:

-- ALTER TABLE recipes ADD COLUMN image_url TEXT;
-- ALTER TABLE recipes ADD COLUMN image_alt_text TEXT;
-- ALTER TABLE recipes ADD COLUMN image_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Option 2: Advanced approach - create separate images table
-- This allows for multiple images per recipe and better organization

-- Create recipe_images table
CREATE TABLE IF NOT EXISTS recipe_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  file_size INTEGER, -- in bytes
  mime_type TEXT, -- e.g., 'image/jpeg', 'image/png', 'image/webp'
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one primary image per recipe
  CONSTRAINT unique_primary_image UNIQUE (recipe_id, is_primary) DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS recipe_images_recipe_id_idx ON recipe_images(recipe_id);
CREATE INDEX IF NOT EXISTS recipe_images_primary_idx ON recipe_images(recipe_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS recipe_images_sort_order_idx ON recipe_images(recipe_id, sort_order);

-- Enable Row Level Security (RLS)
ALTER TABLE recipe_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recipe_images
CREATE POLICY "Recipe images are viewable by everyone" ON recipe_images
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert recipe images" ON recipe_images
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM recipes WHERE id = recipe_id
    )
  );

CREATE POLICY "Users can update their own recipe images" ON recipe_images
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM recipes WHERE id = recipe_id
    )
  );

CREATE POLICY "Users can delete their own recipe images" ON recipe_images
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM recipes WHERE id = recipe_id
    )
  );

-- Create function to ensure only one primary image per recipe
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting this image as primary, unset all other primary images for this recipe
  IF NEW.is_primary = true THEN
    UPDATE recipe_images 
    SET is_primary = false 
    WHERE recipe_id = NEW.recipe_id 
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one primary image per recipe
DROP TRIGGER IF EXISTS ensure_single_primary_image_trigger ON recipe_images;
CREATE TRIGGER ensure_single_primary_image_trigger
  BEFORE INSERT OR UPDATE ON recipe_images
  FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_image();

-- Add comments to document the new fields
COMMENT ON TABLE recipe_images IS 'Images associated with recipes - supports multiple images per recipe';
COMMENT ON COLUMN recipe_images.image_url IS 'URL of the uploaded image (e.g., Supabase Storage URL)';
COMMENT ON COLUMN recipe_images.alt_text IS 'Alternative text for accessibility';
COMMENT ON COLUMN recipe_images.caption IS 'Optional caption for the image';
COMMENT ON COLUMN recipe_images.is_primary IS 'Whether this is the main/primary image for the recipe';
COMMENT ON COLUMN recipe_images.sort_order IS 'Order of images when displaying multiple images';
COMMENT ON COLUMN recipe_images.file_size IS 'Size of the image file in bytes';
COMMENT ON COLUMN recipe_images.mime_type IS 'MIME type of the image (e.g., image/jpeg)';
COMMENT ON COLUMN recipe_images.width IS 'Width of the image in pixels';
COMMENT ON COLUMN recipe_images.height IS 'Height of the image in pixels';
