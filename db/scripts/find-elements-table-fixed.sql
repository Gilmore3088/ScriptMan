-- Look for tables that might contain elements
DO $$
DECLARE
    table_info RECORD;
    column_info RECORD;
    possible_tables TEXT[] := ARRAY['elements', 'script_elements', 'game_elements', 'event_elements'];
    table_exists BOOLEAN;
    current_table TEXT;  -- Renamed variable to avoid ambiguity
    row_count INTEGER;
BEGIN
    RAISE NOTICE 'Searching for possible element tables...';
    
    -- Check each possible table name
    FOREACH current_table IN ARRAY possible_tables
    LOOP
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = current_table  -- Use the renamed variable
        ) INTO table_exists;
        
        IF table_exists THEN
            RAISE NOTICE 'Found table: %', current_table;
            
            -- Count rows
            EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(current_table) INTO row_count;
            RAISE NOTICE '  Row count: %', row_count;
            
            -- List columns
            RAISE NOTICE '  Columns:';
            FOR column_info IN
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = current_table  -- Use the renamed variable
                ORDER BY ordinal_position
            LOOP
                RAISE NOTICE '    % (%)', column_info.column_name, column_info.data_type;
            END LOOP;
        END IF;
    END LOOP;
    
    -- Look for tables with 'element' in the name
    RAISE NOTICE 'Looking for tables with ''element'' in the name:';
    FOR table_info IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name LIKE '%element%'
        ORDER BY table_name
    LOOP
        RAISE NOTICE '  %', table_info.table_name;
        
        -- Count rows
        EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(table_info.table_name) INTO row_count;
        RAISE NOTICE '    Row count: %', row_count;
    END LOOP;
END $$;

