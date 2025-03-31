-- Check if the elements table exists
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'elements'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'The elements table exists.';
        
        -- Check if the elements table has the required columns
        PERFORM column_name 
        FROM information_schema.columns 
        WHERE table_name = 'elements' 
        AND column_name = 'id';
        
        IF FOUND THEN
            RAISE NOTICE 'The elements table has an id column.';
        ELSE
            RAISE NOTICE 'The elements table is missing the id column.';
        END IF;
        
        -- Check for name column
        PERFORM column_name 
        FROM information_schema.columns 
        WHERE table_name = 'elements' 
        AND column_name = 'name';
        
        IF FOUND THEN
            RAISE NOTICE 'The elements table has a name column.';
        ELSE
            RAISE NOTICE 'The elements table is missing the name column.';
        END IF;
        
        -- Check for type column
        PERFORM column_name 
        FROM information_schema.columns 
        WHERE table_name = 'elements' 
        AND column_name = 'type';
        
        IF FOUND THEN
            RAISE NOTICE 'The elements table has a type column.';
        ELSE
            RAISE NOTICE 'The elements table is missing the type column.';
        END IF;
        
        -- Check for period column
        PERFORM column_name 
        FROM information_schema.columns 
        WHERE table_name = 'elements' 
        AND column_name = 'period';
        
        IF FOUND THEN
            RAISE NOTICE 'The elements table has a period column.';
        ELSE
            RAISE NOTICE 'The elements table is missing the period column.';
        END IF;
        
        -- Check for sponsor_id column
        PERFORM column_name 
        FROM information_schema.columns 
        WHERE table_name = 'elements' 
        AND column_name = 'sponsor_id';
        
        IF FOUND THEN
            RAISE NOTICE 'The elements table has a sponsor_id column.';
        ELSE
            RAISE NOTICE 'The elements table is missing the sponsor_id column.';
        END IF;
        
        -- Count the number of elements
        DECLARE
            element_count INTEGER;
        BEGIN
            SELECT COUNT(*) INTO element_count FROM elements;
            RAISE NOTICE 'The elements table contains % elements.', element_count;
        END;
    ELSE
        RAISE NOTICE 'The elements table does not exist.';
    END IF;
END $$;

-- Check if the events table exists and has element_id column
DO $$
DECLARE
    table_exists BOOLEAN;
    column_exists BOOLEAN;
BEGIN
    -- Check for events table
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'events'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'The events table exists.';
        
        -- Check for element_id column
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'events' 
            AND column_name = 'element_id'
        ) INTO column_exists;
        
        IF column_exists THEN
            RAISE NOTICE 'The events table has an element_id column.';
        ELSE
            RAISE NOTICE 'The events table is missing the element_id column.';
            
            -- Add the element_id column if it doesn't exist
            ALTER TABLE events 
            ADD COLUMN element_id UUID REFERENCES elements(id) ON DELETE SET NULL;
            
            RAISE NOTICE 'Added element_id column to events table.';
        END IF;
    ELSE
        RAISE NOTICE 'The events table does not exist.';
    END IF;
END $$;

