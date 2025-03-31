-- This script will check the structure of the timeline_events table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'timeline_events'
ORDER BY 
    ordinal_position;

-- Also check if there's a location column in any other table that might be related
SELECT 
    table_name, 
    column_name, 
    data_type
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND column_name = 'location'
ORDER BY 
    table_name;

