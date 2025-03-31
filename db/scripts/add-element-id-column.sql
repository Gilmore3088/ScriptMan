-- This script adds an element_id column to the events table if it doesn't exist
DO $$
BEGIN
    -- Check if the events table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
        -- Check if the element_id column already exists
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'events' 
            AND column_name = 'element_id'
        ) THEN
            -- Add element_id column to the events table
            ALTER TABLE events ADD COLUMN element_id UUID REFERENCES elements(id) ON DELETE SET NULL;
            RAISE NOTICE 'Added element_id column to events table';
        ELSE
            RAISE NOTICE 'element_id column already exists in events table';
        END IF;
    ELSE
        RAISE NOTICE 'events table does not exist';
    END IF;
    
    -- Check if the timeline_events table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'timeline_events') THEN
        -- Check if the element_id column already exists
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'timeline_events' 
            AND column_name = 'element_id'
        ) THEN
            -- Add element_id column to the timeline_events table
            ALTER TABLE timeline_events ADD COLUMN element_id UUID REFERENCES elements(id) ON DELETE SET NULL;
            RAISE NOTICE 'Added element_id column to timeline_events table';
        ELSE
            RAISE NOTICE 'element_id column already exists in timeline_events table';
        END IF;
    ELSE
        RAISE NOTICE 'timeline_events table does not exist';
    END IF;
END $$;

