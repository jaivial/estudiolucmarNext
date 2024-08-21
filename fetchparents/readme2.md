-- Active: 1722636257008@@aws-0-eu-central-1.pooler.supabase.com@5432@postgres@u212050690_estudiolucmar
DROP FUNCTION fetch_parents;
CREATE OR REPLACE FUNCTION u212050690_estudiolucmar.fetch_parents()
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    edificios JSONB;
    escaleras_json JSONB;
BEGIN
    -- Fetch inmuebles where tipoagrupacion = 2
    SELECT jsonb_agg(jsonb_build_object('id', inmuebles.id, 'direccion', inmuebles.direccion)) INTO edificios
    FROM inmuebles
    WHERE inmuebles.tipoagrupacion = 2;

    -- Fetch id and direccion from nestedescaleras where tipoagrupacion = 3
    SELECT jsonb_agg(jsonb_build_object('id', nested ->> 'id', 'direccion', nested ->> 'direccion')) INTO escaleras_json
    FROM inmuebles,
    jsonb_array_elements(inmuebles.nestedescaleras) AS nested
    WHERE nested ->> 'tipoagrupacion' = '3';

    -- Return the result as a JSONB object with two keys: edificios and escaleras
    RETURN jsonb_build_object('edificios', COALESCE(edificios, '[]'::jsonb), 'escaleras', COALESCE(escaleras_json, '[]'::jsonb));
END;
$function$
