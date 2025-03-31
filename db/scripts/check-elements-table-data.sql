-- Check if the elements table exists
DO $$
DECLARE
    table_exists BOOLEAN;
    element_count INTEGER;
    column_info RECORD;
BEGIN
    -- Check if the elements table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'elements'
    ) INTO table_exists;
    
    RAISE NOTICE 'Elements table exists: %', table_exists;
    
    IF table_exists THEN
        -- Count the number of elements
        EXECUTE 'SELECT COUNT(*) FROM elements' INTO element_count;
        RAISE NOTICE 'Number of elements in the table: %', element_count;
        
        -- List the columns in the elements table
        RAISE NOTICE 'Columns in the elements table:';
        FOR column_info IN
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'elements'
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  % (%)', column_info.column_name, column_info.data_type;
        END LOOP;
        
        -- Show a sample of the data if there are any elements
        IF element_count > 0 THEN
            RAISE NOTICE 'Sample data (up to 5 elements):';
            PERFORM (
                SELECT json_agg(e)
                FROM (
                    SELECT * FROM elements LIMIT 5
                ) e
            );
        END IF;
    ELSE
        -- List all tables in the public schema
        RAISE NOTICE 'Available tables in the public schema:';
        FOR column_info IN
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        LOOP
            RAISE NOTICE '  %', column_info.table_name;
        END LOOP;
    END IF;
END $$;

