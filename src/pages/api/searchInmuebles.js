import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    try {
        console.time("Fetch Duration");

        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        const { pattern = '', currentPage = 1, itemsPerPage = 10, selectedZone = '', selectedCategoria = '', selectedResponsable = '', filterNoticia = null, filterEncargo = null, superficieMin = 0, superficieMax = 20000, yearMin = 1800, yearMax = new Date().getFullYear(), localizado = null, garaje = null, aireacondicionado = null, ascensor = null, trastero = null, jardin = null, terraza = null, tipo, banos, habitaciones } = req.query;

        const page = parseInt(currentPage, 10);
        const limit = parseInt(itemsPerPage, 10);
        const skip = (page - 1) * limit;

        // Construir el objeto de consulta para coincidir con el patrón en los campos deseados
        const query = {
            $or: [
                { direccion: { $regex: pattern, $options: 'i' } },
                { nestedinmuebles: { $elemMatch: { direccion: { $regex: pattern, $options: 'i' } } } },
                { 'nestedescaleras.nestedinmuebles': { $elemMatch: { direccion: { $regex: pattern, $options: 'i' } } } }
            ],
            $and: [
                { ano_construccion: { $gte: parseInt(yearMin, 10), $lte: parseInt(yearMax, 10) } },
                // Filtro para zona
                ...(selectedZone !== '' ? [{ zona: selectedZone }] : []),

                // Filtro para responsable
                ...(selectedResponsable !== '' ? [{ responsable: selectedResponsable }] : []),

                // Filtro para noticiastate
                ...(filterNoticia !== null ? [{ $or: [{ noticiastate: filterNoticia === 'true' ? true : false }, { noticiastate: { $exists: false } }] }] : []),

                // Filtro para encargostate
                ...(filterEncargo !== null ? [{ $or: [{ encargostate: filterEncargo === 'true' ? true : false }, { encargostate: { $exists: false } }] }] : []),

                // // Filtro para superficie
                ...(superficieMin !== null && superficieMax !== null ? [{ $or: [{ superficie: { $gte: parseInt(superficieMin, 10), $lte: parseInt(superficieMax, 10) } }, { superficie: { $exists: false } }] }] : []),

                // // Filtro para categoria
                ...(selectedCategoria !== '' ? [{ $or: [{ categoria: selectedCategoria === null ? { $exists: false } : selectedCategoria }, { categoria: { $exists: false } }] }] : []),

                // // // Filtro para localizado
                ...(localizado !== null ? [{ $or: [{ localizado: localizado === 'true' ? true : false }, { localizado: { $exists: false } }] }] : []),

                // // // Filtro para aireacondicionado
                ...(aireacondicionado !== 'undefined' ? [{ $or: [{ aireacondicionado: aireacondicionado === 'true' ? true : false }, { aireacondicionado: { $exists: false } }] }] : []),

                // // Filtro para ascensor
                ...(ascensor !== 'undefined' ? [{ $or: [{ ascensor: ascensor === 'true' ? true : false }, { ascensor: { $exists: false } }] }] : []),

                // // Filtro para garaje
                ...(garaje !== 'undefined' ? [{ $or: [{ garaje: garaje === 'true' ? true : false }, { garaje: { $exists: false } }] }] : []),

                // // Filtro para trastero
                ...(trastero !== 'undefined' ? [{ $or: [{ trastero: trastero === 'true' ? true : false }, { trastero: { $exists: false } }] }] : []),

                // // Filtro para terraza
                ...(terraza !== 'undefined' ? [{ $or: [{ terraza: terraza === 'true' ? true : false }, { terraza: { $exists: false } }] }] : []),

                // // Filtro para jardin
                ...(jardin !== 'undefined' ? [{ $or: [{ jardin: jardin === 'true' ? true : false }, { jardin: { $exists: false } }] }] : []),

                // // Filtro para tipoagrupacion
                ...(tipo !== 'undefined' ? [{ tipoagrupacion: parseInt(tipo, 10) }] : []),

                // // Filtro para habitaciones
                ...(habitaciones !== 'undefined' ? [{ $or: [{ habitaciones: parseInt(habitaciones, 10) }, { habitaciones: { $exists: false } }] }] : []),

                // // Filtro para banyos
                ...(banos !== 'undefined' ? [{ $or: [{ banyos: parseInt(banos, 10) }, { banyos: { $exists: false } }] }] : []),
            ]
        };

        // Projection to include all fields and filter matching nestedinmuebles
        const projection = {
            _id: 1,
            id: 1,
            direccion: 1,
            tipo: 1,
            uso: 1,
            superficie: 1,
            ano_construccion: 1,
            categoria: 1,
            potencialadquisicion: 1,
            noticiastate: 1,
            responsable: 1,
            encargostate: 1,
            coordinates: 1,
            zona: 1,
            date_time: 1,
            inmuebleimages: 1,
            location: 1,
            habitaciones: 1,
            garaje: 1,
            descripcion: 1,
            ascensor: 1,
            banyos: 1,
            trastero: 1,
            jardin: 1,
            terraza: 1,
            aireacondicionado: 1,
            tipoagrupacion: 1,
            localizado: 1,
            localizado_phone: 1,
            nestedinmuebles: 1,
            nestedescaleras: 1
        };

        // Count the total number of matching documents˘
        const totalCount = await db.collection('inmuebles').countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);


        // Query the 'inmuebles' collection to find matching documents, ordered by 'direccion' asc, with pagination
        const results = await db.collection('inmuebles')
            .find(query)
            .project(projection)
            .sort({ direccion: 1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const finalResults = results.map(result => {
            const applyNoticiaFilter = (inmueble) => {
                if (filterNoticia !== null) {
                    // Si filterNoticia es 'true', se comparará con inmuebles que tienen noticiastate como true
                    if (filterNoticia === 'true') {
                        return inmueble.noticiastate === true;
                    }
                    // Si filterNoticia es 'false', se comparará con inmuebles que tienen noticiastate como false
                    if (filterNoticia === 'false') {
                        return inmueble.noticiastate === false;
                    }
                }
                // Si filterNoticia es null, no se aplica el filtro y todos los inmuebles pasan
                return true;
            };


            const applyEncargoFilter = (inmueble) => {
                if (filterEncargo !== null) {
                    // Si filterEncargo es 'true', se comparará con inmuebles que tengan encargo
                    if (filterEncargo === 'true') {
                        return inmueble.encargostate === true;
                    }
                    // Si filterEncargo es 'false', se comparará con inmuebles que no tengan encargo
                    if (filterEncargo === 'false') {
                        return inmueble.encargostate === false;
                    }
                }
                // Si filterEncargo es null, no se aplica el filtro y todos los inmuebles pasan
                return true;
            };

            const applyCategoriaFilter = (inmueble) => {
                if (selectedCategoria === '') {
                    return true;
                } else if (selectedCategoria === null) {
                    return inmueble.categoria === null;
                } else {
                    return inmueble.categoria === selectedCategoria;
                }
            };

            const applyZoneFilter = (inmueble) => {
                if (selectedZone === '') {
                    return true;
                } else {
                    return inmueble.zona === selectedZone;
                }
            };

            const applyResponsableFilter = (inmueble) => {
                if (selectedResponsable === '') {
                    return true;
                } else {
                    return inmueble.responsable === selectedResponsable;
                }
            };

            const applyLocalizadoFilter = (inmueble) => {
                if (localizado !== null) {
                    if (localizado === 'true') {
                        return inmueble.localizado === true;
                    }
                    if (localizado === 'false') {
                        return inmueble.localizado === false;
                    }
                }
                return true;
            };

            const applySuperficieFilter = (inmueble) => {
                if (superficieMin === null && superficieMax === null) {
                    return true;
                } else {
                    const min = parseInt(superficieMin, 10);
                    const max = parseInt(superficieMax, 10);
                    return inmueble.superficie >= min && inmueble.superficie <= max;
                }
            };

            const applyAireAcondicionadoFilter = (inmueble) => {
                if (aireacondicionado === 'undefined') {
                    return true;
                } else if (aireacondicionado === 'true') {
                    return inmueble.aireacondicionado === true;
                } else if (aireacondicionado === 'false') {
                    return inmueble.aireacondicionado === false;
                }
            };

            const applyAscensorFilter = (inmueble) => {
                if (ascensor === 'undefined') {
                    return true;
                } else if (ascensor === 'true') {
                    return inmueble.ascensor === true;
                } else if (ascensor === 'false') {
                    return inmueble.ascensor === false;
                }
            };

            const applyGarajeFilter = (inmueble) => {
                if (garaje === 'undefined') {
                    return true;
                } else if (garaje === 'true') {
                    return inmueble.garaje === true;
                } else if (garaje === 'false') {
                    return inmueble.garaje === false;
                }
            };

            const applyTrasteroFilter = (inmueble) => {
                if (trastero === 'undefined') {
                    return true;
                } else if (trastero === 'true') {
                    return inmueble.trastero === true;
                } else if (trastero === 'false') {
                    return inmueble.trastero === false;
                }
            };

            const applyTerrazaFilter = (inmueble) => {
                if (terraza === 'undefined') {
                    return true;
                } else if (terraza === 'true') {
                    return inmueble.terraza === true;
                } else if (terraza === 'false') {
                    return inmueble.terraza === false;
                }
            };

            const applyJardinFilter = (inmueble) => {
                if (jardin === 'undefined') {
                    return true;
                } else if (jardin === 'true') {
                    return inmueble.jardin === true;
                } else if (jardin === 'false') {
                    return inmueble.jardin === false;
                }
            };

            const applyTipoAgrupacionFilter = (inmueble) => {
                if (tipo === 'undefined') {
                    return true;
                } else {
                    return inmueble.tipoagrupacion === parseInt(tipo, 10);
                }
            };

            const applyBanosFilter = (inmueble) => {
                if (banos === 'undefined') {
                    return true;
                } else {
                    return inmueble.banyos === parseInt(banos, 10);
                }
            };

            const applyHabitacionesFilter = (inmueble) => {
                if (habitaciones !== 'undefined') {
                    return inmueble.habitaciones === parseInt(habitaciones, 10);
                } else {
                    return true;
                }
            };

            const applyFilters = (inmueble) => {
                return applyHabitacionesFilter(inmueble) && applyBanosFilter(inmueble) &&
                    applyNoticiaFilter(inmueble) && applyEncargoFilter(inmueble) && applyCategoriaFilter(inmueble) && applyZoneFilter(inmueble) && applyResponsableFilter(inmueble) && applyLocalizadoFilter(inmueble) && applySuperficieFilter(inmueble)
                    && applyAireAcondicionadoFilter(inmueble) && applyAscensorFilter(inmueble) && applyGarajeFilter(inmueble) && applyTrasteroFilter(inmueble) && applyTerrazaFilter(inmueble) && applyJardinFilter(inmueble) && applyTipoAgrupacionFilter(inmueble);
            };


            if (result.tipoagrupacion === 2 && new RegExp(pattern, 'i').test(result.direccion)) {
                return {
                    ...result,
                    nestedinmuebles: Array.isArray(result.nestedinmuebles) ? result.nestedinmuebles.filter(applyFilters) : result.nestedinmuebles,
                    nestedescaleras: Array.isArray(result.nestedescaleras) ? result.nestedescaleras.map(escalera => ({
                        ...escalera,
                        nestedinmuebles: Array.isArray(escalera.nestedinmuebles) ? escalera.nestedinmuebles.filter(applyFilters) : escalera.nestedinmuebles
                    })) : result.nestedescaleras
                };
            }

            const nestedInmueblesMatch = Array.isArray(result.nestedinmuebles) && result.nestedinmuebles.some(inmueble => new RegExp(pattern, 'i').test(inmueble.direccion));
            const nestedEscalerasMatch = Array.isArray(result.nestedescaleras) && result.nestedescaleras.some(escalera => new RegExp(pattern, 'i').test(escalera.direccion) || (Array.isArray(escalera.nestedinmuebles) && escalera.nestedinmuebles.some(inmueble => new RegExp(pattern, 'i').test(inmueble.direccion))));

            if (nestedInmueblesMatch && !nestedEscalerasMatch) {
                return {
                    ...result,
                    nestedinmuebles: result.nestedinmuebles.filter(applyFilters),
                    nestedescaleras: []
                };
            }

            if (nestedEscalerasMatch && !nestedInmueblesMatch) {
                return {
                    ...result,
                    nestedinmuebles: [],
                    nestedescaleras: result.nestedescaleras.map(escalera => ({
                        ...escalera,
                        nestedinmuebles: Array.isArray(escalera.nestedinmuebles) ? escalera.nestedinmuebles.filter(applyFilters) : escalera.nestedinmuebles
                    })).filter(escalera => new RegExp(pattern, 'i').test(escalera.direccion) || escalera.nestedinmuebles.length > 0)
                };
            }

            return {
                ...result,
                nestedinmuebles: Array.isArray(result.nestedinmuebles) ? result.nestedinmuebles.filter(applyFilters) : result.nestedinmuebles,
                nestedescaleras: Array.isArray(result.nestedescaleras) ? result.nestedescaleras.map(escalera => ({
                    ...escalera,
                    nestedinmuebles: Array.isArray(escalera.nestedinmuebles) ? escalera.nestedinmuebles.filter(applyFilters) : escalera.nestedinmuebles
                })) : result.nestedescaleras
            };
        });


        // Construir el objeto de consulta común
        const baseQuery = {
            $and: [
                { ano_construccion: { $gte: parseInt(yearMin, 10), $lte: parseInt(yearMax, 10) } },
                ...(selectedZone !== '' ? [{ zona: selectedZone }] : []),
                ...(selectedResponsable !== '' ? [{ responsable: selectedResponsable }] : []),
                ...(filterNoticia !== null ? [{ $or: [{ noticiastate: filterNoticia === 'true' ? true : false }, { noticiastate: { $exists: false } }] }] : []),
                ...(filterEncargo !== null ? [{ $or: [{ encargostate: filterEncargo === 'true' ? true : false }, { encargostate: { $exists: false } }] }] : []),
                ...(superficieMin !== null && superficieMax !== null ? [{ $or: [{ superficie: { $gte: parseInt(superficieMin, 10), $lte: parseInt(superficieMax, 10) } }, { superficie: { $exists: false } }] }] : []),
                ...(selectedCategoria !== '' ? [{ $or: [{ categoria: selectedCategoria === null ? { $exists: false } : selectedCategoria }, { categoria: { $exists: false } }] }] : []),
                ...(localizado !== null ? [{ $or: [{ localizado: localizado === 'true' ? true : false }, { localizado: { $exists: false } }] }] : []),
                ...(aireacondicionado !== 'undefined' ? [{ $or: [{ aireacondicionado: aireacondicionado === 'true' ? true : false }, { aireacondicionado: { $exists: false } }] }] : []),
                ...(ascensor !== 'undefined' ? [{ $or: [{ ascensor: ascensor === 'true' ? true : false }, { ascensor: { $exists: false } }] }] : []),
                ...(garaje !== 'undefined' ? [{ $or: [{ garaje: garaje === 'true' ? true : false }, { garaje: { $exists: false } }] }] : []),
                ...(trastero !== 'undefined' ? [{ $or: [{ trastero: trastero === 'true' ? true : false }, { trastero: { $exists: false } }] }] : []),
                ...(terraza !== 'undefined' ? [{ $or: [{ terraza: terraza === 'true' ? true : false }, { terraza: { $exists: false } }] }] : []),
                ...(jardin !== 'undefined' ? [{ $or: [{ jardin: jardin === 'true' ? true : false }, { jardin: { $exists: false } }] }] : []),
                ...(tipo !== 'undefined' ? [{ tipoagrupacion: parseInt(tipo, 10) }] : []),
                ...(habitaciones !== 'undefined' ? [{ $or: [{ habitaciones: parseInt(habitaciones, 10) }, { habitaciones: { $exists: false } }] }] : []),
                ...(banos !== 'undefined' ? [{ $or: [{ banyos: parseInt(banos, 10) }, { banyos: { $exists: false } }] }] : []),
            ]
        };

        // Agregación para documentos tipoagrupacion = 1 en la colección principal
        const aggregation1 = [
            { $match: { ...baseQuery, tipoagrupacion: 1, direccion: { $regex: pattern, $options: 'i' } } },
            {
                $group: {
                    _id: null,
                    totalTipoAgrupacionCount: { $sum: 1 },
                    responsablesCount: { $sum: { $cond: [{ $ifNull: ["$responsable", false] }, 1, 0] } },
                    categoriasCount: { $sum: { $cond: [{ $ifNull: ["$categoria", false] }, 1, 0] } },
                    localizadosCountTrue: { $sum: { $cond: [{ $eq: ["$localizado", true] }, 1, 0] } },
                    localizadosCountFalse: { $sum: { $cond: [{ $eq: ["$localizado", false] }, 1, 0] } },
                    noticiasCountTrue: { $sum: { $cond: [{ $eq: ["$noticiastate", true] }, 1, 0] } },
                    noticiasCountFalse: { $sum: { $cond: [{ $eq: ["$noticiastate", false] }, 1, 0] } },
                    encargosCountTrue: { $sum: { $cond: [{ $eq: ["$encargostate", true] }, 1, 0] } },
                    encargosCountFalse: { $sum: { $cond: [{ $eq: ["$encargostate", false] }, 1, 0] } },
                    zonasCount: { $sum: { $cond: [{ $ifNull: ["$zona", false] }, 1, 0] } }
                }
            }
        ];

        const aggregation = [
            {
                $facet: {
                    countNestedInmuebles: [
                        {
                            $match: {
                                tipoagrupacion: 2,
                                direccion: { $regex: pattern, $options: 'i' }
                            }
                        },
                        {
                            $project: {
                                countInNestedInmuebles: {
                                    $size: {
                                        $filter: {
                                            input: "$nestedinmuebles",
                                            as: "inmueble",
                                            cond: {
                                                $and: [
                                                    { $eq: ["$$inmueble.tipoagrupacion", 1] },
                                                    { $gte: ["$$inmueble.ano_construccion", parseInt(yearMin, 10)] },
                                                    { $lte: ["$$inmueble.ano_construccion", parseInt(yearMax, 10)] },
                                                    ...(selectedZone !== '' ? [{ $eq: ["$$inmueble.zona", selectedZone] }] : []),
                                                    ...(selectedResponsable !== '' ? [{ $eq: ["$$inmueble.responsable", selectedResponsable] }] : []),
                                                    ...(filterNoticia !== null ? [{ $or: [{ $eq: ["$$inmueble.noticiastate", filterNoticia === 'true'] }, { $not: ["$$inmueble.noticiastate"] }] }] : []),
                                                    ...(filterEncargo !== null ? [{ $or: [{ $eq: ["$$inmueble.encargostate", filterEncargo === 'true'] }, { $not: ["$$inmueble.encargostate"] }] }] : []),
                                                    ...(superficieMin !== null && superficieMax !== null ? [{ $or: [{ $and: [{ $gte: ["$$inmueble.superficie", parseInt(superficieMin, 10)] }, { $lte: ["$$inmueble.superficie", parseInt(superficieMax, 10)] }] }, { $not: ["$$inmueble.superficie"] }] }] : []),
                                                    ...(selectedCategoria !== '' ? [{ $or: [{ $eq: ["$$inmueble.categoria", selectedCategoria] }, { $not: ["$$inmueble.categoria"] }] }] : []),
                                                    ...(localizado !== null ? [{ $or: [{ $eq: ["$$inmueble.localizado", localizado === 'true'] }, { $not: ["$$inmueble.localizado"] }] }] : []),
                                                    ...(aireacondicionado !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.aireacondicionado", aireacondicionado === 'true'] }, { $not: ["$$inmueble.aireacondicionado"] }] }] : []),
                                                    ...(ascensor !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.ascensor", ascensor === 'true'] }, { $not: ["$$inmueble.ascensor"] }] }] : []),
                                                    ...(garaje !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.garaje", garaje === 'true'] }, { $not: ["$$inmueble.garaje"] }] }] : []),
                                                    ...(trastero !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.trastero", trastero === 'true'] }, { $not: ["$$inmueble.trastero"] }] }] : []),
                                                    ...(terraza !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.terraza", terraza === 'true'] }, { $not: ["$$inmueble.terraza"] }] }] : []),
                                                    ...(jardin !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.jardin", jardin === 'true'] }, { $not: ["$$inmueble.jardin"] }] }] : []),
                                                    ...(tipo !== 'undefined' ? [{ $eq: ["$$inmueble.tipoagrupacion", parseInt(tipo, 10)] }] : []),
                                                    ...(habitaciones !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.habitaciones", parseInt(habitaciones, 10)] }, { $not: ["$$inmueble.habitaciones"] }] }] : []),
                                                    ...(banos !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.banyos", parseInt(banos, 10)] }, { $not: ["$$inmueble.banyos"] }] }] : [])
                                                ]
                                            }
                                        }
                                    }
                                },
                                countInNestedEscaleras: {
                                    $sum: {
                                        $map: {
                                            input: "$nestedescaleras",
                                            as: "escalera",
                                            in: {
                                                $size: {
                                                    $filter: {
                                                        input: "$$escalera.nestedinmuebles",
                                                        as: "inmueble",
                                                        cond: {
                                                            $and: [
                                                                { $eq: ["$$inmueble.tipoagrupacion", 1] },
                                                                { $gte: ["$$inmueble.ano_construccion", parseInt(yearMin, 10)] },
                                                                { $lte: ["$$inmueble.ano_construccion", parseInt(yearMax, 10)] },
                                                                ...(selectedZone !== '' ? [{ $eq: ["$$inmueble.zona", selectedZone] }] : []),
                                                                ...(selectedResponsable !== '' ? [{ $eq: ["$$inmueble.responsable", selectedResponsable] }] : []),
                                                                ...(filterNoticia !== null ? [{ $or: [{ $eq: ["$$inmueble.noticiastate", filterNoticia === 'true'] }, { $not: ["$$inmueble.noticiastate"] }] }] : []),
                                                                ...(filterEncargo !== null ? [{ $or: [{ $eq: ["$$inmueble.encargostate", filterEncargo === 'true'] }, { $not: ["$$inmueble.encargostate"] }] }] : []),
                                                                ...(superficieMin !== null && superficieMax !== null ? [{ $or: [{ $and: [{ $gte: ["$$inmueble.superficie", parseInt(superficieMin, 10)] }, { $lte: ["$$inmueble.superficie", parseInt(superficieMax, 10)] }] }, { $not: ["$$inmueble.superficie"] }] }] : []),
                                                                ...(selectedCategoria !== '' ? [{ $or: [{ $eq: ["$$inmueble.categoria", selectedCategoria] }, { $not: ["$$inmueble.categoria"] }] }] : []),
                                                                ...(localizado !== null ? [{ $or: [{ $eq: ["$$inmueble.localizado", localizado === 'true'] }, { $not: ["$$inmueble.localizado"] }] }] : []),
                                                                ...(aireacondicionado !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.aireacondicionado", aireacondicionado === 'true'] }, { $not: ["$$inmueble.aireacondicionado"] }] }] : []),
                                                                ...(ascensor !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.ascensor", ascensor === 'true'] }, { $not: ["$$inmueble.ascensor"] }] }] : []),
                                                                ...(garaje !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.garaje", garaje === 'true'] }, { $not: ["$$inmueble.garaje"] }] }] : []),
                                                                ...(trastero !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.trastero", trastero === 'true'] }, { $not: ["$$inmueble.trastero"] }] }] : []),
                                                                ...(terraza !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.terraza", terraza === 'true'] }, { $not: ["$$inmueble.terraza"] }] }] : []),
                                                                ...(jardin !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.jardin", jardin === 'true'] }, { $not: ["$$inmueble.jardin"] }] }] : []),
                                                                ...(tipo !== 'undefined' ? [{ $eq: ["$$inmueble.tipoagrupacion", parseInt(tipo, 10)] }] : []),
                                                                ...(habitaciones !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.habitaciones", parseInt(habitaciones, 10)] }, { $not: ["$$inmueble.habitaciones"] }] }] : []),
                                                                ...(banos !== 'undefined' ? [{ $or: [{ $eq: ["$$inmueble.banyos", parseInt(banos, 10)] }, { $not: ["$$inmueble.banyos"] }] }] : [])
                                                            ]
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalCount: { $sum: { $add: ["$countInNestedInmuebles", "$countInNestedEscaleras"] } }
                            }
                        }
                    ],
                    countTipoAgrupacion1: [
                        {
                            $match: {
                                tipoagrupacion: 1,
                                direccion: { $regex: pattern, $options: 'i' },
                                ano_construccion: { $gte: parseInt(yearMin, 10), $lte: parseInt(yearMax, 10) },
                                ...(selectedZone !== '' ? { zona: selectedZone } : {}),
                                ...(selectedResponsable !== '' ? { responsable: selectedResponsable } : {}),
                                ...(filterNoticia !== null ? { $or: [{ noticiastate: filterNoticia === 'true' }, { noticiastate: { $exists: false } }] } : {}),
                                ...(filterEncargo !== null ? { $or: [{ encargostate: filterEncargo === 'true' }, { encargostate: { $exists: false } }] } : {}),
                                ...(superficieMin !== null && superficieMax !== null ? { $or: [{ superficie: { $gte: parseInt(superficieMin, 10), $lte: parseInt(superficieMax, 10) } }, { superficie: { $exists: false } }] } : {}),
                                ...(selectedCategoria !== '' ? { $or: [{ categoria: selectedCategoria }, { categoria: { $exists: false } }] } : {}),
                                ...(localizado !== null ? { $or: [{ localizado: localizado === 'true' }, { localizado: { $exists: false } }] } : {}),
                                ...(aireacondicionado !== 'undefined' ? { $or: [{ aireacondicionado: aireacondicionado === 'true' }, { aireacondicionado: { $exists: false } }] } : {}),
                                ...(ascensor !== 'undefined' ? { $or: [{ ascensor: ascensor === 'true' }, { ascensor: { $exists: false } }] } : {}),
                                ...(garaje !== 'undefined' ? { $or: [{ garaje: garaje === 'true' }, { garaje: { $exists: false } }] } : {}),
                                ...(trastero !== 'undefined' ? { $or: [{ trastero: trastero === 'true' }, { trastero: { $exists: false } }] } : {}),
                                ...(terraza !== 'undefined' ? { $or: [{ terraza: terraza === 'true' }, { terraza: { $exists: false } }] } : {}),
                                ...(jardin !== 'undefined' ? { $or: [{ jardin: jardin === 'true' }, { jardin: { $exists: false } }] } : {}),
                                ...(tipo !== 'undefined' ? { tipoagrupacion: parseInt(tipo, 10) } : {}),
                                ...(habitaciones !== 'undefined' ? { $or: [{ habitaciones: parseInt(habitaciones, 10) }, { habitaciones: { $exists: false } }] } : {}),
                                ...(banos !== 'undefined' ? { $or: [{ banyos: parseInt(banos, 10) }, { banyos: { $exists: false } }] } : {})
                            }
                        },
                        {
                            $count: "totalCount"
                        }
                    ]
                }
            },
            {
                $project: {
                    totalInmuebles: {
                        $sum: [
                            { $arrayElemAt: ["$countNestedInmuebles.totalCount", 0] },
                            { $arrayElemAt: ["$countTipoAgrupacion1.totalCount", 0] }
                        ]
                    }
                }
            }
        ];

        const result = await db.collection('inmuebles').aggregate(aggregation).toArray();

        if (result.length > 0) {
            console.log('Total Inmuebles:', result[0].totalInmuebles);
        }




        // // Consolidar resultados
        // const totalResult = {
        //     totalTipoAgrupacionCount: (result1[0]?.totalTipoAgrupacionCount || 0) + (result2[0]?.totalTipoAgrupacionCount || 0) + (result3[0]?.totalTipoAgrupacionCount || 0),
        //     responsablesCount: (result1[0]?.responsablesCount || 0) + (result2[0]?.responsablesCount || 0) + (result3[0]?.responsablesCount || 0),
        //     categoriasCount: (result1[0]?.categoriasCount || 0) + (result2[0]?.categoriasCount || 0) + (result3[0]?.categoriasCount || 0),
        //     localizadosCount: {
        //         true: (result1[0]?.localizadosCountTrue || 0) + (result2[0]?.localizadosCountTrue || 0) + (result3[0]?.localizadosCountTrue || 0),
        //         false: (result1[0]?.localizadosCountFalse || 0) + (result2[0]?.localizadosCountFalse || 0) + (result3[0]?.localizadosCountFalse || 0)
        //     },
        //     noticiasCount: {
        //         true: (result1[0]?.noticiasCountTrue || 0) + (result2[0]?.noticiasCountTrue || 0) + (result3[0]?.noticiasCountTrue || 0),
        //         false: (result1[0]?.noticiasCountFalse || 0) + (result2[0]?.noticiasCountFalse || 0) + (result3[0]?.noticiasCountFalse || 0)
        //     },
        //     encargosCount: {
        //         true: (result1[0]?.encargosCountTrue || 0) + (result2[0]?.encargosCountTrue || 0) + (result3[0]?.encargosCountTrue || 0),
        //         false: (result1[0]?.encargosCountFalse || 0) + (result2[0]?.encargosCountFalse || 0) + (result3[0]?.encargosCountFalse || 0)
        //     },
        //     zonasCount: (result1[0]?.zonasCount || 0) + (result2[0]?.zonasCount || 0) + (result3[0]?.zonasCount || 0)
        // };



        console.timeEnd("Fetch Duration");

        res.status(200).json({ totalPages, currentPage: page, results: finalResults });
    } catch (e) {
        console.error('API Error:', e.message, e.stack);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}