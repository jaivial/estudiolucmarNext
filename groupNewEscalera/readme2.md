-- Active: 1722636257008@@aws-0-eu-central-1.pooler.supabase.com@5432@postgres@u212050690_estudiolucmar
DROP FUNCTION create_new_escalera_agrupacion;
CREATE OR REPLACE FUNCTION u212050690_estudiolucmar.create_new_escalera_agrupacion(_name text, _inmuebles integer[], _grupo integer)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    agrupacion_id INT;
    inmueblestopushintoescalera JSONB := '[]'::jsonb; -- Initialize empty array
    current_inmueble JSONB;
    escalera JSONB;
    _tipo TEXT;
    _zona TEXT;
    _location TEXT;
    _coordinates JSONB;
    _responsable TEXT;
    new_escalera_id INT;
    max_existing_id INT;
BEGIN
    -- Step 1: Collect all existing IDs from inmuebles, nestedinmuebles, nestedescaleras, and nestedescaleras -> nestedinmuebles
    WITH all_ids AS (
        SELECT id FROM inmuebles
        UNION
        SELECT (jsonb_array_elements(nestedinmuebles)->>'id')::INT FROM inmuebles WHERE nestedinmuebles IS NOT NULL
        UNION
        SELECT (jsonb_array_elements(nestedescaleras)->>'id')::INT FROM inmuebles WHERE nestedescaleras IS NOT NULL
        UNION
        SELECT (jsonb_array_elements(jsonb_array_elements(nestedescaleras)->'nestedinmuebles')->>'id')::INT FROM inmuebles WHERE nestedescaleras IS NOT NULL
    )
    SELECT COALESCE(MAX(id), 0) INTO max_existing_id FROM all_ids;

    -- Generate a new escalera id by incrementing the max_existing_id
    new_escalera_id := COALESCE(max_existing_id, 0) + 1;

    -- Step 2: Collect and delete matching elements from inmuebles
    FOR current_inmueble IN 
        SELECT jsonb_build_object(
                    'id', i.id,
                    'uso', i.uso,
                    'tipo', i.tipo,
                    'zona', i.zona,
                    'banyos', i.banyos,
                    'garaje', i.garaje,
                    'jardin', i.jardin,
                    'terraza', i.terraza,
                    'ascensor', i.ascensor,
                    'location', i.location,
                    'trastero', i.trastero,
                    'categoria', i.categoria,
                    'date_time', i.date_time,
                    'direccion', i.direccion,
                    'localizado', i.localizado,
                    'superficie', i.superficie,
                    'coordinates', i.coordinates,
                    'descripcion', i.descripcion,
                    'responsable', i.responsable,
                    'encargostate', i.encargostate,
                    'habitaciones', i.habitaciones,
                    'noticiastate', i.noticiastate,
                    'inmuebleimages', i.inmuebleimages,
                    'tipoagrupacion', i.tipoagrupacion,
                    'ano_construccion', i.ano_construccion,
                    'localizado_phone', i.localizado_phone,
                    'aireacondicionado', i.aireacondicionado,
                    'potencialadquisicion', i.potencialadquisicion
                ) AS current_inmueble
        FROM inmuebles i 
        WHERE i.id = ANY (_inmuebles)
    LOOP
        -- Push the found element into the array
        inmueblestopushintoescalera := inmueblestopushintoescalera || current_inmueble;
        
        -- Delete the found element from inmuebles
        DELETE FROM inmuebles WHERE id = (current_inmueble->>'id')::INT;
    END LOOP;

    -- Step 3: Collect and delete matching elements from nestedinmuebles
    FOR current_inmueble IN 
        SELECT n 
        FROM inmuebles i, jsonb_array_elements(i.nestedinmuebles) as n 
        WHERE (n->>'id')::INT = ANY (_inmuebles)
    LOOP
        -- Push the found element into the array
        inmueblestopushintoescalera := inmueblestopushintoescalera || current_inmueble;

        -- Remove the found element from nestedinmuebles
        UPDATE inmuebles
        SET nestedinmuebles = jsonb_agg(elem)
        FROM (
            SELECT jsonb_array_elements(nestedinmuebles) AS elem
            WHERE (elem->>'id')::INT != (current_inmueble->>'id')::INT
        ) AS sub
        WHERE id = i.id;
    END LOOP;

    -- Step 4: Collect and delete matching elements from nestedescaleras -> nestedinmuebles
    FOR current_inmueble IN 
        SELECT e 
        FROM inmuebles i, jsonb_array_elements(i.nestedescaleras) as esc, 
        jsonb_array_elements(esc->'nestedinmuebles') AS e 
        WHERE (e->>'id')::INT = ANY (_inmuebles)
    LOOP
        -- Push the found element into the array
        inmueblestopushintoescalera := inmueblestopushintoescalera || current_inmueble;

        -- Remove the found element from nestedescaleras -> nestedinmuebles
        UPDATE inmuebles
        SET nestedescaleras = jsonb_agg(
            jsonb_set(esc, '{nestedinmuebles}', jsonb_agg(e))
        )
        FROM (
            SELECT jsonb_array_elements(i.nestedescaleras) AS esc
            FROM inmuebles i
            WHERE (jsonb_array_elements(esc->'nestedinmuebles')->>'id')::INT != (current_inmueble->>'id')::INT
        ) AS sub
        WHERE id = i.id;
    END LOOP;

    -- Step 5: Select attributes from the first element in inmueblestopushintoescalera
    SELECT 
        (inmueblestopushintoescalera->0->>'tipo')::TEXT,
        (inmueblestopushintoescalera->0->>'zona')::TEXT,
        (inmueblestopushintoescalera->0->>'location')::TEXT,
        (inmueblestopushintoescalera->0->>'coordinates')::JSONB,
        (inmueblestopushintoescalera->0->>'responsable')::TEXT
    INTO _tipo, _zona, _location, _coordinates, _responsable;

    -- Step 6: Create a new escalera object and append it to the nestedescaleras of the grupo
    escalera := jsonb_build_object(
        'id', new_escalera_id,
        'direccion', _name,
        'tipo', _tipo,
        'zona', _zona,
        'location', _location,
        'coordinates', _coordinates,
        'responsable', _responsable,
        'tipoagrupacion', 3,
        'nestedinmuebles', inmueblestopushintoescalera
    );

    -- Update the grupo with the new escalera
    UPDATE inmuebles
    SET nestedescaleras = COALESCE(nestedescaleras, '[]'::jsonb) || escalera
    WHERE id = _grupo AND tipoagrupacion = 2;

    RETURN jsonb_build_object('status', 'success', 'agrupacion_id', agrupacion_id);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$function$
