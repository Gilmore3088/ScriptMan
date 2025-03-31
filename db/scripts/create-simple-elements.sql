-- Create a simple elements table with sample data
DO $$
BEGIN
    -- Check if the elements table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'elements'
    ) THEN
        RAISE NOTICE 'Creating elements table...';
        
        -- Create the elements table
        CREATE TABLE elements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            period TEXT NOT NULL,
            description TEXT,
            sponsor_id UUID,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Add sample data
        INSERT INTO elements (name, type, period, description) VALUES
        ('Team Introduction', 'Announcement', 'Pregame', 'Introduction of the home team'),
        ('National Anthem', 'Performance', 'Pregame', 'Performance of the national anthem'),
        ('First Quarter Highlights', 'Video', 'Q1', 'Video highlights from the first quarter'),
        ('Halftime Show', 'Performance', 'Halftime', 'Main halftime entertainment'),
        ('Fan Contest', 'Interactive', 'Q3', 'Interactive contest with fans');
        
        RAISE NOTICE 'Elements table created with sample data.';
    ELSE
        RAISE NOTICE 'Elements table already exists.';
    END IF;
END $$;

