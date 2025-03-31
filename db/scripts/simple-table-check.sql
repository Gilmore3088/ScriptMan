-- Simple check for tables and elements
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check if elements table exists and has data
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'elements'
    ) THEN
        RAISE NOTICE 'Elements table exists';
        
        -- Check row count
        DECLARE
            element_count INTEGER;
        BEGIN
            EXECUTE 'SELECT COUNT(*) FROM elements' INTO element_count;
            RAISE NOTICE 'Number of elements: %', element_count;
            
            IF element_count > 0 THEN
                RAISE NOTICE 'Elements table has data';
            ELSE
                RAISE NOTICE 'Elements table is empty';
            END IF;
        END;
    ELSE
        RAISE NOTICE 'Elements table does not exist';
    END IF;
END $$;

