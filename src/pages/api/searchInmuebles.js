import clientPromise from '../../lib/mongodb';
import { getFilteredCategoriesAndResponsiblesByAddress } from "./calculate_analytics";

export default async function handler(req, res) {
    try {
        console.time("Fetch Duration");

        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name
        const inmuebles = db.collection('inmuebles');

        const { pattern = '', currentPage = 1, itemsPerPage = 10, selectedZone = '', selectedCategoria = '', selectedResponsable = '', filterNoticia = null, filterEncargo = null, superficieMin = 0, superficieMax = 800000, yearMin = 1800, yearMax = new Date().getFullYear(), localizado = null, garaje = null, aireacondicionado = null, ascensor = null, trastero = null, jardin = null, terraza = null, tipo, banos, habitaciones } = req.query;
        console.log('garaje', garaje);
        console.log('typeof garaje', typeof garaje);
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
                ...(selectedResponsable !== '' ? [{ $or: [{ responsable: selectedResponsable }, { responsable: { $exists: false } }] }] : []),

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

        // Run the aggregation pipeline
        const result = await db.collection('inmuebles').aggregate([
            { $match: { 'direccion': { $regex: pattern, $options: 'i' } } },
            { $addFields: { topLevelCategoria: "$categoria", topLevelResponsable: "$responsable" } },
            { $unwind: { path: "$nestedinmuebles", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$nestedescaleras", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$nestedescaleras.nestedinmuebles", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    noticiastate: {
                        $cond: {
                            if: { $ifNull: ["$nestedescaleras.nestedinmuebles.noticiastate", false] },
                            then: "$nestedescaleras.nestedinmuebles.noticiastate",
                            else: {
                                $cond: {
                                    if: { $ifNull: ["$nestedinmuebles.noticiastate", false] },
                                    then: "$nestedinmuebles.noticiastate",
                                    else: "$noticiastate"
                                }
                            }
                        }
                    },
                    encargostate: {
                        $cond: {
                            if: { $ifNull: ["$nestedescaleras.nestedinmuebles.encargostate", false] },
                            then: "$nestedescaleras.nestedinmuebles.encargostate",
                            else: {
                                $cond: {
                                    if: { $ifNull: ["$nestedinmuebles.encargostate", false] },
                                    then: "$nestedinmuebles.encargostate",
                                    else: "$encargostate"
                                }
                            }
                        }
                    },
                    localizado: {
                        $cond: {
                            if: { $ifNull: ["$nestedescaleras.nestedinmuebles.localizado", false] },
                            then: "$nestedescaleras.nestedinmuebles.localizado",
                            else: {
                                $cond: {
                                    if: { $ifNull: ["$nestedinmuebles.localizado", false] },
                                    then: "$nestedinmuebles.localizado",
                                    else: "$localizado"
                                }
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                {
                                    tipoagrupacion: 1,
                                    ...(selectedZone !== '' ? { zona: selectedZone } : {}),
                                    ...(selectedResponsable !== '' ? { $or: [{ responsable: selectedResponsable }, { responsable: { $exists: false } }, { responsable: null }] } : {}),
                                    ...(filterNoticia !== null ? { $or: [{ noticiastate: filterNoticia === 'true' }, { noticiastate: { $exists: false } }, { noticiastate: null }] } : {}),
                                    ...(filterEncargo !== null ? { $or: [{ encargostate: filterEncargo === 'true' }, { encargostate: { $exists: false } }, { encargostate: null }] } : {}),
                                    ...(selectedCategoria !== '' ? { categoria: selectedCategoria } : {}),
                                    ...(localizado !== null ? { $or: [{ localizado: localizado === 'true' }, { localizado: { $exists: false } }, { localizado: null }] } : {}),
                                    ...(aireacondicionado !== 'undefined' ? { aireacondicionado: aireacondicionado === 'true' } : {}),
                                    ...(ascensor !== 'undefined' ? { ascensor: ascensor === 'true' } : {}),
                                    ...(garaje !== 'undefined' ? { garaje: garaje === 'true' } : {}),
                                    ...(trastero !== 'undefined' ? { trastero: trastero === 'true' } : {}),
                                    ...(terraza !== 'undefined' ? { terraza: terraza === 'true' } : {}),
                                    ...(jardin !== 'undefined' ? { jardin: jardin === 'true' } : {}),
                                    ...(habitaciones !== 'undefined' ? { habitaciones } : {}),
                                    ...(banos !== 'undefined' ? { banyos: banos } : {})
                                },
                                {
                                    tipoagrupacion: 2,
                                    ...(selectedZone !== '' ? { "nestedinmuebles.zona": selectedZone } : {}),
                                    ...(selectedResponsable !== '' ? { $or: [{ "nestedinmuebles.responsable": selectedResponsable }, { "nestedinmuebles.responsable": { $exists: false } }, { "nestedinmuebles.responsable": null }] } : {}),
                                    ...(filterNoticia !== null ? { $or: [{ "noticiastate": filterNoticia === 'true' }, { "noticiastate": { $exists: false } }, { "noticiastate": null }] } : {}),
                                    ...(filterEncargo !== null ? { $or: [{ "encargostate": filterEncargo === 'true' }, { "encargostate": { $exists: false } }, { "encargostate": null }] } : {}),
                                    ...(selectedCategoria !== '' ? { "nestedinmuebles.categoria": selectedCategoria } : {}),
                                    ...(localizado !== null ? { $or: [{ "localizado": localizado === 'true' }, { "localizado": { $exists: false } }, { "localizado": null }] } : {}),
                                    ...(aireacondicionado !== 'undefined' ? { "nestedinmuebles.aireacondicionado": aireacondicionado === 'true' } : {}),
                                    ...(ascensor !== 'undefined' ? { "nestedinmuebles.ascensor": ascensor === 'true' } : {}),
                                    ...(garaje !== 'undefined' ? { "nestedinmuebles.garaje": garaje === 'true' } : {}),
                                    ...(trastero !== 'undefined' ? { "nestedinmuebles.trastero": trastero === 'true' } : {}),
                                    ...(terraza !== 'undefined' ? { "nestedinmuebles.terraza": terraza === 'true' } : {}),
                                    ...(jardin !== 'undefined' ? { "nestedinmuebles.jardin": jardin === 'true' } : {}),
                                    ...(habitaciones !== 'undefined' ? { "nestedinmuebles.habitaciones": habitaciones } : {}),
                                    ...(banos !== 'undefined' ? { "nestedinmuebles.banyos": banos } : {})
                                }
                            ]
                        }
                    ]
                }
            },
            {
                $facet: {
                    responsables: [
                        {
                            $group: {
                                _id: {
                                    $cond: [
                                        { $ifNull: ["$nestedescaleras.nestedinmuebles.responsable", false] },
                                        {
                                            $cond: [
                                                { $or: [{ $eq: ["$nestedescaleras.nestedinmuebles.responsable", ""] }, { $eq: ["$nestedescaleras.nestedinmuebles.responsable", "NULL"] }] },
                                                "NULL",
                                                "$nestedescaleras.nestedinmuebles.responsable"
                                            ]
                                        },
                                        {
                                            $cond: [
                                                { $ifNull: ["$nestedinmuebles.responsable", false] },
                                                {
                                                    $cond: [
                                                        { $or: [{ $eq: ["$nestedinmuebles.responsable", ""] }, { $eq: ["$nestedinmuebles.responsable", "NULL"] }] },
                                                        "NULL",
                                                        "$nestedinmuebles.responsable"
                                                    ]
                                                },
                                                {
                                                    $cond: [
                                                        { $or: [{ $eq: ["$topLevelResponsable", ""] }, { $eq: ["$topLevelResponsable", "NULL"] }] },
                                                        "NULL",
                                                        "$topLevelResponsable"
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                responsables: {
                                    $push: {
                                        k: { $ifNull: ["$_id", "NULL"] },
                                        v: "$count"
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                responsables: { $arrayToObject: "$responsables" }
                            }
                        }
                    ],

                    categorias: [
                        {
                            $group: {
                                _id: {
                                    $cond: [
                                        { $ifNull: ["$nestedescaleras.nestedinmuebles.categoria", false] },
                                        {
                                            $cond: [
                                                {
                                                    $or: [
                                                        { $eq: ["$nestedescaleras.nestedinmuebles.categoria", null] },
                                                        { $eq: ["$nestedescaleras.nestedinmuebles.categoria", "NULL"] }
                                                    ]
                                                },
                                                "Sin categoría",
                                                "$nestedescaleras.nestedinmuebles.categoria"
                                            ]
                                        },
                                        {
                                            $cond: [
                                                { $ifNull: ["$nestedinmuebles.categoria", false] },
                                                {
                                                    $cond: [
                                                        {
                                                            $or: [
                                                                { $eq: ["$nestedinmuebles.categoria", null] },
                                                                { $eq: ["$nestedinmuebles.categoria", "NULL"] }
                                                            ]
                                                        },
                                                        "Sin categoría",
                                                        "$nestedinmuebles.categoria"
                                                    ]
                                                },
                                                {
                                                    $cond: [
                                                        {
                                                            $or: [
                                                                { $eq: ["$topLevelCategoria", null] },
                                                                { $eq: ["$topLevelCategoria", "NULL"] }
                                                            ]
                                                        },
                                                        "Sin categoría",
                                                        "$topLevelCategoria"
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                categorias: {
                                    $push: {
                                        k: { $ifNull: ["$_id", "Sin categoría"] },
                                        v: "$count"
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                categorias: { $arrayToObject: "$categorias" }
                            }
                        }
                    ],

                    noticiastate: [
                        {
                            $group: {
                                _id: "$noticiastate",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                value: "$_id",
                                count: 1
                            }
                        }
                    ],
                    encargostate: [
                        {
                            $group: {
                                _id: "$encargostate",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                value: "$_id",
                                count: 1
                            }
                        }
                    ],
                    localizado: [
                        {
                            $group: {
                                _id: "$localizado",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                value: "$_id",
                                count: 1
                            }
                        }
                    ],
                    totalInmuebles: [
                        {
                            $count: "total"
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    responsables: { $first: "$responsables.responsables" },
                    categorias: { $first: "$categorias.categorias" },
                    noticiastate: "$noticiastate",
                    encargostate: "$encargostate",
                    localizado: "$localizado",
                    totalInmuebles: { $arrayElemAt: ["$totalInmuebles.total", 0] }
                }
            }
        ]).toArray();

        console.log('analyticsResults', result);



        console.timeEnd("Fetch Duration");

        res.status(200).json({ totalPages, currentPage: page, results: finalResults, analyitics: result });
    } catch (e) {
        console.error('API Error:', e.message, e.stack);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}