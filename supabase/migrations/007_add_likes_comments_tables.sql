-- Migration: Add likes and comments social features
-- File: 007_add_likes_comments_tables.sql

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only like a recipe once
  UNIQUE(user_id, recipe_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 2000),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments/replies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure content is not empty and has reasonable length limit
  CONSTRAINT valid_content CHECK (LENGTH(TRIM(content)) > 0)
);

-- Add like_count and comment_count columns to recipes table
ALTER TABLE recipes 
ADD COLUMN like_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN comment_count INTEGER DEFAULT 0 NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON likes(user_id);
CREATE INDEX IF NOT EXISTS likes_recipe_id_idx ON likes(recipe_id);
CREATE INDEX IF NOT EXISTS likes_created_at_idx ON likes(created_at DESC);

CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_recipe_id_idx ON comments(recipe_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments(parent_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS likes_user_recipe_idx ON likes(user_id, recipe_id);
CREATE INDEX IF NOT EXISTS comments_recipe_parent_idx ON comments(recipe_id, parent_id);

-- Enable Row Level Security (RLS)
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for likes table
CREATE POLICY "Anyone can view likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like recipes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for comments table
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update like count
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
$$ LANGUAGE plpgsql;

-- Create function to update comment count
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
$$ LANGUAGE plpgsql;

-- Create triggers for like count updates
DROP TRIGGER IF EXISTS update_like_count_trigger ON likes;
CREATE TRIGGER update_like_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_recipe_like_count();

-- Create triggers for comment count updates
DROP TRIGGER IF EXISTS update_comment_count_trigger ON comments;
CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_recipe_comment_count();

-- Create function to check if user has liked a recipe
CREATE OR REPLACE FUNCTION user_has_liked_recipe(recipe_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM likes 
    WHERE recipe_id = recipe_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get recipe with like status for a user
CREATE OR REPLACE FUNCTION get_recipe_with_like_status(recipe_uuid UUID, user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  cooking_time INTEGER,
  difficulty TEXT,
  servings INTEGER,
  category TEXT,
  ingredients TEXT[],
  instructions TEXT[],
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  like_count INTEGER,
  comment_count INTEGER,
  is_liked BOOLEAN,
  author_name TEXT,
  author_username TEXT,
  author_avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.cooking_time,
    r.difficulty,
    r.servings,
    r.category,
    r.ingredients,
    r.instructions,
    r.user_id,
    r.created_at,
    r.updated_at,
    r.like_count,
    r.comment_count,
    CASE 
      WHEN user_uuid IS NULL THEN FALSE
      ELSE user_has_liked_recipe(recipe_uuid, user_uuid)
    END as is_liked,
    p.full_name as author_name,
    p.username as author_username,
    p.avatar_url as author_avatar_url
  FROM recipes r
  LEFT JOIN profiles p ON r.user_id = p.id
  WHERE r.id = recipe_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments to document the new fields
COMMENT ON TABLE likes IS 'User likes for recipes - one like per user per recipe';
COMMENT ON TABLE comments IS 'User comments on recipes with support for nested replies';
COMMENT ON COLUMN recipes.like_count IS 'Cached count of total likes for this recipe';
COMMENT ON COLUMN recipes.comment_count IS 'Cached count of total comments for this recipe';
COMMENT ON COLUMN comments.content IS 'Comment text content, 1-2000 characters';
COMMENT ON COLUMN comments.parent_id IS 'Parent comment ID for nested replies, NULL for top-level comments';
