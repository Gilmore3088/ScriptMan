-- Simple script to add element_id column to events table
DO $$
BEGIN
    -- Check if the column already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'events' 
        AND column_name = 'element_id'
    ) THEN
        -- Add the column
        ALTER TABLE events 
        ADD COLUMN element_id UUID REFERENCES elements(id) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added element_id column to events table.';
    ELSE
        RAISE NOTICE 'element_id column already exists in events table.';
    END IF;
END $$;

