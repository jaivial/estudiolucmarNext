CREATE OR REPLACE FUNCTION u212050690_estudiolucmar.search_in_nested_inmuebles(
    pattern text, 
    page integer, 
    itemsperpage integer DEFAULT 6, 
    zone text DEFAULT ''::text, 
    responsable_filter text DEFAULT ''::text, 
    filternoticia boolean DEFAULT null, 
    filterencargo boolean DEFAULT null, 
    superficiemin integer DEFAULT 0, 
    superficiemax integer DEFAULT 10000, 
    yearmin integer DEFAULT 1850, 
    yearmax integer DEFAULT EXTRACT(year FROM CURRENT_DATE)
) 
RETURNS TABLE(
    id bigint, 
    direccion text, 
    tipo text, 
    uso text, 
    superficie text, 
    ano_construccion text, 
    categoria text, 
    potencialadquisicion text, 
    noticiastate boolean, 
    responsable text, 
    encargostate boolean, 
    coordinates jsonb, 
    zona text, 
    date_time timestamp with time zone, 
    inmuebleimages text, 
    location text, 
    habitaciones integer, 
    garaje boolean, 
    descripcion text, 
    ascensor boolean, 
    banyos integer, 
    trastero boolean, 
    jardin boolean, 
    terraza boolean, 
    aireacondicionado boolean, 
    tipoagrupacion bigint, 
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
            -- Handle nested escalera filtering
            CASE
                WHEN i.direccion ILIKE pattern 
                THEN i.nestedescaleras
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
                                SELECT jsonb_agg(nested_ni)
                                FROM jsonb_array_elements(esc->'nestedinmuebles') AS nested_ni
                                WHERE nested_ni->>'direccion' ILIKE pattern
                                  AND (zone = '' OR LOWER(nested_ni->>'zona') LIKE LOWER('%' || zone || '%'))
                                  AND (responsable_filter = '' OR LOWER(nested_ni->>'responsable') LIKE LOWER('%' || responsable_filter || '%'))
                                  AND ((filternoticia IS TRUE AND nested_ni->>'noticiastate' = 'true') OR (filternoticia IS FALSE AND nested_ni->>'noticiastate' = 'false'))
                                  AND ((filterencargo IS TRUE AND nested_ni->>'encargostate' = 'true') OR (filterencargo IS FALSE AND nested_ni->>'encargostate' = 'false'))
                                  AND (nested_ni->>'superficie')::int BETWEEN superficiemin AND superficiemax
                                  AND (nested_ni->>'ano_construccion')::int BETWEEN yearmin AND yearmax
                            )
                        )
                    )
                    FROM jsonb_array_elements(i.nestedescaleras) AS esc
                    WHERE EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(esc->'nestedinmuebles') AS nested_ni
                        WHERE nested_ni->>'direccion' ILIKE pattern
                          AND (zone = '' OR LOWER(nested_ni->>'zona') LIKE LOWER('%' || zone || '%'))
                          AND (responsable_filter = '' OR LOWER(nested_ni->>'responsable') LIKE LOWER('%' || responsable_filter || '%'))
                          AND ((filternoticia IS TRUE AND nested_ni->>'noticiastate' = 'true') OR (filternoticia IS FALSE AND nested_ni->>'noticiastate' = 'false'))
                                  AND ((filterencargo IS TRUE AND nested_ni->>'encargostate' = 'true') OR (filterencargo IS FALSE AND nested_ni->>'encargostate' = 'false'))

                          AND (nested_ni->>'superficie')::int BETWEEN superficiemin AND superficiemax
                          AND (nested_ni->>'ano_construccion')::int BETWEEN yearmin AND yearmax
                    )
                )
            END AS nestedescaleras,
            -- Handle nested inmuebles filtering
            CASE
                WHEN i.direccion ILIKE pattern 
                THEN i.nestedinmuebles
                ELSE (
                    SELECT jsonb_agg(nested_ni)
                    FROM jsonb_array_elements(i.nestedinmuebles) AS nested_ni
                    WHERE nested_ni->>'direccion' ILIKE pattern
                      AND (zone = '' OR LOWER(nested_ni->>'zona') LIKE LOWER('%' || zone || '%'))
                      AND (responsable_filter = '' OR LOWER(nested_ni->>'responsable') LIKE LOWER('%' || responsable_filter || '%'))
                      AND ((filternoticia IS TRUE AND nested_ni->>'noticiastate' = 'true') OR (filternoticia IS FALSE AND nested_ni->>'noticiastate' = 'false'))
                                  AND ((filterencargo IS TRUE AND nested_ni->>'encargostate' = 'true') OR (filterencargo IS FALSE AND nested_ni->>'encargostate' = 'false'))

                      AND (nested_ni->>'superficie')::int BETWEEN superficiemin AND superficiemax
                      AND (nested_ni->>'ano_construccion')::int BETWEEN yearmin AND yearmax
                )
            END AS nestedinmuebles,
            COUNT(*) OVER () AS total_count
        FROM inmuebles i
        WHERE (i.direccion ILIKE pattern 
           OR EXISTS (
               SELECT 1
               FROM jsonb_array_elements(i.nestedinmuebles) AS nested_ni
               WHERE nested_ni->>'direccion' ILIKE pattern
                 AND (zone = '' OR LOWER(nested_ni->>'zona') LIKE LOWER('%' || zone || '%'))
                 AND (responsable_filter = '' OR LOWER(nested_ni->>'responsable') LIKE LOWER('%' || responsable_filter || '%'))
                 AND ((filternoticia IS TRUE AND nested_ni->>'noticiastate' = 'true') OR (filternoticia IS FALSE AND nested_ni->>'noticiastate' = 'false'))
                                  AND ((filterencargo IS TRUE AND nested_ni->>'encargostate' = 'true') OR (filterencargo IS FALSE AND nested_ni->>'encargostate' = 'false'))

                 AND (nested_ni->>'superficie')::int BETWEEN superficiemin AND superficiemax
                 AND (nested_ni->>'ano_construccion')::int BETWEEN yearmin AND yearmax
           )
           OR EXISTS (
               SELECT 1
               FROM jsonb_array_elements(i.nestedescaleras) AS esc
               WHERE EXISTS (
                   SELECT 1
                   FROM jsonb_array_elements(esc->'nestedinmuebles') AS nested_ni
                   WHERE nested_ni->>'direccion' ILIKE pattern
                     AND (zone = '' OR LOWER(nested_ni->>'zona') LIKE LOWER('%' || zone || '%'))
                     AND (responsable_filter = '' OR LOWER(nested_ni->>'responsable') LIKE LOWER('%' || responsable_filter || '%'))
                     AND ((filternoticia IS TRUE AND nested_ni->>'noticiastate' = 'true') OR (filternoticia IS FALSE AND nested_ni->>'noticiastate' = 'false'))
                                  AND ((filterencargo IS TRUE AND nested_ni->>'encargostate' = 'true') OR (filterencargo IS FALSE AND nested_ni->>'encargostate' = 'false'))

                     AND (nested_ni->>'superficie')::int BETWEEN superficiemin AND superficiemax
                     AND (nested_ni->>'ano_construccion')::int BETWEEN yearmin AND yearmax
               )
           ))
          AND (zone = '' OR LOWER(i.zona) LIKE LOWER('%' || zone || '%'))
AND (responsable_filter = '' OR LOWER(i.responsable) LIKE LOWER('%' || responsable_filter || '%'))
AND (filternoticia IS NULL OR (filternoticia = TRUE AND i.noticiastate = 'true') OR (filternoticia = FALSE AND i.noticiastate = 'false'))
AND (filterencargo IS NULL OR (filterencargo = TRUE AND i.encargostate = 'true') OR (filterencargo = FALSE AND i.encargostate = 'false'))


    )
    SELECT * FROM filtered_inmuebles
    LIMIT itemsperpage OFFSET (page - 1) * itemsperpage;
END;
$function$;