-- Check the structure of the timeline_events table
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

-- Check if the clock_ref column exists and remove it if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'timeline_events' 
        AND column_name = 'clock_ref'
    ) THEN
        EXECUTE 'ALTER TABLE timeline_events DROP COLUMN clock_ref';
        RAISE NOTICE 'Removed clock_ref column from timeline_events table';
    ELSE
        RAISE NOTICE 'clock_ref column does not exist in timeline_events table';
    END IF;
END $$;

-- Make sure the time_offset column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'timeline_events' 
        AND column_name = 'time_offset'
    ) THEN
        EXECUTE 'ALTER TABLE timeline_events ADD COLUMN time_offset TEXT';
        RAISE NOTICE 'Added time_offset column to timeline_events table';
    ELSE
        RAISE NOTICE 'time_offset column already exists in timeline_events table';
    END IF;
END $$;

-- Make sure the element_id column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'timeline_events' 
        AND column_name = 'element_id'
    ) THEN
        EXECUTE 'ALTER TABLE timeline_events ADD COLUMN element_id UUID REFERENCES elements(id)';
        RAISE NOTICE 'Added element_id column to timeline_events table';
    ELSE
        RAISE NOTICE 'element_id column already exists in timeline_events table';
    END IF;
END $$;

-- Check the updated structure
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

