-- Check the structure of the timeline_events table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'timeline_events'
ORDER BY ordinal_position;

-- Sample data from timeline_events table (first 5 rows)
SELECT * FROM timeline_events LIMIT 5;

