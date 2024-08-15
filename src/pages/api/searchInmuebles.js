import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    try {
        console.time("Fetch Duration");

        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        const { pattern = '', currentPage = 1, itemsPerPage = 10, selectedZone = '', selectedCategoria = '', selectedResponsable = '', filterNoticia = null, filterEncargo = null, superficieMin = 0, superficieMax = 20000, yearMin = 1800, yearMax = new Date().getFullYear(), localizado = null, garaje = null, aireacondicionado = null, ascensor = null, trastero = null, jardin = null, terraza = null, tipo, banos, habitaciones } = req.query;
        const tipoValue = tipo === 'undefined' ? null : tipo;
        const banosValue = banos === 'undefined' ? null : banos;
        const habitacionesValue = habitaciones === 'undefined' ? null : habitaciones;
        console.log('tipoValue', tipoValue);
        const page = parseInt(currentPage, 10);
        const limit = parseInt(itemsPerPage, 10);
        const skip = (page - 1) * limit;

        // Build the query object to match the pattern in the desired fields
        const query = {
            $or: [
                { direccion: { $regex: pattern, $options: 'i' } },
                { nestedinmuebles: { $elemMatch: { direccion: { $regex: pattern, $options: 'i' } } } },
                { 'nestedescaleras.nestedinmuebles': { $elemMatch: { direccion: { $regex: pattern, $options: 'i' } } } }
            ],
            $and: [
                { zona: { $regex: selectedZone, $options: 'i' } },
                // If selectedCategoria is not empty, filter by categoria
                ...(selectedCategoria ? [{ categoria: { $eq: selectedCategoria } }] : []),
                // If selectedResponsable is not empty, filter by responsable
                ...(selectedResponsable ? [{ responsable: { $regex: selectedResponsable, $options: 'i' } }] : []),
                // If filterNoticia is not null, filter by noticiastate
                ...(filterNoticia !== null ? [{ noticiastate: filterNoticia === 'true' ? true : filterNoticia === 'false' ? false : { $exists: true } }] : []),
                // If filterEncargo is not null, filter by encargostate
                ...(filterEncargo !== null ? [{ encargostate: filterEncargo === 'true' ? true : filterEncargo === 'false' ? false : { $exists: true } }] : []),
                // If superficieMin and superficieMax are not null, filter by superficie
                ...(superficieMin !== null && superficieMax !== null ? [{ superficie: { $gte: parseInt(superficieMin, 10), $lte: parseInt(superficieMax, 10) } }] : []),
                { ano_construccion: { $gte: parseInt(yearMin, 10), $lte: parseInt(yearMax, 10) } },
                // If localizado is not null, filter by localizado
                ...(localizado !== null ? [{ localizado: localizado === 'true' ? true : localizado === 'false' ? false : { $exists: true } }] : []),
                // If garaje is not null, filter by garaje
                ...(garaje !== null ? [{ garaje: garaje === 'true' ? true : garaje === 'false' ? false : { $exists: true } }] : []),
                // If aireacondicionado is not null, filter by aireacondicionado
                ...(aireacondicionado !== null ? [{ aireacondicionado: aireacondicionado === 'true' ? true : aireacondicionado === 'false' ? false : { $exists: true } }] : []),
                // If ascensor is not null, filter by ascensor
                ...(ascensor !== null ? [{ ascensor: ascensor === 'true' ? true : ascensor === 'false' ? false : { $exists: true } }] : []),
                // If trastero is not null, filter by trastero
                ...(trastero !== null ? [{ trastero: trastero === 'true' ? true : trastero === 'false' ? false : { $exists: true } }] : []),
                // If jardin is not null, filter by jardin
                ...(jardin !== null ? [{ jardin: jardin === 'true' ? true : jardin === 'false' ? false : { $exists: true } }] : []),
                // If terraza is not null, filter by terraza
                ...(terraza !== null ? [{ terraza: terraza === 'true' ? true : terraza === 'false' ? false : { $exists: true } }] : []),

                // Add exists check for tipoValue
                ...(tipoValue !== null ? [{ tipoagrupacion: tipoValue }, { tipoagrupacion: { $exists: true } }] : []),
                // If banos is not null, filter by banos
                ...(banosValue !== null ? [{ banyos: parseInt(banosValue, 10) }] : []),
                // If habitaciones is not null, filter by habitaciones
                ...(habitacionesValue !== null ? [{ habitaciones: parseInt(habitacionesValue, 10) }] : []),

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

        // Count total items with tipoagrupacion = 1 from all documents that match the query
        const totalTipoAgrupacionCount = await db.collection('inmuebles').countDocuments({
            ...query,
            tipoagrupacion: 1 // Add the condition for tipoagrupacion = 1
        });

        // Query the 'inmuebles' collection to find matching documents, ordered by 'direccion' asc, with pagination
        const results = await db.collection('inmuebles')
            .find(query)
            .project(projection)
            .sort({ direccion: 1 })
            .skip(skip)
            .limit(limit)
            .toArray();


        // Check for conflict situation and return full element if condition is met
        const finalResults = results.map(result => {
            if (result.tipoagrupacion === 2 && new RegExp(pattern, 'i').test(result.direccion)) {
                return result;
            }

            const nestedInmueblesMatch = Array.isArray(result.nestedinmuebles) && result.nestedinmuebles.some(inmueble => new RegExp(pattern, 'i').test(inmueble.direccion));
            const nestedEscalerasMatch = Array.isArray(result.nestedescaleras) && result.nestedescaleras.some(escalera => new RegExp(pattern, 'i').test(escalera.direccion) || (Array.isArray(escalera.nestedinmuebles) && escalera.nestedinmuebles.some(inmueble => new RegExp(pattern, 'i').test(inmueble.direccion))));

            if (nestedInmueblesMatch && !nestedEscalerasMatch) {
                return {
                    ...result,
                    nestedinmuebles: result.nestedinmuebles.filter(inmueble => new RegExp(pattern, 'i').test(inmueble.direccion)),
                    nestedescaleras: []
                };
            }

            if (nestedEscalerasMatch && !nestedInmueblesMatch) {
                return {
                    ...result,
                    nestedinmuebles: [],
                    nestedescaleras: result.nestedescaleras.map(escalera => ({
                        ...escalera,
                        nestedinmuebles: Array.isArray(escalera.nestedinmuebles) ? escalera.nestedinmuebles.filter(inmueble => new RegExp(pattern, 'i').test(inmueble.direccion)) : escalera.nestedinmuebles
                    })).filter(escalera => new RegExp(pattern, 'i').test(escalera.direccion) || escalera.nestedinmuebles.length > 0)
                };
            }

            // Apply filtering to nestedinmuebles and nestedescaleras if not in conflict situation
            return {
                ...result,
                nestedinmuebles: Array.isArray(result.nestedinmuebles) ? result.nestedinmuebles.filter(inmueble => new RegExp(pattern, 'i').test(inmueble.direccion)) : result.nestedinmuebles,
                nestedescaleras: Array.isArray(result.nestedescaleras) ? result.nestedescaleras.map(escalera => ({
                    ...escalera,
                    nestedinmuebles: Array.isArray(escalera.nestedinmuebles) ? escalera.nestedinmuebles.filter(inmueble => new RegExp(pattern, 'i').test(inmueble.direccion)) : escalera.nestedinmuebles
                })) : result.nestedescaleras
            };
        });




        console.timeEnd("Fetch Duration");


        res.status(200).json({ totalPages, currentPage: page, results: finalResults, totalTipoAgrupacionCount });
    } catch (e) {
        console.error('API Error:', e.message, e.stack);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}