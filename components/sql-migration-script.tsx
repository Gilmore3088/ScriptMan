export const addMissingColumnsSQL = `
-- Check if script_template column exists and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'game_elements' 
        AND column_name = 'script_template'
    ) THEN
        ALTER TABLE game_elements ADD COLUMN script_template TEXT;
    END IF;
    
    -- Check for other potentially missing columns and add them
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'game_elements' 
        AND column_name = 'supported_sports'
    ) THEN
        ALTER TABLE game_elements ADD COLUMN supported_sports TEXT[];
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'game_elements' 
        AND column_name = 'sponsor_id'
    ) THEN
        ALTER TABLE game_elements ADD COLUMN sponsor_id UUID;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'game_elements' 
        AND column_name = 'sponsor_name'
    ) THEN
        ALTER TABLE game_elements ADD COLUMN sponsor_name TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'game_elements' 
        AND column_name = 'is_permanent_marker'
    ) THEN
        ALTER TABLE game_elements ADD COLUMN is_permanent_marker BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'game_elements' 
        AND column_name = 'default_offset'
    ) THEN
        ALTER TABLE game_elements ADD COLUMN default_offset TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'game_elements' 
        AND column_name = 'lock_offset'
    ) THEN
        ALTER TABLE game_elements ADD COLUMN lock_offset BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update the sample data to include script_template if it's missing
UPDATE game_elements 
SET script_template = 'Gates are now open for today''s {sport} game!' 
WHERE name = 'Gate Open' AND script_template IS NULL;

UPDATE game_elements 
SET script_template = 'The {sport} halftime show is brought to you by Coca-Cola. Taste the feeling!' 
WHERE name = 'Coca-Cola Halftime Show' AND script_template IS NULL;

UPDATE game_elements 
SET script_template = 'Today''s {sport} player of the game is brought to you by Nike. Just Do It!' 
WHERE name = 'Nike Player of the Game' AND script_template IS NULL;
`

