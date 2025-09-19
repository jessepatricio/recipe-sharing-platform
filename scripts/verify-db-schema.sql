-- Verify the current structure of the recipes table
-- Run this in your Supabase SQL Editor to see what fields actually exist

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'recipes' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
