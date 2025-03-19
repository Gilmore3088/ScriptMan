export const gameElementsTableSQL = `
-- Create extension for UUID generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create game_elements table if it doesn't exist
CREATE TABLE IF NOT EXISTS game_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  script_template TEXT,
  supported_sports TEXT[],
  sponsor_id UUID,
  sponsor_name TEXT,
  is_permanent_marker BOOLEAN DEFAULT FALSE,
  default_offset TEXT,
  lock_offset BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS game_elements_name_idx ON game_elements (name);

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS game_elements_type_idx ON game_elements (type);

-- Add some sample data if the table is empty
INSERT INTO game_elements (name, type, script_template, supported_sports, is_permanent_marker, default_offset, sponsor_name)
SELECT 
  'Gate Open', 
  'Permanent Marker', 
  'Gates are now open for today''s {sport} game!', 
  ARRAY['Football', 'Basketball', 'Baseball'], 
  TRUE, 
  '-90m',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM game_elements LIMIT 1);

INSERT INTO game_elements (name, type, script_template, supported_sports, is_permanent_marker, sponsor_name)
SELECT 
  'Coca-Cola Halftime Show', 
  'Sponsor Read', 
  'The {sport} halftime show is brought to you by Coca-Cola. Taste the feeling!', 
  ARRAY['Football', 'Basketball'], 
  FALSE,
  'Coca-Cola'
WHERE NOT EXISTS (SELECT 1 FROM game_elements WHERE name = 'Coca-Cola Halftime Show');

INSERT INTO game_elements (name, type, script_template, supported_sports, is_permanent_marker, sponsor_name)
SELECT 
  'Nike Player of the Game', 
  'Sponsor Read', 
  'Today''s {sport} player of the game is brought to you by Nike. Just Do It!', 
  ARRAY['Football', 'Basketball', 'Soccer'], 
  FALSE,
  'Nike'
WHERE NOT EXISTS (SELECT 1 FROM game_elements WHERE name = 'Nike Player of the Game');

-- Create sponsors table if it doesn't exist
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some sample sponsors if the table is empty
INSERT INTO sponsors (name, description)
SELECT 'Coca-Cola', 'Global beverage company'
WHERE NOT EXISTS (SELECT 1 FROM sponsors LIMIT 1);

INSERT INTO sponsors (name, description)
SELECT 'Nike', 'Sports apparel and equipment'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Nike');

INSERT INTO sponsors (name, description)
SELECT 'Gatorade', 'Sports hydration drinks'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Gatorade');

INSERT INTO sponsors (name, description)
SELECT 'State Farm', 'Insurance company'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'State Farm');

INSERT INTO sponsors (name, description)
SELECT 'Toyota', 'Automotive manufacturer'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Toyota');
`

