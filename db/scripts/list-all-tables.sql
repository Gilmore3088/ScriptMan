-- List all tables in the public schema with row counts
DO $$
DECLARE
    table_info RECORD;
    row_count INTEGER;
BEGIN
    RAISE NOTICE 'Listing all tables in the public schema:';
    
    FOR table_info IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        -- Get row count
        EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(table_info.table_name) INTO row_count;
        
        RAISE NOTICE '  % (% rows)', table_info.table_name, row_count;
    END LOOP;
END $$;

