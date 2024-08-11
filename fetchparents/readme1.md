-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS fetch_parents ();

-- Create the new function returning two arrays: one for edificios and one for escaleras
CREATE OR REPLACE FUNCTION fetch_parents()
RETURNS JSONB AS $$
DECLARE
    edificios JSONB;
    escaleras_json JSONB;
BEGIN
    -- Fetch edificios where tipoagrupacion = 2
    SELECT jsonb_agg(jsonb_build_object('id', inmuebles.id, 'direccion', inmuebles.direccion)) INTO edificios
    FROM inmuebles
    WHERE inmuebles.tipoagrupacion = 2;

    -- Fetch escaleras where nestedescaleras has tipoagrupacion = 3
    SELECT jsonb_agg(jsonb_build_object('id', inmuebles.id, 'direccion', inmuebles.direccion)) INTO escaleras_json
    FROM inmuebles
    WHERE EXISTS (
        SELECT 1
        FROM jsonb_array_elements(inmuebles.nestedescaleras) AS nested
        WHERE nested ->> 'tipoagrupacion' = '3'
    );

    -- Return the result as a JSONB object with two keys: edificios and escaleras
    RETURN jsonb_build_object('edificios', COALESCE(edificios, '[]'::jsonb), 'escaleras', COALESCE(escaleras_json, '[]'::jsonb));
END;
$$ LANGUAGE plpgsql;