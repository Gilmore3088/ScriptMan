-- Check the structure of the timeline_events table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'timeline_events'
ORDER BY ordinal_position;

-- Add a function to safely update the timeline_events table if needed
DO $$
BEGIN
    -- Check if the table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'timeline_events'
    ) THEN
        -- Check if clock_ref column exists
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'timeline_events' 
            AND column_name = 'clock_ref'
        ) THEN
            -- If it exists but is causing issues, we can rename it to something else
            RAISE NOTICE 'Renaming clock_ref column to clock_reference...';
            ALTER TABLE timeline_events RENAME COLUMN clock_ref TO clock_reference;
        END IF;
        
        -- Ensure all required columns exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'timeline_events' 
            AND column_name = 'time_offset'
        ) THEN
            RAISE NOTICE 'Adding time_offset column...';
            ALTER TABLE timeline_events ADD COLUMN time_offset TEXT;
        END IF;
        
        RAISE NOTICE 'Timeline_events table structure updated.';
    ELSE
        RAISE NOTICE 'Timeline_events table does not exist.';
    END IF;
END $$;

