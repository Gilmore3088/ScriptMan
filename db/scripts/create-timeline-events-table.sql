-- Create timeline events table if it doesn't exist
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL DEFAULT 15, -- in minutes
    period TEXT,
    location TEXT,
    audio_notes TEXT,
    clock_reference TEXT,
    notes TEXT,
    element_id UUID REFERENCES elements(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Enable read access for authenticated users' 
        AND tablename = 'events'
    ) THEN
        CREATE POLICY "Enable read access for authenticated users" 
        ON events
        FOR SELECT
        USING (auth.uid() IN (
            SELECT created_by FROM scripts WHERE id = script_id
        ));
    END IF;
END $$;

-- Create policy for insert access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Enable insert access for authenticated users' 
        AND tablename = 'events'
    ) THEN
        CREATE POLICY "Enable insert access for authenticated users" 
        ON events
        FOR INSERT
        WITH CHECK (auth.uid() IN (
            SELECT created_by FROM scripts WHERE id = script_id
        ));
    END IF;
END $$;

-- Create policy for update access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Enable update access for authenticated users' 
        AND tablename = 'events'
    ) THEN
        CREATE POLICY "Enable update access for authenticated users" 
        ON events
        FOR UPDATE
        USING (auth.uid() IN (
            SELECT created_by FROM scripts WHERE id = script_id
        ))
        WITH CHECK (auth.uid() IN (
            SELECT created_by FROM scripts WHERE id = script_id
        ));
    END IF;
END $$;

-- Create policy for delete access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polname = 'Enable delete access for authenticated users' 
        AND tablename = 'events'
    ) THEN
        CREATE POLICY "Enable delete access for authenticated users" 
        ON events
        FOR DELETE
        USING (auth.uid() IN (
            SELECT created_by FROM scripts WHERE id = script_id
        ));
    END IF;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'set_updated_at' 
        AND tgrelid = 'events'::regclass
    ) THEN
        CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON events
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
    END IF;
END $$;

