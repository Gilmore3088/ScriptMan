-- Create elements table if it doesn't exist
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
            description TEXT,
            type TEXT,
            period TEXT,
            sponsor_id UUID,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Add sample data
        INSERT INTO elements (name, description, type, period) VALUES
        ('Team Introduction', 'Introduction of the home team', 'Announcement', 'Pregame'),
        ('National Anthem', 'Performance of the national anthem', 'Performance', 'Pregame'),
        ('First Quarter Highlights', 'Video highlights from the first quarter', 'Video', 'Q1'),
        ('Halftime Show', 'Main halftime entertainment', 'Performance', 'Halftime'),
        ('Fan Contest', 'Interactive contest with fans', 'Interactive', 'Q3');
        
        RAISE NOTICE 'Elements table created with sample data.';
    ELSE
        RAISE NOTICE 'Elements table already exists.';
    END IF;
    
    -- Check if the sponsors table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sponsors'
    ) THEN
        RAISE NOTICE 'Creating sponsors table...';
        
        -- Create the sponsors table
        CREATE TABLE sponsors (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            logo_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Add sample data
        INSERT INTO sponsors (name, description) VALUES
        ('Local Bank', 'Community bank sponsor'),
        ('Sports Drink Co', 'Official sports drink'),
        ('Auto Dealer', 'Local car dealership');
        
        RAISE NOTICE 'Sponsors table created with sample data.';
    ELSE
        RAISE NOTICE 'Sponsors table already exists.';
    END IF;
    
    -- Add foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'elements'
        AND constraint_name = 'elements_sponsor_id_fkey'
    ) THEN
        RAISE NOTICE 'Adding foreign key constraint...';
        
        -- Add the foreign key
        ALTER TABLE elements
        ADD CONSTRAINT elements_sponsor_id_fkey
        FOREIGN KEY (sponsor_id)
        REFERENCES sponsors(id)
        ON DELETE SET NULL;
        
        -- Update some elements to have sponsors
        UPDATE elements
        SET sponsor_id = (SELECT id FROM sponsors WHERE name = 'Local Bank')
        WHERE name = 'Team Introduction';
        
        UPDATE elements
        SET sponsor_id = (SELECT id FROM sponsors WHERE name = 'Sports Drink Co')
        WHERE name = 'Halftime Show';
        
        RAISE NOTICE 'Foreign key constraint added and sample relationships created.';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists.';
    END IF;
END $$;

