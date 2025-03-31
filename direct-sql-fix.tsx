export const directSQLFix = `
-- Add missing columns to game_elements table
ALTER TABLE game_elements ADD COLUMN IF NOT EXISTS script_template TEXT;
ALTER TABLE game_elements ADD COLUMN IF NOT EXISTS supported_sports TEXT[];
ALTER TABLE game_elements ADD COLUMN IF NOT EXISTS sponsor_id UUID;
ALTER TABLE game_elements ADD COLUMN IF NOT EXISTS sponsor_name TEXT;
ALTER TABLE game_elements ADD COLUMN IF NOT EXISTS is_permanent_marker BOOLEAN DEFAULT FALSE;
ALTER TABLE game_elements ADD COLUMN IF NOT EXISTS default_offset TEXT;
ALTER TABLE game_elements ADD COLUMN IF NOT EXISTS lock_offset BOOLEAN DEFAULT FALSE;

-- Update sample data with script templates
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

