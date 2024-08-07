DROP FUNCTION IF EXISTS u212050690_estudiolucmar.search_in_nested_inmuebles;

CREATE OR REPLACE FUNCTION u212050690_estudiolucmar.search_in_nested_inmuebles(pattern text, page INT, itemsPerPage INT DEFAULT 6)
RETURNS TABLE (
    id BIGINT,
    direccion CHARACTER VARYING,
    tipo CHARACTER VARYING,
    uso CHARACTER VARYING,
    superficie CHARACTER VARYING,
    ano_construccion BIGINT,
    categoria CHARACTER VARYING,
    potencialadquisicion BOOLEAN,
    noticiastate BOOLEAN,
    responsable CHARACTER VARYING,
    encargostate BOOLEAN,
    coordinates TEXT,
    zona CHARACTER VARYING,
    date_time TIMESTAMP WITH TIME ZONE,
    inmuebleimages BYTEA,
    location CHARACTER VARYING,
    habitaciones BIGINT,
    garaje BOOLEAN,
    descripcion CHARACTER VARYING,
    ascensor BOOLEAN,
    banyos BIGINT,
    trastero BOOLEAN,
    jardin BOOLEAN,
    terraza BOOLEAN,
    aireacondicionado BOOLEAN,
    tipoagrupacion SMALLINT,
    nestedescaleras JSONB,
    nestedinmuebles JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH filtered AS (
        SELECT
            i.id,
            i.direccion,
            i.tipo,
            i.uso,
            i.superficie,
            i.ano_construccion,
            i.categoria,
            i.potencialadquisicion,
            i.noticiastate,
            i.responsable,
            i.encargostate,
            i.coordinates,
            i.zona,
            i.date_time,
            i.inmuebleimages,
            i.location,
            i.habitaciones,
            i.garaje,
            i.descripcion,
            i.ascensor,
            i.banyos,
            i.trastero,
            i.jardin,
            i.terraza,
            i.aireacondicionado,
            i.tipoagrupacion,
            CASE
                WHEN i.direccion ILIKE pattern THEN i.nestedescaleras
                ELSE jsonb_agg(filtered_escaleras.esc) FILTER (WHERE filtered_escaleras.esc IS NOT NULL)
            END AS nestedescaleras,
            CASE
                WHEN i.direccion ILIKE pattern THEN i.nestedinmuebles
                ELSE jsonb_agg(filtered_elements.elem) FILTER (WHERE filtered_elements.elem IS NOT NULL)
            END AS nestedinmuebles
        FROM inmuebles i
        LEFT JOIN LATERAL (
            SELECT esc
            FROM jsonb_array_elements(i.nestedescaleras) AS esc
            WHERE EXISTS (
                SELECT 1
                FROM jsonb_array_elements(esc->'nestedinmuebles') AS ni
                WHERE ni->>'direccion' ILIKE pattern
            )
        ) AS filtered_escaleras ON true
        LEFT JOIN LATERAL (
            SELECT elem
            FROM jsonb_array_elements(i.nestedinmuebles) AS elem
            WHERE elem->>'direccion' ILIKE pattern
        ) AS filtered_elements ON true
        WHERE i.direccion ILIKE pattern OR filtered_elements.elem IS NOT NULL
        GROUP BY 
            i.id, i.direccion, i.tipo, i.uso, i.superficie, i.ano_construccion,
            i.categoria, i.potencialadquisicion, i.noticiastate, i.responsable,
            i.encargostate, i.coordinates, i.zona, i.date_time,
            i.inmuebleimages, i.location, i.habitaciones, i.garaje, i.descripcion,
            i.ascensor, i.banyos, i.trastero, i.jardin, i.terraza, i.aireacondicionado,
            i.tipoagrupacion
    )
    SELECT * FROM filtered
    LIMIT itemsPerPage OFFSET (page - 1) * itemsPerPage;
END;
$$;
