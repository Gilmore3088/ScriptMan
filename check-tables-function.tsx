--Create
a
function to
\
check
if tables exist
CREATE
OR
REPLACE
FUNCTION
check_tables_exist(table_names TEXT[])
RETURNS
BOOLEAN
AS
$$
DECLARE
table_exists
BOOLEAN
table_name
TEXT
BEGIN
FOREACH
table_name
IN
ARRAY
table_names
LOOP
SELECT
EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = table_name
    )
INTO
table_exists

IF
NOT
table_exists
THEN
RETURN
FALSE
END
IF
END
LOOP

RETURN
TRUE
END
$$
LANGUAGE
plpgsql
SECURITY
DEFINER

--Grant
access
to
the
function
GRANT
EXECUTE
ON
FUNCTION
check_tables_exist
TO
authenticated
GRANT
EXECUTE
ON
FUNCTION
check_tables_exist
TO
anon
GRANT
EXECUTE
ON
FUNCTION
check_tables_exist
TO
service_role

