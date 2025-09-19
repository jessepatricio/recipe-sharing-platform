-- Run this in your Supabase SQL Editor to verify the exact structure of your recipes table

-- Check if the recipes table exists and get its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'recipes' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if specific enhanced fields exist
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recipes' 
        AND column_name = 'prep_time'
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as prep_time_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recipes' 
        AND column_name = 'ingredients'
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as ingredients_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recipes' 
        AND column_name = 'instructions'
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as instructions_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'recipes' 
        AND column_name = 'is_public'
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as is_public_status;
