-- Check if the category column exists and rename it to period if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'script_elements'
        AND column_name = 'category'
    ) THEN
        ALTER TABLE script_elements RENAME COLUMN category TO period;
    END IF;
END $$;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS get_script_elements(UUID);

-- Create a function to get script elements with the new column name
CREATE OR REPLACE FUNCTION get_script_elements(p_script_id UUID)
RETURNS TABLE (
  id UUID,
  script_id UUID,
  element_id UUID,
  "position" INTEGER,  -- Quoted to handle reserved keyword
  period TEXT,
  start_time TIMESTAMPTZ,
  duration INTEGER,
  element_name TEXT,
  element_description TEXT,
  element_type TEXT,
  element_category TEXT,
  sponsor_id UUID,
  sponsor_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.id,
    se.script_id,
    se.element_id,
    se."position",  -- Quoted to handle reserved keyword
    se.period,
    se.start_time,
    se.duration,
    e.name AS element_name,
    e.description AS element_description,
    e.type AS element_type,
    e.category AS element_category,
    e.sponsor_id,
    s.name AS sponsor_name
  FROM 
    script_elements se
  JOIN 
    elements e ON se.element_id = e.id
  LEFT JOIN 
    sponsors s ON e.sponsor_id = s.id
  WHERE 
    se.script_id = p_script_id
  ORDER BY 
    se.period, se."position";  -- Quoted to handle reserved keyword
END;
$$ LANGUAGE plpgsql;

