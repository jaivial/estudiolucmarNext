-- Drop the function if it exists
DROP FUNCTION IF EXISTS search_in_nested_inmuebles;

-- Create the function
CREATE OR REPLACE FUNCTION search_in_nested_inmuebles(
    pattern text,
    page integer,
    itemsperpage integer DEFAULT 6,
    zone text DEFAULT ''::text,
    responsable_filter text DEFAULT ''::text,
    categoria_filter text DEFAULT ''::text,
    filternoticia boolean DEFAULT NULL::boolean,
    filterencargo boolean DEFAULT NULL::boolean,
    superficiemin integer DEFAULT 0,
    superficiemax integer DEFAULT 10000,
    yearmin integer DEFAULT 1850,
    yearmax integer DEFAULT EXTRACT(year FROM CURRENT_DATE),
    localizado_filter boolean DEFAULT NULL::boolean,
    habitaciones_filter integer DEFAULT NULL::integer,
    banos_filter integer DEFAULT NULL::integer,
    tipo_filter integer DEFAULT NULL::integer,
    aireacondicionado_filter boolean DEFAULT NULL::boolean,
    ascensor_filter boolean DEFAULT NULL::boolean,
    garaje_filter boolean DEFAULT NULL::boolean,
    jardin_filter boolean DEFAULT NULL::boolean,
    terraza_filter boolean DEFAULT NULL::boolean,
    trastero_filter boolean DEFAULT NULL::boolean
) RETURNS TABLE(
    id bigint, direccion text, tipo text, uso text, superficie bigint,
    ano_construccion bigint, categoria text, potencialadquisicion text,
    noticiastate boolean, responsable text, encargostate boolean,
    coordinates jsonb, zona text, date_time timestamp with time zone,
    inmuebleimages text, location text, habitaciones integer, garaje boolean,
    descripcion text, ascensor boolean, banyos integer, trastero boolean,
    jardin boolean, terraza boolean, aireacondicionado boolean,
    tipoagrupacion bigint, localizado boolean, nestedescaleras jsonb,
    nestedinmuebles jsonb, total_count bigint, responsables_count jsonb,
    categorias_count jsonb, zonas_count jsonb, noticias_count bigint,
    encargos_count bigint, localizados_count bigint
) LANGUAGE plpgsql AS $function$
BEGIN
    RETURN QUERY
    WITH filtered_inmuebles AS (
        SELECT
            i.id, i.direccion, i.tipo, i.uso, i.superficie,
            i.ano_construccion, i.categoria, i.potencialadquisicion,
            i.noticiastate, i.responsable, i.encargostate, i.coordinates,
            i.zona, i.date_time, i.inmuebleimages, i.location,
            i.habitaciones, i.garaje, i.descripcion, i.ascensor,
            i.banyos, i.trastero, i.jardin, i.terraza, i.aireacondicionado,
            i.tipoagrupacion, i.localizado, i.nestedescaleras, i.nestedinmuebles,
            COUNT(*) OVER () AS total_count
        FROM inmuebles i
        WHERE (
            -- Direct match on main table
            i.direccion ILIKE pattern 
            OR 
            -- Match in nestedinmuebles
            EXISTS (
                SELECT 1
                FROM jsonb_array_elements(i.nestedinmuebles) AS nested_ni
                WHERE nested_ni->>'direccion' ILIKE pattern
                  AND (zone = '' OR LOWER(nested_ni->>'zona') LIKE LOWER('%' || zone || '%'))
                  AND (responsable_filter = '' OR LOWER(nested_ni->>'responsable') LIKE LOWER('%' || responsable_filter || '%'))
                  AND (
                      (filternoticia IS TRUE AND nested_ni->>'noticiastate' = 'true') 
                      OR (filternoticia IS FALSE AND nested_ni->>'noticiastate' = 'false')
                      OR filternoticia IS NULL
                  )
                  AND (
                      (filterencargo IS TRUE AND nested_ni->>'encargostate' = 'true')
                      OR (filterencargo IS FALSE AND nested_ni->>'encargostate' = 'false')
                      OR filterencargo IS NULL
                  )
                  AND (nested_ni->>'superficie')::int BETWEEN superficiemin AND superficiemax
                  AND (nested_ni->>'ano_construccion')::int BETWEEN yearmin AND yearmax
                  AND (habitaciones_filter IS NULL OR (nested_ni->>'habitaciones')::int = habitaciones_filter)
                  AND (banos_filter IS NULL OR (nested_ni->>'banyos')::int = banos_filter)
                  AND (tipo_filter IS NULL OR (nested_ni->>'tipo')::int = tipo_filter)
                  AND (aireacondicionado_filter IS NULL OR (nested_ni->>'aireacondicionado')::boolean = aireacondicionado_filter)
                  AND (ascensor_filter IS NULL OR (nested_ni->>'ascensor')::boolean = ascensor_filter)
                  AND (garaje_filter IS NULL OR (nested_ni->>'garaje')::boolean = garaje_filter)
                  AND (jardin_filter IS NULL OR (nested_ni->>'jardin')::boolean = jardin_filter)
                  AND (terraza_filter IS NULL OR (nested_ni->>'terraza')::boolean = terraza_filter)
                  AND (trastero_filter IS NULL OR (nested_ni->>'trastero')::boolean = trastero_filter)
            )
            OR 
            -- Match in nestedescaleras -> nestedinmuebles
            EXISTS (
                SELECT 1
                FROM jsonb_array_elements(i.nestedescaleras) AS esc
                JOIN jsonb_array_elements(esc->'nestedinmuebles') AS nested_ni
                  ON TRUE
                WHERE nested_ni->>'direccion' ILIKE pattern
                  AND (zone = '' OR LOWER(nested_ni->>'zona') LIKE LOWER('%' || zone || '%'))
                  AND (responsable_filter = '' OR LOWER(nested_ni->>'responsable') LIKE LOWER('%' || responsable_filter || '%'))
                  AND (
                      (filternoticia IS TRUE AND nested_ni->>'noticiastate' = 'true') 
                      OR (filternoticia IS FALSE AND nested_ni->>'noticiastate' = 'false')
                      OR filternoticia IS NULL
                  )
                  AND (
                      (filterencargo IS TRUE AND nested_ni->>'encargostate' = 'true')
                      OR (filterencargo IS FALSE AND nested_ni->>'encargostate' = 'false')
                      OR filterencargo IS NULL
                  )
                  AND (nested_ni->>'superficie')::int BETWEEN superficiemin AND superficiemax
                  AND (nested_ni->>'ano_construccion')::int BETWEEN yearmin AND yearmax
                  AND (habitaciones_filter IS NULL OR (nested_ni->>'habitaciones')::int = habitaciones_filter)
                  AND (banos_filter IS NULL OR (nested_ni->>'banyos')::int = banos_filter)
                  AND (tipo_filter IS NULL OR (nested_ni->>'tipo')::int = tipo_filter)
                  AND (aireacondicionado_filter IS NULL OR (nested_ni->>'aireacondicionado')::boolean = aireacondicionado_filter)
                  AND (ascensor_filter IS NULL OR (nested_ni->>'ascensor')::boolean = ascensor_filter)
                  AND (garaje_filter IS NULL OR (nested_ni->>'garaje')::boolean = garaje_filter)
                  AND (jardin_filter IS NULL OR (nested_ni->>'jardin')::boolean = jardin_filter)
                  AND (terraza_filter IS NULL OR (nested_ni->>'terraza')::boolean = terraza_filter)
                  AND (trastero_filter IS NULL OR (nested_ni->>'trastero')::boolean = trastero_filter)
            ))
          AND (zone = '' OR LOWER(i.zona) LIKE LOWER('%' || zone || '%'))
          AND (responsable_filter = '' OR LOWER(i.responsable) LIKE LOWER('%' || responsable_filter || '%'))
          AND (
              filternoticia IS NULL 
              OR (filternoticia = TRUE AND i.noticiastate = TRUE) 
              OR (filternoticia = FALSE AND i.noticiastate = FALSE)
          )
          AND (
              filterencargo IS NULL 
              OR (filterencargo = TRUE AND i.encargostate = TRUE) 
              OR (filterencargo = FALSE AND i.encargostate = FALSE)
          )
          AND (
              categoria_filter = '' OR 
              (categoria_filter = 'Sin información' AND i.categoria IS NULL) OR 
              (categoria_filter = 'Vacio' AND i.categoria = 'Vacio') OR 
              (categoria_filter = 'Propietario' AND i.categoria = 'Propietario') OR 
              (categoria_filter = 'Inquilino' AND i.categoria = 'Inquilino') OR 
              (categoria_filter <> 'Sin información' AND categoria_filter <> 'Vacio' AND categoria_filter <> 'Propietario' AND categoria_filter <> 'Inquilino' AND i.categoria = categoria_filter)
          )
          AND (i.superficie)::int BETWEEN superficiemin AND superficiemax
          AND (i.ano_construccion)::int BETWEEN yearmin AND yearmax
          AND (localizado_filter IS NULL OR (localizado_filter = TRUE AND i.localizado = TRUE) OR (localizado_filter = FALSE AND i.localizado = FALSE))
          AND (habitaciones_filter IS NULL OR i.habitaciones = habitaciones_filter)
          AND (banos_filter IS NULL OR i.banyos = banos_filter)
          AND (tipo_filter IS NULL OR i.tipoagrupacion::int = tipo_filter)
          AND (aireacondicionado_filter IS NULL OR i.aireacondicionado = aireacondicionado_filter)
          AND (ascensor_filter IS NULL OR i.ascensor = ascensor_filter)
          AND (garaje_filter IS NULL OR i.garaje = garaje_filter)
          AND (jardin_filter IS NULL OR i.jardin = jardin_filter)
          AND (terraza_filter IS NULL OR i.terraza = terraza_filter)
          AND (trastero_filter IS NULL OR i.trastero = trastero_filter)
    ),
    responsables_counts AS (
        SELECT ar.responsable, COUNT(*) AS count FROM (
            SELECT i.responsable FROM filtered_inmuebles i
            UNION ALL
            SELECT (nested_ni->>'responsable')::text AS responsable
            FROM filtered_inmuebles i, jsonb_array_elements(i.nestedinmuebles) AS nested_ni
            UNION ALL
            SELECT (nested_ni->>'responsable')::text AS responsable
            FROM filtered_inmuebles i, jsonb_array_elements(i.nestedescaleras) AS esc,
            jsonb_array_elements(esc->'nestedinmuebles') AS nested_ni
        ) AS ar
        GROUP BY ar.responsable
    ),
    categorias_counts AS (
        SELECT ac.categoria, COUNT(*) AS count FROM (
            SELECT i.categoria FROM filtered_inmuebles i
            UNION ALL
            SELECT (nested_ni->>'categoria')::text AS categoria
            FROM filtered_inmuebles i, jsonb_array_elements(i.nestedinmuebles) AS nested_ni
            UNION ALL
            SELECT (nested_ni->>'categoria')::text AS categoria
            FROM filtered_inmuebles i, jsonb_array_elements(i.nestedescaleras) AS esc,
            jsonb_array_elements(esc->'nestedinmuebles') AS nested_ni
        ) AS ac
        GROUP BY ac.categoria
    ),
    zonas_counts AS (
        SELECT az.zona, COUNT(*) AS count FROM (
            SELECT i.zona FROM filtered_inmuebles i
            UNION ALL
            SELECT (nested_ni->>'zona')::text AS zona
            FROM filtered_inmuebles i, jsonb_array_elements(i.nestedinmuebles) AS nested_ni
            UNION ALL
            SELECT (nested_ni->>'zona')::text AS zona
            FROM filtered_inmuebles i, jsonb_array_elements(i.nestedescaleras) AS esc,
            jsonb_array_elements(esc->'nestedinmuebles') AS nested_ni
        ) AS az
        GROUP BY az.zona
    ),
    noticias_counts AS (
        SELECT COUNT(*) AS count FROM (
            SELECT i.noticiastate FROM filtered_inmuebles i WHERE i.noticiastate = true
            UNION ALL
            SELECT (nested_ni->>'noticiastate')::boolean
            FROM filtered_inmuebles i, jsonb_array_elements(i.nestedinmuebles) AS nested_ni
            WHERE (nested_ni->>'noticiastate')::boolean = true
            UNION ALL
            SELECT (nested_ni->>'noticiastate')::boolean
            FROM filtered_inmuebles i, jsonb_array_elements(i.nestedescaleras) AS esc,
            jsonb_array_elements(esc->'nestedinmuebles') AS nested_ni
            WHERE (nested_ni->>'noticiastate')::boolean = true
        ) AS an
    ),
    encargos_counts AS (
        SELECT COUNT(*) AS count FROM (
            SELECT i.encargostate FROM filtered_inmuebles i WHERE i.encargostate = true
            UNION ALL
            SELECT (nested_ni->>'encargostate')::boolean
            FROM filtered_inmuebles i, jsonb_array_elements(i.nestedinmuebles) AS nested_ni
            WHERE (nested_ni->>'encargostate')::boolean = true
            UNION ALL
            SELECT (nested_ni->>'encargostate')::boolean
            FROM filtered_inmuebles i, jsonb_array_elements(i.nestedescaleras) AS esc,
            jsonb_array_elements(esc->'nestedinmuebles') AS nested_ni
            WHERE (nested_ni->>'encargostate')::boolean = true
        ) AS ae
    ),
    localizados_counts AS (
        SELECT COUNT(*) AS count FROM (
            SELECT i.localizado FROM filtered_inmuebles i WHERE i.localizado = true
            UNION ALL
            SELECT (nested_ni->>'localizado')::boolean
            FROM filtered_inmuebles i, jsonb_array_elements(i.nestedinmuebles) AS nested_ni
            WHERE (nested_ni->>'localizado')::boolean = true
            UNION ALL
            SELECT (nested_ni->>'localizado')::boolean
            FROM filtered_inmuebles i, jsonb_array_elements(i.nestedescaleras) AS esc,
            jsonb_array_elements(esc->'nestedinmuebles') AS nested_ni
            WHERE (nested_ni->>'localizado')::boolean = true
        ) AS al
    )
    SELECT 
        fi.id,
        fi.direccion,
        fi.tipo,
        fi.uso,
        fi.superficie,
        fi.ano_construccion,
        fi.categoria,
        fi.potencialadquisicion,
        fi.noticiastate,
        fi.responsable,
        fi.encargostate,
        fi.coordinates,
        fi.zona,
        fi.date_time,
        fi.inmuebleimages,
        fi.location,
        fi.habitaciones,
        fi.garaje,
        fi.descripcion,
        fi.ascensor,
        fi.banyos,
        fi.trastero,
        fi.jardin,
        fi.terraza,
        fi.aireacondicionado,
        fi.tipoagrupacion,
        fi.localizado,
        fi.nestedescaleras,
        fi.nestedinmuebles,
        fi.total_count,
        (SELECT jsonb_agg(jsonb_build_object('responsable', rc.responsable, 'count', rc.count)) FROM responsables_counts rc) AS responsables_count,
        (SELECT jsonb_agg(jsonb_build_object('categoria', cc.categoria, 'count', cc.count)) FROM categorias_counts cc) AS categorias_count,
        (SELECT jsonb_agg(jsonb_build_object('zona', zc.zona, 'count', zc.count)) FROM zonas_counts zc) AS zonas_count,
        (SELECT nc.count FROM noticias_counts nc) AS noticias_count,
        (SELECT ec.count FROM encargos_counts ec) AS encargos_count,
        (SELECT lc.count FROM localizados_counts lc) AS localizados_count
    FROM filtered_inmuebles fi
    ORDER BY fi.direccion ASC
    LIMIT itemsperpage OFFSET (page - 1) * itemsperpage;
END;
$function$;