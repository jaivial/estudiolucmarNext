-- Drop the function if it exists
DROP FUNCTION IF EXISTS create_new_edificio_agrupacion (TEXT, INT[]);

-- Create the function
CREATE OR REPLACE FUNCTION create_new_edificio_agrupacion(
    _name TEXT,
    _inmuebles INT[]
) RETURNS JSONB AS $$
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
BEGIN
    -- Step 1: Insert new record into inmuebles
    INSERT INTO inmuebles (direccion, TipoAgrupacion, encargostate)
    VALUES (_name, 2, FALSE)
    RETURNING id INTO agrupacion_id;

    -- Get the first inmueble ID
    first_inmueble_id := _inmuebles[1];

    -- Step 2: Get the coordinates and other data of the first inmueble ID from all possible locations
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
        -- Update the newly inserted record using variables directly
        UPDATE inmuebles
        SET coordinates = _coordinates,
            superficie = _superficie,
            ano_construccion = _ano_construccion,
            zona = _zona,
            responsable = _responsable,
            encargostate = _encargostate
        WHERE id = agrupacion_id;

        -- Step 3: Select the current nestedinmuebles of the new agrupacion
        SELECT i.nestedinmuebles INTO nested_inmuebles
        FROM inmuebles i
        WHERE i.id = agrupacion_id;

        -- Initialize nestedinmuebles as an empty JSONB array if it's NULL
        IF nested_inmuebles IS NULL THEN
            nested_inmuebles := '[]'::jsonb;
        END IF;

        -- Step 4: Collect full row data for selected inmuebles from all sources
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

        -- Update the new agrupacion with the new nestedinmuebles array
        UPDATE inmuebles
        SET nestedinmuebles = nested_inmuebles
        WHERE id = agrupacion_id;

        RETURN jsonb_build_object('status', 'success');
    ELSE
        RETURN jsonb_build_object('status', 'error', 'message', 'No coordinates found for the first inmueble ID');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;