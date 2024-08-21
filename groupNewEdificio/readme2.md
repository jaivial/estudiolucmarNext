-- Active: 1722636257008@@aws-0-eu-central-1.pooler.supabase.com@5432@postgres@u212050690_estudiolucmar
DROP FUNCTION create_new_edificio_agrupacion;
CREATE OR REPLACE FUNCTION u212050690_estudiolucmar.create_new_edificio_agrupacion(_name text, _inmuebles integer[])
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    agrupacion_id INT;
    first_inmueble_id INT;
    _coordinates JSONB;
    _superficie BIGINT;
    _ano_construccion BIGINT;
    _zona TEXT;
    nested_inmuebles JSONB;
    _responsable TEXT;
    _encargostate BOOLEAN;
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


    -- Generate a new agrupacion ID by incrementing the max_existing_id
    agrupacion_id := COALESCE(max_existing_id, 0) + 1;

    -- Step 2: Insert the new agrupacion into inmuebles with the generated agrupacion_id
    INSERT INTO inmuebles (id, direccion, TipoAgrupacion, encargostate)
    VALUES (agrupacion_id, _name, 2, FALSE);

    -- Get the first inmueble ID
    first_inmueble_id := _inmuebles[1];

    -- Step 3: Get the coordinates and other data of the first inmueble ID from all possible locations
    SELECT 
        cs.coordinates,
        cs.superficie, 
        cs.ano_construccion, 
        cs.zona, 
        cs.responsable, 
        cs.encargostate
    INTO _coordinates, _superficie, _ano_construccion, _zona, _responsable, _encargostate
    FROM (
        -- Directly from inmuebles table
        SELECT 
            i.coordinates AS coordinates, 
            i.superficie::BIGINT AS superficie, 
            i.ano_construccion::BIGINT AS ano_construccion, 
            i.zona::TEXT AS zona, 
            i.responsable::TEXT AS responsable, 
            i.encargostate::BOOLEAN AS encargostate
        FROM inmuebles i WHERE i.id = first_inmueble_id
        UNION ALL
        -- From nestedinmuebles
        SELECT 
            n->'coordinates' AS coordinates, 
            (n->>'superficie')::BIGINT AS superficie, 
            (n->>'ano_construccion')::BIGINT AS ano_construccion, 
            (n->>'zona')::TEXT AS zona,
            (n->>'responsable')::TEXT AS responsable,
            (n->>'encargostate')::BOOLEAN AS encargostate
        FROM inmuebles i,
        jsonb_array_elements(i.nestedinmuebles) as n
        WHERE (n->>'id')::INT = first_inmueble_id
        UNION ALL
        -- From nestedescaleras -> nestedinmuebles
        SELECT 
            n->'coordinates' AS coordinates, 
            (n->>'superficie')::BIGINT AS superficie, 
            (n->>'ano_construccion')::BIGINT AS ano_construccion, 
            (n->>'zona')::TEXT AS zona,
            (n->>'responsable')::TEXT AS responsable,
            (n->>'encargostate')::BOOLEAN AS encargostate
        FROM inmuebles i,
        jsonb_array_elements(i.nestedescaleras) as e,
        jsonb_array_elements(e->'nestedinmuebles') as n
        WHERE (n->>'id')::INT = first_inmueble_id
    ) cs
    LIMIT 1;

    IF _coordinates IS NOT NULL THEN
        -- Step 4: Update the newly inserted record using variables directly
        UPDATE inmuebles
        SET coordinates = _coordinates,
            superficie = _superficie,
            ano_construccion = _ano_construccion,
            zona = _zona,
            responsable = _responsable,
            encargostate = _encargostate
        WHERE id = agrupacion_id;

        -- Step 5: Select the current nestedinmuebles of the new agrupacion
        SELECT i.nestedinmuebles INTO nested_inmuebles
        FROM inmuebles i
        WHERE i.id = agrupacion_id;

        -- Initialize nestedinmuebles as an empty JSONB array if it's NULL
        IF nested_inmuebles IS NULL THEN
            nested_inmuebles := '[]'::jsonb;
        END IF;

        -- Step 6: Collect full row data for selected inmuebles from all sources
        nested_inmuebles := nested_inmuebles || (
            SELECT jsonb_agg(n)
            FROM (
                -- Directly from inmuebles table
                SELECT 
                    jsonb_build_object(
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
                        'nestedescaleras', i.nestedescaleras,
                        'nestedinmuebles', i.nestedinmuebles,
                        'ano_construccion', i.ano_construccion,
                        'localizado_phone', i.localizado_phone,
                        'aireacondicionado', i.aireacondicionado,
                        'potencialadquisicion', i.potencialadquisicion
                    ) AS n
                FROM inmuebles i WHERE i.id = ANY (_inmuebles)
                UNION ALL
                -- From nestedinmuebles
                SELECT 
                    n
                FROM inmuebles i,
                jsonb_array_elements(i.nestedinmuebles) as n
                WHERE (n->>'id')::INT = ANY(_inmuebles)
                UNION ALL
                -- From nestedescaleras -> nestedinmuebles
                SELECT 
                    n
                FROM inmuebles i,
                jsonb_array_elements(i.nestedescaleras) as e,
                jsonb_array_elements(e->'nestedinmuebles') as n
                WHERE (n->>'id')::INT = ANY(_inmuebles)
            ) sub
        );

        -- Step 7: Update the new agrupacion with the new nestedinmuebles array
        UPDATE inmuebles
        SET nestedinmuebles = nested_inmuebles
        WHERE id = agrupacion_id;

        -- Step 8: Delete items from inmuebles whose IDs are in _inmuebles array
        DELETE FROM inmuebles WHERE id = ANY (_inmuebles);

        RETURN jsonb_build_object('status', 'success', 'agrupacion_id', agrupacion_id);
    ELSE
        RETURN jsonb_build_object('status', 'error', 'message', 'No coordinates found for the first inmueble ID');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$function$
