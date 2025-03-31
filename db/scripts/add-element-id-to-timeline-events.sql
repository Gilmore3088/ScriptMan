-- Check if the element_id column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'script_timeline_events' 
        AND column_name = 'element_id'
    ) THEN
        -- Add element_id column to script_timeline_events table
        ALTER TABLE script_timeline_events 
        ADD COLUMN element_id UUID REFERENCES elements(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Update the RLS policies to allow access to the element_id column
DO $$
BEGIN
    -- Check if the policy exists before trying to alter it
    IF EXISTS (
        SELECT 1 
        FROM pg_policy 
        WHERE polname = 'Enable read access for authenticated users' 
        AND tablename = 'script_timeline_events'
    ) THEN
        ALTER POLICY "Enable read access for authenticated users" 
        ON "public"."script_timeline_events" 
        USING (auth.uid() IN (
            SELECT created_by FROM scripts WHERE id = script_id
        ));
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM pg_policy 
        WHERE polname = 'Enable insert access for authenticated users' 
        AND tablename = 'script_timeline_events'
    ) THEN
        ALTER POLICY "Enable insert access for authenticated users" 
        ON "public"."script_timeline_events" 
        USING (auth.uid() IN (
            SELECT created_by FROM scripts WHERE id = script_id
        ))
        WITH CHECK (auth.uid() IN (
            SELECT created_by FROM scripts WHERE id = script_id
        ));
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM pg_policy 
        WHERE polname = 'Enable update access for authenticated users' 
        AND tablename = 'script_timeline_events'
    ) THEN
        ALTER POLICY "Enable update access for authenticated users" 
        ON "public"."script_timeline_events" 
        USING (auth.uid() IN (
            SELECT created_by FROM scripts WHERE id = script_id
        ))
        WITH CHECK (auth.uid() IN (
            SELECT created_by FROM scripts WHERE id = script_id
        ));
    END IF;
END $$;

