import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { getFilteredCategoriesAndResponsiblesByAddress } from "./calculate_analytics";
import { data } from 'autoprefixer';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);


    try {
        console.time("Fetch Duration");

        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name
        const inmuebles = db.collection('inmuebles');

        const { pattern = '', currentPage = 1, itemsPerPage = 10, selectedZone = '', selectedCategoria = '', selectedResponsable = '', filterNoticia = null, filterEncargo = null, superficieMin = 0, superficieMax = 800000, yearMin = 1800, yearMax = new Date().getFullYear(), localizado = null, garaje = null, aireacondicionado = null, ascensor = null, trastero = null, jardin = null, terraza = null, tipo, banos, habitaciones, DPV = null } = req.query;
        console.log('garaje', garaje);
        console.log('typeof garaje', typeof garaje);
        console.log('tipo', tipo);
        const page = parseInt(currentPage, 10);
        const limit = parseInt(itemsPerPage, 10);
        const skip = (page - 1) * limit;

        const localizadoValueResults = localizado === 'true' ? true : localizado === 'false' ? false : null;
        const filterNoticiaValueResults = filterNoticia === 'true' ? true : filterNoticia === 'false' ? false : null;
        const filterEncargoValueResults = filterEncargo === 'true' ? true : filterEncargo === 'false' ? false : null;
        const DPVValueResults = DPV === 'true' ? true : DPV === 'false' ? false : null;

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
                ...(DPVValueResults !== null ? [{ $or: [{ DPV: DPVValueResults }, { DPV: { $exists: false } }] }] : []),
                // Filtro para responsable
                ...(selectedResponsable !== '' ? [{ $or: [{ responsable: selectedResponsable }, { responsable: { $exists: false } }] }] : []),

                // Filtro para noticiastate
                ...(filterNoticiaValueResults !== null ? [{ $or: [{ noticiastate: filterNoticiaValueResults }, { noticiastate: { $exists: false } }] }] : []),

                // Filtro para encargostate
                ...(filterEncargoValueResults !== null ? [{ $or: [{ encargostate: filterEncargoValueResults }, { encargostate: { $exists: false } }] }] : []),

                // // Filtro para superficie
                ...(superficieMin !== null && superficieMax !== null ? [{ $or: [{ superficie: { $gte: parseInt(superficieMin, 10), $lte: parseInt(superficieMax, 10) } }, { superficie: { $exists: false } }] }] : []),

                // // Filtro para categoria
                ...(selectedCategoria !== '' ? [{ $or: [{ categoria: selectedCategoria === null ? { $exists: false } : selectedCategoria }, { categoria: { $exists: false } }] }] : []),

                // Filtro para localizado
                ...(localizadoValueResults !== null ? [{ $or: [{ localizado: localizadoValueResults }, { localizado: { $exists: false } }] }] : []),

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
            nestedescaleras: 1,
            DPV: 1,
            lastCommentDate: 1,
        };

        // Count the total number of matching documents˘
        const totalCount = await db.collection('inmuebles').countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        const noticiasCollection = db.collection('noticias');

        const noticiasData = await noticiasCollection.find({}).toArray();
        const noticias = noticiasData.reduce((acc, noticia) => {
            acc[parseInt(noticia.noticia_id, 10)] = noticia;
            return acc;
        }, {});

        // Fetch encargos documents
        const encargosCollection = db.collection('encargos');
        const encargosData = await encargosCollection.find({}).toArray();
        const encargos = encargosData.reduce((acc, encargo) => {
            acc[parseInt(encargo.encargo_id, 10)] = encargo;
            return acc;
        }, {});
        // Query the 'inmuebles' collection to find matching documents, ordered by 'direccion' asc, with pagination
        const results = await db.collection('inmuebles')
            .find(query)
            .project(projection)
            .sort({ direccion: 1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        const currentDate = new Date();

        const finalResults = results.map(result => {
            // Fetch all noticias documents


            const setDataUpdateTime = (dateStr) => {
                if (!dateStr) {
                    return 'gray';
                }

                console.log('dateStr', dateStr);

                const lastCommentDate = new Date(dateStr);
                const diffInDays = (currentDate - lastCommentDate) / (1000 * 60 * 60 * 24); // Difference in days

                if (diffInDays < 30) {
                    return 'green';
                } else if (diffInDays >= 30 && diffInDays <= 60) {
                    return 'yellow';
                } else if (diffInDays > 90) {
                    return 'red';
                } else {
                    return 'gray'; // Catch-all case
                }
            };


            // Function to apply both noticia and encargo filters
            const applyNoticiaAndEncargoFilters = (inmueble) => {
                const matchesNoticia = filterNoticiaValueResults === null || inmueble.noticiastate === filterNoticiaValueResults;
                const matchesEncargo = filterEncargoValueResults === null || inmueble.encargostate === filterEncargoValueResults;
                return matchesNoticia && matchesEncargo;
            };

            // Check if the result is tipoagrupacion === 2
            if (result.tipoagrupacion === 2) {
                // Do not set dataUpdateTime for the main document
                // Instead, analyze nestedinmuebles and nestedescaleras.nestedinmuebles

                if (result.nestedinmuebles) {
                    result.nestedinmuebles = result.nestedinmuebles
                        .filter(applyNoticiaAndEncargoFilters)
                        .map(nested => {
                            // Check if there's a matching noticia or encargo for the nested.id
                            const matchingNoticia = noticias[nested.id];
                            const matchingEncargo = encargos[nested.id];
                            return {
                                ...nested,
                                dataUpdateTime: setDataUpdateTime(nested.lastCommentDate),
                                ...(matchingNoticia ? { noticia: matchingNoticia } : {}),
                                ...(matchingEncargo ? { encargo: matchingEncargo } : {})
                            };
                        });
                }

                if (result.nestedescaleras) {
                    result.nestedescaleras = result.nestedescaleras.map(escalera => ({
                        ...escalera,
                        nestedinmuebles: escalera.nestedinmuebles
                            ? escalera.nestedinmuebles
                                .filter(applyNoticiaAndEncargoFilters)
                                .map(nested => {
                                    // Check if there's a matching noticia for the nested.id
                                    const matchingNoticia = noticias[nested.id];
                                    const matchingEncargo = encargos[nested.id];
                                    return {
                                        ...nested,
                                        dataUpdateTime: setDataUpdateTime(nested.lastCommentDate),
                                        ...(matchingNoticia ? { noticia: matchingNoticia } : {}),
                                        ...(matchingEncargo ? { encargo: matchingEncargo } : {})
                                    };
                                })
                            : []
                    }));
                }

                // Exclude the building if no nestedinmuebles or nestedescaleras have valid matches
                const hasValidNestedInmuebles =
                    (result.nestedinmuebles && result.nestedinmuebles.length > 0) ||
                    (result.nestedescaleras && result.nestedescaleras.some(escalera => escalera.nestedinmuebles && escalera.nestedinmuebles.length > 0));

                if (!hasValidNestedInmuebles) {
                    return false;  // Exclude this result
                }
            } else {
                // Attach noticia to result if available
                const noticiaId = parseInt(result.id, 10);
                result.noticia = noticias[noticiaId] || null;

                const encargoId = parseInt(result.id, 10);
                result.encargo = encargos[encargoId] || null;

                // Set dataUpdateTime for the main document
                result.dataUpdateTime = setDataUpdateTime(result.lastCommentDate);

                // Check nestedinmuebles array for consistency and set dataUpdateTime
                if (result.nestedinmuebles && Array.isArray(result.nestedinmuebles)) {
                    result.nestedinmuebles = result.nestedinmuebles.map(nested => {
                        const matchingNoticia = noticias[nested.id];
                        const matchingEncargo = encargos[nested.id];
                        return {
                            ...nested,
                            dataUpdateTime: setDataUpdateTime(nested.lastCommentDate),
                            ...(matchingNoticia ? { noticia: matchingNoticia } : {}),
                            ...(matchingEncargo ? { encargo: matchingEncargo } : {})
                        };
                    });
                }

                // Check nestedescaleras array for consistency and set dataUpdateTime for nestedinmuebles inside escalera
                if (result.nestedescaleras && Array.isArray(result.nestedescaleras)) {
                    result.nestedescaleras = result.nestedescaleras.map(escalera => ({
                        ...escalera,
                        nestedinmuebles: escalera.nestedinmuebles && Array.isArray(escalera.nestedinmuebles)
                            ? escalera.nestedinmuebles.map(nested => {
                                const matchingNoticia = noticias[nested.id];
                                const matchingEncargo = encargos[nested.id];
                                return {
                                    ...nested,
                                    dataUpdateTime: setDataUpdateTime(nested.lastCommentDate),
                                    ...(matchingNoticia ? { noticia: matchingNoticia } : {}),
                                    ...(matchingEncargo ? { encargo: matchingEncargo } : {})
                                };
                            })
                            : []
                    }));
                }
            }




            const applyDPVFilter = (inmueble) => {
                if (DPVValueResults !== null) {
                    return inmueble.DPV === DPVValueResults;
                }
                // If DPVValueResults is null, all inmuebles pass the filter
                return true;
            };
            const applyNoticiaFilter = (inmueble) => {
                if (filterNoticiaValueResults !== null) {
                    return inmueble.noticiastate === filterNoticiaValueResults;
                }
                // If filterNoticiaValueResults is null, all inmuebles pass the filter
                return true;
            };

            const applyEncargoFilter = (inmueble) => {
                if (filterEncargoValueResults !== null) {
                    return inmueble.encargostate === filterEncargoValueResults;
                }
                // If filterEncargoValueResults is null, all inmuebles pass the filter
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
                if (localizadoValueResults !== null) {
                    return inmueble.localizado === localizadoValueResults;
                }
                return true; // If localizadoValueResults is null, include all inmuebles.
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
                if (result.tipoagrupacion === 2) {
                    // If tipoagrupacion is 2, skip filters and include all nestedinmuebles and nestedescaleras
                    return true;
                }
                // Otherwise, apply all filters
                return applyHabitacionesFilter(inmueble) && applyBanosFilter(inmueble) &&
                    applyNoticiaFilter(inmueble) && applyEncargoFilter(inmueble) && applyCategoriaFilter(inmueble) && applyZoneFilter(inmueble) && applyResponsableFilter(inmueble) && applyLocalizadoFilter(inmueble) && applySuperficieFilter(inmueble)
                    && applyAireAcondicionadoFilter(inmueble) && applyAscensorFilter(inmueble) && applyGarajeFilter(inmueble) && applyTrasteroFilter(inmueble) && applyTerrazaFilter(inmueble) && applyJardinFilter(inmueble) && applyTipoAgrupacionFilter(inmueble) && applyDPVFilter(inmueble);
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

        // Convertimos los valores de los filtros booleanos en nuevas variables
        const filterNoticiaValue = filterNoticia === 'true' ? true : filterNoticia === 'false' ? false : null;
        const filterEncargoValue = filterEncargo === 'true' ? true : filterEncargo === 'false' ? false : null;
        const localizadoValue = localizado === 'true' ? true : localizado === 'false' ? false : null;
        const aireacondicionadoValue = aireacondicionado === 'true' ? true : aireacondicionado === 'false' ? false : 'undefined';
        const ascensorValue = ascensor === 'true' ? true : ascensor === 'false' ? false : 'undefined';
        const garajeValue = garaje === 'true' ? true : garaje === 'false' ? false : 'undefined';
        const trasteroValue = trastero === 'true' ? true : trastero === 'false' ? false : 'undefined';
        const terrazaValue = terraza === 'true' ? true : terraza === 'false' ? false : 'undefined';
        const jardinValue = jardin === 'true' ? true : jardin === 'false' ? false : 'undefined';
        const DPVValue = DPV === 'true' ? true : DPV === 'false' ? false : 'undefined';


        const result1 = await db.collection('inmuebles').aggregate([
            // Filtramos los documentos donde la dirección coincide con el patrón proporcionado
            {
                $match: {
                    'direccion': {
                        $regex: pattern,
                        $options: 'i'
                    },
                    'tipoagrupacion': 2,
                    ...(tipo !== 'undefined' ? { tipoagrupacion: parseInt(tipo, 10) } : {})
                }
            },

            // Desenrollamos el array de nestedinmuebles para aplicar filtros a cada subdocumento
            {
                $unwind: {
                    path: "$nestedinmuebles",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Aplicamos los filtros solicitados a los subdocumentos de nestedinmuebles
            {
                $match: {
                    "nestedinmuebles.superficie": { $gte: parseInt(superficieMin, 10), $lte: parseInt(superficieMax, 10) },
                    "nestedinmuebles.ano_construccion": { $gte: parseInt(yearMin, 10), $lte: parseInt(yearMax, 10) },
                    ...(selectedZone !== '' ? { "nestedinmuebles.zona": selectedZone } : {}),
                    ...(selectedResponsable !== '' ? {
                        $or: [
                            { "nestedinmuebles.responsable": selectedResponsable },
                            { "nestedinmuebles.responsable": { $exists: false } },
                            { "nestedinmuebles.responsable": null }
                        ]
                    } : {}),
                    ...(filterNoticiaValue !== null ? {
                        $or: [
                            { "nestedinmuebles.noticiastate": filterNoticiaValue },
                            { "nestedinmuebles.noticiastate": { $exists: false } },
                            { "nestedinmuebles.noticiastate": null }
                        ]
                    } : {}),
                    ...(filterEncargoValue !== null ? {
                        $or: [
                            { "nestedinmuebles.encargostate": filterEncargoValue },
                            { "nestedinmuebles.encargostate": { $exists: false } },
                            { "nestedinmuebles.encargostate": null }
                        ]
                    } : {}),
                    ...(selectedCategoria !== '' ? { "nestedinmuebles.categoria": selectedCategoria } : {}),
                    ...(localizadoValue !== null ? { "nestedinmuebles.localizado": localizadoValue } : {}),
                    ...(aireacondicionadoValue !== 'undefined' ? { "nestedinmuebles.aireacondicionado": aireacondicionadoValue } : {}),
                    ...(ascensorValue !== 'undefined' ? { "nestedinmuebles.ascensor": ascensorValue } : {}),
                    ...(garajeValue !== 'undefined' ? { "nestedinmuebles.garaje": garajeValue } : {}),
                    ...(trasteroValue !== 'undefined' ? { "nestedinmuebles.trastero": trasteroValue } : {}),
                    ...(terrazaValue !== 'undefined' ? { "nestedinmuebles.terraza": terrazaValue } : {}),
                    ...(jardinValue !== 'undefined' ? { "nestedinmuebles.jardin": jardinValue } : {}),
                    ...(habitaciones !== 'undefined' ? { "nestedinmuebles.habitaciones": habitaciones } : {}),
                    ...(banos !== 'undefined' ? { "nestedinmuebles.banyos": banos } : {}),
                    ...(DPVValue !== 'undefined' ? { "nestedinmuebles.DPV": DPVValue } : {})
                }
            },

            // Agrupamos los resultados por responsables, categorias, zonas, y los estados booleanos, contando el número de coincidencias
            {
                $group: {
                    _id: null,
                    responsables: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedinmuebles.responsable" }, "NULL"]
                        }
                    },
                    categorias: {
                        $push: {
                            $cond: {
                                if: { $or: [{ $eq: ["$nestedinmuebles.categoria", null] }, { $eq: ["$nestedinmuebles.categoria", "NULL"] }] },
                                then: "Sin Categoría",
                                else: { $ifNull: [{ $toString: "$nestedinmuebles.categoria" }, "Sin Categoría"] }
                            }
                        }
                    },
                    zonas: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedinmuebles.zona" }, "NULL"]
                        }
                    },
                    noticiastate: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedinmuebles.noticiastate" }, "NULL"]
                        }
                    },
                    encargostate: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedinmuebles.encargostate" }, "NULL"]
                        }
                    },
                    localizado: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedinmuebles.localizado" }, "NULL"]
                        }
                    },
                    DPV: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedinmuebles.DPV" }, "NULL"]
                        }
                    },
                    totalInmuebles: {
                        $sum: 1
                    }
                }
            },

            // Desenrollamos y contamos las ocurrencias de cada responsable, categoría, zona, y estados booleanos
            {
                $project: {
                    responsables: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$responsables", []] }, // Eliminamos duplicados
                                as: "responsable",
                                in: {
                                    k: {
                                        $cond: {
                                            if: { $or: [{ $eq: ["$$responsable", ""] }, { $eq: ["$$responsable", null] }] }, // Condición para convertir '' y null a 'NULL'
                                            then: "NULL",
                                            else: { $toString: "$$responsable" }
                                        }
                                    },
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$responsables",
                                                as: "r",
                                                cond: {
                                                    $eq: [
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$r", ""] }, { $eq: ["$$r", null] }] }, // Condición para tratar '' y null como 'NULL'
                                                                then: "NULL",
                                                                else: { $toString: "$$r" }
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$responsable", ""] }, { $eq: ["$$responsable", null] }] },
                                                                then: "NULL",
                                                                else: { $toString: "$$responsable" }
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },

                    categorias: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$categorias", []] }, // Eliminamos duplicados
                                as: "categoria",
                                in: {
                                    k: {
                                        $cond: {
                                            if: { $or: [{ $eq: ["$$categoria", null] }, { $eq: ["$$categoria", "NULL"] }] },
                                            then: "Sin Categoría",
                                            else: { $toString: "$$categoria" }
                                        }
                                    },
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$categorias",
                                                as: "c",
                                                cond: {
                                                    $eq: [
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$c", null] }, { $eq: ["$$c", "NULL"] }] },
                                                                then: "Sin Categoría",
                                                                else: { $toString: "$$c" }
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$categoria", null] }, { $eq: ["$$categoria", "NULL"] }] },
                                                                then: "Sin Categoría",
                                                                else: { $toString: "$$categoria" }
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },

                    zonas: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$zonas", []] }, // Eliminamos duplicados
                                as: "zona",
                                in: {
                                    k: "$$zona",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$zonas",
                                                as: "z",
                                                cond: { $eq: ["$$z", "$$zona"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    noticiastate: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$noticiastate",
                                                as: "n",
                                                cond: { $eq: ["$$n", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    encargostate: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$encargostate",
                                                as: "e",
                                                cond: { $eq: ["$$e", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    localizado: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$localizado",
                                                as: "l",
                                                cond: { $eq: ["$$l", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    DPV: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$DPV",
                                                as: "d",
                                                cond: { $eq: ["$$d", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    totalInmuebles: 1
                }
            }
        ]).toArray();

        const result2 = await db.collection('inmuebles').aggregate([
            // Filtramos los documentos donde la dirección coincide con el patrón proporcionado
            {
                $match: {
                    'direccion': {
                        $regex: pattern,
                        $options: 'i'
                    },
                    'tipoagrupacion': 2,
                    ...(tipo !== 'undefined' ? { "nestedinmuebles.tipoagrupacion": parseInt(tipo, 10) } : {}) // {{ edit_2 }}
                }
            },

            // Desenrollamos el array de nestedescaleras.nestedinmuebles para aplicar filtros a cada subdocumento
            {
                $unwind: {
                    path: "$nestedescaleras",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$nestedescaleras.nestedinmuebles",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Aplicamos los filtros solicitados a los subdocumentos de nestedescaleras.nestedinmuebles
            {
                $match: {
                    "nestedescaleras.nestedinmuebles.superficie": { $gte: parseInt(superficieMin, 10), $lte: parseInt(superficieMax, 10) },
                    "nestedescaleras.nestedinmuebles.ano_construccion": { $gte: parseInt(yearMin, 10), $lte: parseInt(yearMax, 10) },

                    ...(selectedZone !== '' ? { "nestedescaleras.nestedinmuebles.zona": selectedZone } : {}),
                    ...(selectedResponsable !== '' ? {
                        $or: [
                            { "nestedescaleras.nestedinmuebles.responsable": selectedResponsable },
                            { "nestedescaleras.nestedinmuebles.responsable": { $exists: false } },
                            { "nestedescaleras.nestedinmuebles.responsable": null }
                        ]
                    } : {}),
                    ...(filterNoticiaValue !== null ? {
                        $or: [
                            { "nestedescaleras.nestedinmuebles.noticiastate": filterNoticiaValue },
                            { "nestedescaleras.nestedinmuebles.noticiastate": { $exists: false } },
                            { "nestedescaleras.nestedinmuebles.noticiastate": null }
                        ]
                    } : {}),
                    ...(filterEncargoValue !== null ? {
                        $or: [
                            { "nestedescaleras.nestedinmuebles.encargostate": filterEncargoValue },
                            { "nestedescaleras.nestedinmuebles.encargostate": { $exists: false } },
                            { "nestedescaleras.nestedinmuebles.encargostate": null }
                        ]
                    } : {}),
                    ...(selectedCategoria !== '' ? { "nestedescaleras.nestedinmuebles.categoria": selectedCategoria } : {}),
                    ...(localizadoValue !== null ? { "nestedescaleras.nestedinmuebles.localizado": localizadoValue } : {}),
                    ...(aireacondicionadoValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.aireacondicionado": aireacondicionadoValue } : {}),
                    ...(ascensorValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.ascensor": ascensorValue } : {}),
                    ...(garajeValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.garaje": garajeValue } : {}),
                    ...(trasteroValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.trastero": trasteroValue } : {}),
                    ...(terrazaValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.terraza": terrazaValue } : {}),
                    ...(jardinValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.jardin": jardinValue } : {}),
                    ...(habitaciones !== 'undefined' ? { "nestedescaleras.nestedinmuebles.habitaciones": habitaciones } : {}),
                    ...(banos !== 'undefined' ? { "nestedescaleras.nestedinmuebles.banyos": banos } : {}),
                    ...(DPVValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.DPV": DPVValue } : {})

                }
            },

            // Agrupamos los resultados por responsables, categorías, zonas, y los estados booleanos, contando el número de coincidencias
            {
                $group: {
                    _id: null,
                    responsables: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.responsable" }, "NULL"]
                        }
                    },
                    categorias: {
                        $push: {
                            $cond: {
                                if: { $or: [{ $eq: ["$nestedescaleras.nestedinmuebles.categoria", null] }, { $eq: ["$nestedescaleras.nestedinmuebles.categoria", "NULL"] }] },
                                then: "Sin Categoría",
                                else: { $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.categoria" }, "Sin Categoría"] }
                            }
                        }
                    },
                    zonas: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.zona" }, "NULL"]
                        }
                    },
                    noticiastate: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.noticiastate" }, "NULL"]
                        }
                    },
                    encargostate: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.encargostate" }, "NULL"]
                        }
                    },
                    localizado: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.localizado" }, "NULL"]
                        }
                    },
                    DPV: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.DPV" }, "NULL"]
                        }
                    },
                    totalInmuebles: {
                        $sum: 1
                    }
                }
            },

            // Desenrollamos y contamos las ocurrencias de cada responsable, categoría, zona, y estados booleanos
            {
                $project: {
                    responsables: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$responsables", []] }, // Eliminamos duplicados
                                as: "responsable",
                                in: {
                                    k: {
                                        $cond: {
                                            if: { $or: [{ $eq: ["$$responsable", ""] }, { $eq: ["$$responsable", null] }] }, // Condición para convertir '' y null a 'NULL'
                                            then: "NULL",
                                            else: { $toString: "$$responsable" }
                                        }
                                    },
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$responsables",
                                                as: "r",
                                                cond: {
                                                    $eq: [
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$r", ""] }, { $eq: ["$$r", null] }] }, // Condición para tratar '' y null como 'NULL'
                                                                then: "NULL",
                                                                else: { $toString: "$$r" }
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$responsable", ""] }, { $eq: ["$$responsable", null] }] },
                                                                then: "NULL",
                                                                else: { $toString: "$$responsable" }
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },

                    categorias: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$categorias", []] }, // Eliminamos duplicados
                                as: "categoria",
                                in: {
                                    k: {
                                        $cond: {
                                            if: { $or: [{ $eq: ["$$categoria", null] }, { $eq: ["$$categoria", "NULL"] }] },
                                            then: "Sin Categoría",
                                            else: { $toString: "$$categoria" }
                                        }
                                    },
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$categorias",
                                                as: "c",
                                                cond: {
                                                    $eq: [
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$c", null] }, { $eq: ["$$c", "NULL"] }] },
                                                                then: "Sin Categoría",
                                                                else: { $toString: "$$c" }
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: { $eq: ["$$categoria", null] },
                                                                then: "Sin Categoría",
                                                                else: { $toString: "$$categoria" }
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },

                    zonas: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$zonas", []] }, // Eliminamos duplicados
                                as: "zona",
                                in: {
                                    k: "$$zona",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$zonas",
                                                as: "z",
                                                cond: { $eq: ["$$z", "$$zona"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    noticiastate: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$noticiastate",
                                                as: "n",
                                                cond: { $eq: ["$$n", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    encargostate: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$encargostate",
                                                as: "e",
                                                cond: { $eq: ["$$e", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    localizado: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$localizado",
                                                as: "l",
                                                cond: { $eq: ["$$l", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    DPV: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$DPV",
                                                as: "d",
                                                cond: { $eq: ["$$d", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    totalInmuebles: 1
                }
            }
        ]).toArray();


        const result3 = await db.collection('inmuebles').aggregate([
            // Filtramos los documentos donde la dirección coincide con el patrón proporcionado y el tipo de agrupación es 1
            {
                $match: {
                    'direccion': {
                        $regex: pattern,
                        $options: 'i'
                    },
                    'tipoagrupacion': 1,
                    ...(tipo !== 'undefined' ? { tipoagrupacion: parseInt(tipo, 10) } : {}) // {{ edit_3 }}
                }
            },

            // Aplicamos los filtros solicitados a los fields del propio documento
            {
                $match: {
                    "superficie": { $gte: parseInt(superficieMin, 10), $lte: parseInt(superficieMax, 10) },
                    "ano_construccion": { $gte: parseInt(yearMin, 10), $lte: parseInt(yearMax, 10) },
                    ...(selectedZone !== '' ? { "zona": selectedZone } : {}),
                    ...(selectedResponsable !== '' ? {
                        $or: [
                            { "responsable": selectedResponsable },
                            { "responsable": { $exists: false } },
                            { "responsable": null }
                        ]
                    } : {}),
                    ...(filterNoticiaValue !== null ? {
                        $or: [
                            { "noticiastate": filterNoticiaValue },
                            { "noticiastate": { $exists: false } },
                            { "noticiastate": null }
                        ]
                    } : {}),
                    ...(filterEncargoValue !== null ? {
                        $or: [
                            { "encargostate": filterEncargoValue },
                            { "encargostate": { $exists: false } },
                            { "encargostate": null }
                        ]
                    } : {}),
                    ...(selectedCategoria !== '' ? { "categoria": selectedCategoria } : {}),
                    ...(localizadoValue !== null ? { "localizado": localizadoValue } : {}),
                    ...(aireacondicionadoValue !== 'undefined' ? { "aireacondicionado": aireacondicionadoValue } : {}),
                    ...(ascensorValue !== 'undefined' ? { "ascensor": ascensorValue } : {}),
                    ...(garajeValue !== 'undefined' ? { "garaje": garajeValue } : {}),
                    ...(trasteroValue !== 'undefined' ? { "trastero": trasteroValue } : {}),
                    ...(terrazaValue !== 'undefined' ? { "terraza": terrazaValue } : {}),
                    ...(jardinValue !== 'undefined' ? { "jardin": jardinValue } : {}),
                    ...(habitaciones !== 'undefined' ? { "habitaciones": habitaciones } : {}),
                    ...(banos !== 'undefined' ? { "banyos": banos } : {}),
                    ...(DPVValue !== 'undefined' ? { "DPV": DPVValue } : {})
                }
            },

            // Agrupamos los resultados por responsables, categorías, zonas, y los estados booleanos, contando el número de coincidencias
            {
                $group: {
                    _id: null,
                    responsables: {
                        $push: {
                            $ifNull: [{ $toString: "$responsable" }, "NULL"]
                        }
                    },
                    categorias: {
                        $push: {
                            $cond: {
                                if: { $or: [{ $eq: ["$categoria", null] }, { $eq: ["$categoria", "NULL"] }] },
                                then: "Sin Categoría",
                                else: { $ifNull: [{ $toString: "$categoria" }, "Sin Categoría"] }
                            }
                        }
                    },

                    zonas: {
                        $push: {
                            $ifNull: [{ $toString: "$zona" }, "NULL"]
                        }
                    },
                    noticiastate: {
                        $push: {
                            $ifNull: [{ $toString: "$noticiastate" }, "NULL"]
                        }
                    },
                    encargostate: {
                        $push: {
                            $ifNull: [{ $toString: "$encargostate" }, "NULL"]
                        }
                    },
                    localizado: {
                        $push: {
                            $ifNull: [{ $toString: "$localizado" }, "NULL"]
                        }
                    },
                    DPV: {
                        $push: {
                            $ifNull: [{ $toString: "$DPV" }, "NULL"]
                        }
                    },
                    totalInmuebles: {
                        $sum: 1
                    }
                }
            },

            // Desenrollamos y contamos las ocurrencias de cada responsable, categoría, zona, y estados booleanos
            {
                $project: {
                    responsables: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$responsables", []] }, // Eliminamos duplicados
                                as: "responsable",
                                in: {
                                    k: {
                                        $cond: {
                                            if: { $or: [{ $eq: ["$$responsable", ""] }, { $eq: ["$$responsable", null] }] }, // Condición para convertir '' y null a 'NULL'
                                            then: "NULL",
                                            else: { $toString: "$$responsable" }
                                        }
                                    },
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$responsables",
                                                as: "r",
                                                cond: {
                                                    $eq: [
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$r", ""] }, { $eq: ["$$r", null] }] }, // Condición para tratar '' y null como 'NULL'
                                                                then: "NULL",
                                                                else: { $toString: "$$r" }
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$responsable", ""] }, { $eq: ["$$responsable", null] }] },
                                                                then: "NULL",
                                                                else: { $toString: "$$responsable" }
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },

                    categorias: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$categorias", []] }, // Eliminamos duplicados
                                as: "categoria",
                                in: {
                                    k: {
                                        $cond: {
                                            if: { $or: [{ $eq: ["$$categoria", null] }, { $eq: ["$$categoria", "NULL"] }] },
                                            then: "Sin Categoría",
                                            else: { $toString: "$$categoria" }
                                        }
                                    },
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$categorias",
                                                as: "c",
                                                cond: { $eq: ["$$c", "$$categoria"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    zonas: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$zonas", []] }, // Eliminamos duplicados
                                as: "zona",
                                in: {
                                    k: "$$zona",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$zonas",
                                                as: "z",
                                                cond: { $eq: ["$$z", "$$zona"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    noticiastate: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$noticiastate",
                                                as: "n",
                                                cond: { $eq: ["$$n", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    encargostate: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$encargostate",
                                                as: "e",
                                                cond: { $eq: ["$$e", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    localizado: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$localizado",
                                                as: "l",
                                                cond: { $eq: ["$$l", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    DPV: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$DPV",
                                                as: "d",
                                                cond: { $eq: ["$$d", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    totalInmuebles: 1
                }
            }
        ]).toArray();



        const result4 = await db.collection('inmuebles').aggregate([
            // Desenrollamos el array de nestedinmuebles para aplicar el filtro de dirección en los subdocumentos
            {
                $unwind: {
                    path: "$nestedinmuebles",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Filtramos los subdocumentos donde la dirección coincide con el patrón proporcionado
            {
                $match: {
                    'nestedinmuebles.direccion': {
                        $regex: pattern,
                        $options: 'i'
                    },
                    ...(tipo !== 'undefined' ? { "nestedinmuebles.tipoagrupacion": parseInt(tipo, 10) } : {}) // {{ edit_4 }}
                }
            },

            // Aplicamos los filtros solicitados a los subdocumentos de nestedinmuebles
            {
                $match: {
                    "nestedinmuebles.superficie": { $gte: parseInt(superficieMin, 10), $lte: parseInt(superficieMax, 10) },
                    "nestedinmuebles.ano_construccion": { $gte: parseInt(yearMin, 10), $lte: parseInt(yearMax, 10) },
                    ...(selectedZone !== '' ? { "nestedinmuebles.zona": selectedZone } : {}),
                    ...(selectedResponsable !== '' ? {
                        $or: [
                            { "nestedinmuebles.responsable": selectedResponsable },
                            { "nestedinmuebles.responsable": { $exists: false } },
                            { "nestedinmuebles.responsable": null }
                        ]
                    } : {}),
                    ...(filterNoticiaValue !== null ? {
                        $or: [
                            { "nestedinmuebles.noticiastate": filterNoticiaValue },
                            { "nestedinmuebles.noticiastate": { $exists: false } },
                            { "nestedinmuebles.noticiastate": null }
                        ]
                    } : {}),
                    ...(filterEncargoValue !== null ? {
                        $or: [
                            { "nestedinmuebles.encargostate": filterEncargoValue },
                            { "nestedinmuebles.encargostate": { $exists: false } },
                            { "nestedinmuebles.encargostate": null }
                        ]
                    } : {}),
                    ...(selectedCategoria !== '' ? { "nestedinmuebles.categoria": selectedCategoria } : {}),
                    ...(localizadoValue !== null ? { "nestedinmuebles.localizado": localizadoValue } : {}),
                    ...(aireacondicionadoValue !== 'undefined' ? { "nestedinmuebles.aireacondicionado": aireacondicionadoValue } : {}),
                    ...(ascensorValue !== 'undefined' ? { "nestedinmuebles.ascensor": ascensorValue } : {}),
                    ...(garajeValue !== 'undefined' ? { "nestedinmuebles.garaje": garajeValue } : {}),
                    ...(trasteroValue !== 'undefined' ? { "nestedinmuebles.trastero": trasteroValue } : {}),
                    ...(terrazaValue !== 'undefined' ? { "nestedinmuebles.terraza": terrazaValue } : {}),
                    ...(jardinValue !== 'undefined' ? { "nestedinmuebles.jardin": jardinValue } : {}),
                    ...(habitaciones !== 'undefined' ? { "nestedinmuebles.habitaciones": habitaciones } : {}),
                    ...(banos !== 'undefined' ? { "nestedinmuebles.banyos": banos } : {}),
                    ...(DPVValue !== 'undefined' ? { "nestedinmuebles.DPV": DPVValue } : {})

                }
            },

            // Agrupamos los resultados por responsables, categorías, zonas, y los estados booleanos, contando el número de coincidencias
            {
                $group: {
                    _id: null,
                    responsables: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedinmuebles.responsable" }, "NULL"]
                        }
                    },
                    categorias: {
                        $push: {
                            $cond: {
                                if: { $or: [{ $eq: ["$nestedinmuebles.categoria", null] }, { $eq: ["$nestedinmuebles.categoria", "NULL"] }] },
                                then: "Sin categoría",
                                else: { $ifNull: [{ $toString: "$nestedinmuebles.categoria" }, "Sin categoría"] }
                            }
                        }
                    },

                    zonas: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedinmuebles.zona" }, "NULL"]
                        }
                    },
                    noticiastate: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedinmuebles.noticiastate" }, "NULL"]
                        }
                    },
                    encargostate: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedinmuebles.encargostate" }, "NULL"]
                        }
                    },
                    localizado: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedinmuebles.localizado" }, "NULL"]
                        }
                    },

                    DPV: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedinmuebles.DPV" }, "NULL"]
                        }
                    },
                    totalInmuebles: {
                        $sum: 1
                    }
                }
            },

            // Desenrollamos y contamos las ocurrencias de cada responsable, categoría, zona, y estados booleanos
            {
                $project: {
                    responsables: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$responsables", []] }, // Eliminamos duplicados
                                as: "responsable",
                                in: {
                                    k: {
                                        $cond: {
                                            if: { $or: [{ $eq: ["$$responsable", ""] }, { $eq: ["$$responsable", null] }] }, // Condición para convertir '' y null a 'NULL'
                                            then: "NULL",
                                            else: { $toString: "$$responsable" }
                                        }
                                    },
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$responsables",
                                                as: "r",
                                                cond: {
                                                    $eq: [
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$r", ""] }, { $eq: ["$$r", null] }] }, // Condición para tratar '' y null como 'NULL'
                                                                then: "NULL",
                                                                else: { $toString: "$$r" }
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$responsable", ""] }, { $eq: ["$$responsable", null] }] },
                                                                then: "NULL",
                                                                else: { $toString: "$$responsable" }
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },

                    categorias: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$categorias", []] }, // Eliminamos duplicados
                                as: "categoria",
                                in: {
                                    k: {
                                        $cond: {
                                            if: { $or: [{ $eq: ["$$categoria", null] }, { $eq: ["$$categoria", "NULL"] }] },
                                            then: "Sin categoría",
                                            else: { $toString: "$$categoria" }
                                        }
                                    },
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$categorias",
                                                as: "c",
                                                cond: { $eq: ["$$c", "$$categoria"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    zonas: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$zonas", []] }, // Eliminamos duplicados
                                as: "zona",
                                in: {
                                    k: "$$zona",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$zonas",
                                                as: "z",
                                                cond: { $eq: ["$$z", "$$zona"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    noticiastate: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$noticiastate",
                                                as: "n",
                                                cond: { $eq: ["$$n", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    encargostate: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$encargostate",
                                                as: "e",
                                                cond: { $eq: ["$$e", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    localizado: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$localizado",
                                                as: "l",
                                                cond: { $eq: ["$$l", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    DPV: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$DPV",
                                                as: "d",
                                                cond: { $eq: ["$$d", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    totalInmuebles: 1
                }
            }
        ]).toArray();


        const result5 = await db.collection('inmuebles').aggregate([
            // Desenrollamos el array de nestedescaleras para aplicar el filtro de dirección en los subdocumentos
            {
                $unwind: {
                    path: "$nestedescaleras",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$nestedescaleras.nestedinmuebles",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Filtramos los subdocumentos donde la dirección coincide con el patrón proporcionado
            {
                $match: {
                    'nestedescaleras.nestedinmuebles.direccion': {
                        $regex: pattern,
                        $options: 'i'
                    },
                    ...(tipo !== 'undefined' ? { "nestedescaleras.nestedinmuebles.tipoagrupacion": parseInt(tipo, 10) } : {}) // {{ edit_5 }}
                }
            },

            // Aplicamos los filtros solicitados a los subdocumentos de nestedescaleras.nestedinmuebles
            {
                $match: {
                    "nestedescaleras.nestedinmuebles.superficie": { $gte: parseInt(superficieMin, 10), $lte: parseInt(superficieMax, 10) },
                    "nestedescaleras.nestedinmuebles.ano_construccion": { $gte: parseInt(yearMin, 10), $lte: parseInt(yearMax, 10) },
                    ...(selectedZone !== '' ? { "nestedescaleras.nestedinmuebles.zona": selectedZone } : {}),
                    ...(selectedResponsable !== '' ? {
                        $or: [
                            { "nestedescaleras.nestedinmuebles.responsable": selectedResponsable },
                            { "nestedescaleras.nestedinmuebles.responsable": { $exists: false } },
                            { "nestedescaleras.nestedinmuebles.responsable": null }
                        ]
                    } : {}),
                    ...(filterNoticiaValue !== null ? {
                        $or: [
                            { "nestedescaleras.nestedinmuebles.noticiastate": filterNoticiaValue },
                            { "nestedescaleras.nestedinmuebles.noticiastate": { $exists: false } },
                            { "nestedescaleras.nestedinmuebles.noticiastate": null }
                        ]
                    } : {}),
                    ...(filterEncargoValue !== null ? {
                        $or: [
                            { "nestedescaleras.nestedinmuebles.encargostate": filterEncargoValue },
                            { "nestedescaleras.nestedinmuebles.encargostate": { $exists: false } },
                            { "nestedescaleras.nestedinmuebles.encargostate": null }
                        ]
                    } : {}),
                    ...(selectedCategoria !== '' ? { "nestedescaleras.nestedinmuebles.categoria": selectedCategoria } : {}),
                    ...(localizadoValue !== null ? { "nestedescaleras.nestedinmuebles.localizado": localizadoValue } : {}),
                    ...(aireacondicionadoValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.aireacondicionado": aireacondicionadoValue } : {}),
                    ...(ascensorValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.ascensor": ascensorValue } : {}),
                    ...(garajeValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.garaje": garajeValue } : {}),
                    ...(trasteroValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.trastero": trasteroValue } : {}),
                    ...(terrazaValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.terraza": terrazaValue } : {}),
                    ...(jardinValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.jardin": jardinValue } : {}),
                    ...(habitaciones !== 'undefined' ? { "nestedescaleras.nestedinmuebles.habitaciones": habitaciones } : {}),
                    ...(banos !== 'undefined' ? { "nestedescaleras.nestedinmuebles.banyos": banos } : {}),
                    ...(DPVValue !== 'undefined' ? { "nestedescaleras.nestedinmuebles.DPV": DPVValue } : {})
                }
            },

            // Agrupamos los resultados por responsables, categorías, zonas, y los estados booleanos, contando el número de coincidencias
            {
                $group: {
                    _id: null,
                    responsables: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.responsable" }, "NULL"]
                        }
                    },
                    categorias: {
                        $push: {
                            $cond: {
                                if: { $or: [{ $eq: ["$nestedescaleras.nestedinmuebles.categoria", null] }, { $eq: ["$nestedescaleras.nestedinmuebles.categoria", "NULL"] }] },
                                then: "Sin categoría",
                                else: { $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.categoria" }, "Sin categoría"] }
                            }
                        }
                    },

                    zonas: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.zona" }, "NULL"]
                        }
                    },
                    noticiastate: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.noticiastate" }, "NULL"]
                        }
                    },
                    encargostate: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.encargostate" }, "NULL"]
                        }
                    },
                    localizado: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.localizado" }, "NULL"]
                        }
                    },
                    DPV: {
                        $push: {
                            $ifNull: [{ $toString: "$nestedescaleras.nestedinmuebles.DPV" }, "NULL"]
                        }
                    },
                    totalInmuebles: {
                        $sum: 1
                    }
                }
            },

            // Desenrollamos y contamos las ocurrencias de cada responsable, categoría, zona, y estados booleanos
            {
                $project: {
                    responsables: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$responsables", []] }, // Eliminamos duplicados
                                as: "responsable",
                                in: {
                                    k: {
                                        $cond: {
                                            if: { $or: [{ $eq: ["$$responsable", ""] }, { $eq: ["$$responsable", null] }] }, // Condición para convertir '' y null a 'NULL'
                                            then: "NULL",
                                            else: { $toString: "$$responsable" }
                                        }
                                    },
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$responsables",
                                                as: "r",
                                                cond: {
                                                    $eq: [
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$r", ""] }, { $eq: ["$$r", null] }] }, // Condición para tratar '' y null como 'NULL'
                                                                then: "NULL",
                                                                else: { $toString: "$$r" }
                                                            }
                                                        },
                                                        {
                                                            $cond: {
                                                                if: { $or: [{ $eq: ["$$responsable", ""] }, { $eq: ["$$responsable", null] }] },
                                                                then: "NULL",
                                                                else: { $toString: "$$responsable" }
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },

                    categorias: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$categorias", []] }, // Eliminamos duplicados
                                as: "categoria",
                                in: {
                                    k: {
                                        $cond: {
                                            if: { $or: [{ $eq: ["$$categoria", null] }, { $eq: ["$$categoria", "NULL"] }] },
                                            then: "Sin categoría",
                                            else: { $toString: "$$categoria" }
                                        }
                                    },
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$categorias",
                                                as: "c",
                                                cond: { $eq: ["$$c", "$$categoria"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    zonas: {
                        $arrayToObject: {
                            $map: {
                                input: { $setUnion: ["$zonas", []] }, // Eliminamos duplicados
                                as: "zona",
                                in: {
                                    k: "$$zona",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$zonas",
                                                as: "z",
                                                cond: { $eq: ["$$z", "$$zona"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    noticiastate: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$noticiastate",
                                                as: "n",
                                                cond: { $eq: ["$$n", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    encargostate: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$encargostate",
                                                as: "e",
                                                cond: { $eq: ["$$e", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    localizado: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state", // Clave: "true", "false", o "NULL"
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$localizado",
                                                as: "l",
                                                cond: { $eq: ["$$l", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }, DPV: {
                        $arrayToObject: {
                            $map: {
                                input: ["true", "false", "NULL"],
                                as: "state",
                                in: {
                                    k: "$$state",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$DPV",
                                                as: "d",
                                                cond: { $eq: ["$$d", "$$state"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    totalInmuebles: 1
                }
            }
        ]).toArray();


        console.log('result 1', result1);

        console.log('result 2', result2);

        console.log('result 3', result3);

        console.log('result 4', result4);

        console.log('result 5', result5);


        function combineResults(results) {
            // Inicializamos un objeto para acumular los resultados
            const combined = {
                totalInmuebles: 0,
                responsables: {},
                categorias: {},
                zonas: {},
                noticiastate: { true: 0, false: 0, NULL: 0 },
                encargostate: { true: 0, false: 0, NULL: 0 },
                localizado: { true: 0, false: 0, NULL: 0 },
                DPV: { true: 0, false: 0, NULL: 0 }
            };

            // Función auxiliar para normalizar etiquetas y sumar los valores de un campo
            function addFields(target, source) {
                for (let key in source) {
                    if (source.hasOwnProperty(key)) {
                        // Normalizar etiquetas
                        let normalizedKey = key.toLowerCase();

                        // Convertir 'sin categoría' y similares a una forma unificada
                        if (normalizedKey === 'sin categoría' || normalizedKey === 'sin categoria') {
                            normalizedKey = 'Sin Categoría';
                        }

                        if (!target[normalizedKey]) {
                            target[normalizedKey] = 0;
                        }
                        target[normalizedKey] += source[key];
                    }
                }
            }

            // Iteramos sobre cada resultado
            for (const result of results) {
                if (result && result.length > 0) {
                    const data = result[0];

                    // Sumamos el total de inmuebles
                    combined.totalInmuebles += data.totalInmuebles;

                    // Sumamos los valores de responsables, categorías, zonas y estados booleanos
                    addFields(combined.responsables, data.responsables);
                    addFields(combined.categorias, data.categorias);
                    addFields(combined.zonas, data.zonas);
                    addFields(combined.noticiastate, data.noticiastate);
                    addFields(combined.encargostate, data.encargostate);
                    addFields(combined.localizado, data.localizado);
                    addFields(combined.DPV, data.DPV);
                }
            }

            // Retornamos el resultado combinado en un array como en los resultados originales
            return [combined];
        }

        // escribe contrabarra
        const newresults = [];

        // Include result1 and result2 unconditionally
        newresults.push(result1);
        newresults.push(result2);

        // Include result3 only if tipo is not 'undefined' and not equal to '2'
        if (tipo !== '2') {
            newresults.push(result3); // {{ edit_1 }}
        }

        // Include result4 and result5 unconditionally
        newresults.push(result4);
        newresults.push(result5);


        const finalResultAnalytics = combineResults(newresults);

        console.log('\nFINAL RESULTS', finalResultAnalytics);



        console.timeEnd("Fetch Duration");

        res.status(200).json({ totalPages, currentPage: page, results: finalResults, analyitics: finalResultAnalytics });
    } catch (e) {
        console.error('API Error:', e.message, e.stack);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}