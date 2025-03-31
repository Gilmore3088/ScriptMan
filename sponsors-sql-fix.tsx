export const sponsorsSQLFix = `
-- Add missing columns to sponsors table
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS description TEXT;

-- Make sure the sponsors table has all required columns
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add some sample sponsors if the table is empty
INSERT INTO sponsors (name, description)
SELECT 'Nike', 'Global sports apparel and footwear company'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Nike');

INSERT INTO sponsors (name, description)
SELECT 'Coca-Cola', 'Multinational beverage corporation'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Coca-Cola');

INSERT INTO sponsors (name, description)
SELECT 'Gatorade', 'Sports drink manufacturer'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name = 'Gatorade');
`

