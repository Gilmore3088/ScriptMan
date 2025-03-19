-- Create elements table
CREATE TABLE IF NOT EXISTS elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Sponsor Read', 'Permanent Marker', 'Generic Event', etc.
  sponsor_id UUID REFERENCES sponsors(id) ON DELETE SET NULL,
  supported_sports JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array of sports as JSON
  script_template TEXT, -- Text with placeholders, e.g. "Hey {sport} fans…"
  is_permanent BOOLEAN NOT NULL DEFAULT false, -- If true, indicates a permanent marker
  default_offset TEXT, -- If it's a permanent marker, store "-90m from game start", etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on elements for faster lookups
CREATE INDEX IF NOT EXISTS idx_elements_sponsor_id ON elements(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_elements_type ON elements(type);
CREATE INDEX IF NOT EXISTS idx_elements_is_permanent ON elements(is_permanent);

-- Create element_usage table to track usage
CREATE TABLE IF NOT EXISTS element_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id UUID NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  show_flow_item_id UUID REFERENCES show_flow_items(id) ON DELETE SET NULL,
  placeholders JSONB, -- Captures how placeholders were filled, e.g. {"sport": "football"}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes on element_usage for faster lookups
CREATE INDEX IF NOT EXISTS idx_element_usage_element_id ON element_usage(element_id);
CREATE INDEX IF NOT EXISTS idx_element_usage_game_id ON element_usage(game_id);
CREATE INDEX IF NOT EXISTS idx_element_usage_show_flow_item_id ON element_usage(show_flow_item_id);

-- Add element_id to show_flow_items table
ALTER TABLE show_flow_items 
ADD COLUMN IF NOT EXISTS element_id UUID REFERENCES elements(id) ON DELETE SET NULL;

-- Create index on show_flow_items.element_id
CREATE INDEX IF NOT EXISTS idx_show_flow_items_element_id ON show_flow_items(element_id);

-- Create sports table for standardized sport names
CREATE TABLE IF NOT EXISTS sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert some common sports
INSERT INTO sports (name) VALUES 
  ('Football'),
  ('Basketball'),
  ('Baseball'),
  ('Soccer'),
  ('Hockey')
ON CONFLICT (name) DO NOTHING;

-- Create element_sports junction table (alternative to JSONB approach if needed)
CREATE TABLE IF NOT EXISTS element_sports (
  element_id UUID NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (element_id, sport_id)
);

-- Add sport_id to seasons table
ALTER TABLE seasons
ADD COLUMN IF NOT EXISTS sport_id UUID REFERENCES sports(id) ON DELETE SET NULL;

-- Create index on seasons.sport_id
CREATE INDEX IF NOT EXISTS idx_seasons_sport_id ON seasons(sport_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_elements_timestamp
BEFORE UPDATE ON elements
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_sports_timestamp
BEFORE UPDATE ON sports
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

