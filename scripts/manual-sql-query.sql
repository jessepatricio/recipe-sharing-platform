-- Manual SQL query to fix like and comment counts
-- Run this in the Supabase SQL Editor

-- Fix Bicol Express: should have 1 like, 1 comment
UPDATE recipes 
SET like_count = 1, comment_count = 1 
WHERE title LIKE '%Bicol Express%';

-- Fix Cebu Chorizo: should have 1 like, 1 comment  
UPDATE recipes 
SET like_count = 1, comment_count = 1 
WHERE title LIKE '%Cebu Chorizo%';

-- Verify the updates
SELECT id, title, like_count, comment_count 
FROM recipes 
ORDER BY created_at DESC;
