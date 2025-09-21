-- Fix unlike count issue
-- Run this in the Supabase SQL Editor

-- Fix Bicol Express: should have 0 likes, 1 comment
UPDATE recipes 
SET like_count = 0 
WHERE title LIKE '%Bicol Express%';

-- Verify the fix
SELECT id, title, like_count, comment_count 
FROM recipes 
ORDER BY created_at DESC;

-- Check actual likes vs database counts
SELECT 
  r.title,
  r.like_count as db_like_count,
  r.comment_count as db_comment_count,
  COUNT(l.id) as actual_likes,
  COUNT(c.id) as actual_comments
FROM recipes r
LEFT JOIN likes l ON r.id = l.recipe_id
LEFT JOIN comments c ON r.id = c.recipe_id
GROUP BY r.id, r.title, r.like_count, r.comment_count
ORDER BY r.created_at DESC;
