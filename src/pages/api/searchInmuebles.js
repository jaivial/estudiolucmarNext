import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    try {
        console.time("Fetch Duration");

        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        const { pattern = '', currentPage = 1, itemsPerPage = 10 } = req.query;

        const page = parseInt(currentPage, 10);
        const limit = parseInt(itemsPerPage, 10);
        const skip = (page - 1) * limit;

        // Build the query object to match the pattern in the desired fields
        const query = pattern
            ? {
                $or: [
                    { direccion: { $regex: pattern, $options: 'i' } },
                    { nestedinmuebles: { $elemMatch: { direccion: { $regex: pattern, $options: 'i' } } } },
                    { 'nestedescaleras.nestedinmuebles': { $elemMatch: { direccion: { $regex: pattern, $options: 'i' } } } }
                ]
            }
            : {};

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

        // Count the total number of matching documents
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

        res.status(200).json({ totalPages, currentPage: page, results: finalResults });
    } catch (e) {
        console.error('API Error:', e.message, e.stack);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}