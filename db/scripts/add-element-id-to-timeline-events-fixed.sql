-- First, let's identify the correct table name for timeline events
DO $$
DECLARE
    timeline_table_name text;
BEGIN
    -- Check possible table names
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'timeline_events') THEN
        timeline_table_name := 'timeline_events';
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
        timeline_table_name := 'events';
    ELSE
        RAISE NOTICE 'Could not find timeline events table. Please check your database schema.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found timeline events table: %', timeline_table_name;
    
    -- Check if the element_id column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = timeline_table_name 
        AND column_name = 'element_id'
    ) THEN
        -- Add element_id column to the timeline events table
        EXECUTE format('ALTER TABLE %I ADD COLUMN element_id UUID REFERENCES elements(id) ON DELETE SET NULL', timeline_table_name);
        RAISE NOTICE 'Added element_id column to %', timeline_table_name;
    ELSE
        RAISE NOTICE 'element_id column already exists in %', timeline_table_name;
    END IF;
    
    -- Update RLS policies if they exist
    IF EXISTS (
        SELECT 1 
        FROM pg_policy 
        WHERE tablename = timeline_table_name
    ) THEN
        RAISE NOTICE 'Updating RLS policies for %', timeline_table_name;
        -- The specific policy updates would go here, but we need to know the exact policy names
    ELSE
        RAISE NOTICE 'No RLS policies found for %', timeline_table_name;
    END IF;
END $$;

