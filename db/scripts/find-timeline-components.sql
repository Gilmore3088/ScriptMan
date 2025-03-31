-- This script will help us understand the timeline_events table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'timeline_events'
ORDER BY ordinal_position;

-- Check for any other relevant tables that might contain "item" in their name
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name LIKE '%item%'
ORDER BY table_name;

