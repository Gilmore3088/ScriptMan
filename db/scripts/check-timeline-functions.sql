-- Check if there are any functions related to timeline_events
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%timeline%';

-- Check the definition of any timeline-related functions
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname LIKE '%timeline%'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

