-- This script will find the correct events table and add the element_id column
DO $$
DECLARE
    possible_tables TEXT[] := ARRAY['events', 'timeline_events', 'script_events', 'script_timeline_events'];
    table_exists BOOLEAN := FALSE;
    table_name TEXT;
BEGIN
    -- Check each possible table name
    FOREACH table_name IN ARRAY possible_tables
    LOOP
        EXECUTE format('
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = ''public'' 
                AND table_name = %L
            )', table_name) INTO table_exists;
        
        IF table_exists THEN
            RAISE NOTICE 'Found events table: %', table_name;
            
            -- Check if element_id column already exists
            DECLARE
                column_exists BOOLEAN;
            BEGIN
                EXECUTE format('
                    SELECT EXISTS (
                        SELECT FROM information_schema.columns 
                        WHERE table_schema = ''public'' 
                        AND table_name = %L 
                        AND column_name = ''element_id''
                    )', table_name) INTO column_exists;
                
                IF NOT column_exists THEN
                    -- Add the element_id column
                    EXECUTE format('
                        ALTER TABLE %I 
                        ADD COLUMN element_id UUID REFERENCES elements(id) ON DELETE SET NULL
                    ', table_name);
                    
                    RAISE NOTICE 'Added element_id column to % table.', table_name;
                ELSE
                    RAISE NOTICE 'element_id column already exists in % table.', table_name;
                END IF;
            END;
            
            -- Exit the loop once we've found and updated a table
            EXIT;
        END IF;
    END LOOP;
    
    -- If no matching table was found
    IF NOT table_exists THEN
        RAISE NOTICE 'Could not find any events table. Please check your database schema.';
        
        -- List all tables in the public schema
        RAISE NOTICE 'Available tables in public schema:';
        FOR table_name IN 
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        LOOP
            RAISE NOTICE '%', table_name;
        END LOOP;
    END IF;
END $$;

