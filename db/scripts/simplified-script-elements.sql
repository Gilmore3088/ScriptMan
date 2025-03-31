-- Create a junction table to connect elements to scripts (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.script_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  element_id UUID NOT NULL REFERENCES public.elements(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('PREGAME', 'IN_GAME', 'HALFTIME', 'POSTGAME')),
  start_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'script_elements' 
    AND policyname = 'Users can view their own script elements'
  ) THEN
    ALTER TABLE public.script_elements ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Users can view their own script elements"
      ON public.script_elements
      FOR SELECT
      USING (auth.uid() = (SELECT user_id FROM public.scripts WHERE id = script_id));
    
    CREATE POLICY "Users can insert their own script elements"
      ON public.script_elements
      FOR INSERT
      WITH CHECK (auth.uid() = (SELECT user_id FROM public.scripts WHERE id = script_id));
    
    CREATE POLICY "Users can update their own script elements"
      ON public.script_elements
      FOR UPDATE
      USING (auth.uid() = (SELECT user_id FROM public.scripts WHERE id = script_id));
    
    CREATE POLICY "Users can delete their own script elements"
      ON public.script_elements
      FOR DELETE
      USING (auth.uid() = (SELECT user_id FROM public.scripts WHERE id = script_id));
  END IF;
END
$$;

-- Create or replace the function to get script elements
CREATE OR REPLACE FUNCTION public.get_script_elements(p_script_id UUID)
RETURNS TABLE (
  id UUID,
  script_id UUID,
  element_id UUID,
  position INTEGER,
  category TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  element_name TEXT,
  element_description TEXT,
  element_type TEXT,
  element_category TEXT,
  sponsor_id UUID,
  sponsor_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.id,
    se.script_id,
    se.element_id,
    se.position,
    se.category,
    se.start_time,
    se.duration,
    e.name AS element_name,
    e.description AS element_description,
    e.type AS element_type,
    e.category AS element_category,
    e.sponsor_id,
    s.name AS sponsor_name
  FROM 
    public.script_elements se
  JOIN 
    public.elements e ON se.element_id = e.id
  LEFT JOIN 
    public.sponsors s ON e.sponsor_id = s.id
  WHERE 
    se.script_id = p_script_id
  ORDER BY 
    se.category, se.position;
END;
$$;

