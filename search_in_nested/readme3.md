DROP FUNCTION search_in_nested_inmuebles;

CREATE OR REPLACE FUNCTION u212050690_estudiolucmar.search_in_nested_inmuebles(pattern text, page integer, itemsperpage integer DEFAULT 6)
RETURNS TABLE(
    id bigint,
    direccion character varying,
    tipo character varying,
    uso character varying,
    superficie character varying,
    ano_construccion bigint,
    categoria character varying,
    potencialadquisicion boolean,
    noticiastate boolean,
    responsable character varying,
    encargostate boolean,
    coordinates text,
    zona character varying,
    date_time timestamp with time zone,
    inmuebleimages bytea,
    location character varying,
    habitaciones bigint,
    garaje boolean,
    descripcion character varying,
    ascensor boolean,
    banyos bigint,
    trastero boolean,
    jardin boolean,
    terraza boolean,
    aireacondicionado boolean,
    tipoagrupacion smallint,
    nestedescaleras jsonb,
    nestedinmuebles jsonb,
    total_count bigint
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH filtered_inmuebles AS (
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
                ELSE (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', esc->>'id',
                            'uso', esc->>'uso',
                            'tipo', esc->>'tipo',
                            'zona', esc->>'zona',
                            'banyos', esc->>'banyos',
                            'garaje', esc->>'garaje',
                            'jardin', esc->>'jardin',
                            'numero', esc->>'numero',
                            'grouped', esc->>'grouped',
                            'terraza', esc->>'terraza',
                            'ascensor', esc->>'ascensor',
                            'location', esc->>'location',
                            'parentid', esc->>'parentid',
                            'trastero', esc->>'trastero',
                            'categoria', esc->>'categoria',
                            'date_time', esc->>'date_time',
                            'direccion', esc->>'direccion',
                            'superficie', esc->>'superficie',
                            'coordinates', esc->>'coordinates',
                            'descripcion', esc->>'descripcion',
                            'responsable', esc->>'responsable',
                            'agrupacionid', esc->>'agrupacionid',
                            'encargostate', esc->>'encargostate',
                            'escaleras_id', esc->>'escaleras_id',
                            'habitaciones', esc->>'habitaciones',
                            'inmuebles_id', esc->>'inmuebles_id',
                            'noticiastate', esc->>'noticiastate',
                            'childedificio', esc->>'childedificio',
                            'childescalera', esc->>'childescalera',
                            'inmuebleimages', esc->>'inmuebleimages',
                            'parentedificio', esc->>'parentedificio',
                            'parentescalera', esc->>'parentescalera',
                            'tipoagrupacion', esc->>'tipoagrupacion',
                            'nestedescaleras', esc->>'nestedescaleras',
                            'nestedinmuebles', (
                                SELECT jsonb_agg(ni)
                                FROM jsonb_array_elements(esc->'nestedinmuebles') AS ni
                                WHERE ni->>'direccion' ILIKE pattern
                            )
                        )
                    )
                    FROM jsonb_array_elements(i.nestedescaleras) AS esc
                    WHERE EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(esc->'nestedinmuebles') AS ni
                        WHERE ni->>'direccion' ILIKE pattern
                    )
                )
            END AS nestedescaleras,
            CASE
                WHEN i.direccion ILIKE pattern THEN i.nestedinmuebles
                ELSE (
                    SELECT jsonb_agg(ni)
                    FROM jsonb_array_elements(i.nestedinmuebles) AS ni
                    WHERE ni->>'direccion' ILIKE pattern
                )
            END AS nestedinmuebles,
            COUNT(*) OVER () AS total_count
        FROM inmuebles i
        WHERE i.direccion ILIKE pattern 
           OR EXISTS (
               SELECT 1
               FROM jsonb_array_elements(i.nestedinmuebles) AS ni
               WHERE ni->>'direccion' ILIKE pattern
           )
           OR EXISTS (
               SELECT 1
               FROM jsonb_array_elements(i.nestedescaleras) AS esc
               WHERE EXISTS (
                   SELECT 1
                   FROM jsonb_array_elements(esc->'nestedinmuebles') AS ni
                   WHERE ni->>'direccion' ILIKE pattern
               )
           )
    )
    SELECT * FROM filtered_inmuebles
    LIMIT itemsPerPage OFFSET (page - 1) * itemsPerPage;
END;
$function$;