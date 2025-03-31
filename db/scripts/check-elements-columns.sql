-- Check for specific columns in the elements table
DO $$
DECLARE
    table_exists BOOLEAN;
    column_exists BOOLEAN;
    required_columns TEXT[] := ARRAY['id', 'name', 'type', 'period', 'sponsor_id'];
    current_column TEXT;
BEGIN
    -- Check if the elements table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'elements'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE 'Elements table exists. Checking for required columns:';
        
        -- Check each required column
        FOREACH current_column IN ARRAY required_columns
        LOOP
            SELECT EXISTS (
                SELECT FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'elements'
                AND column_name = current_column
            ) INTO column_exists;
            
            RAISE NOTICE '  Column % exists: %', current_column, column_exists;
        END LOOP;
    ELSE
        RAISE NOTICE 'Elements table does not exist.';
    END IF;
END $$;

