import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'PUT') {
        const {
            inmuebleID,
            direccion,
            tipo,
            uso,
            superficie,
            ano_construccion,
            categoria,
            coordinates,
            location,
            habitaciones,
            banyos,
            garaje,
            ascensor,
            trastero,
            jardin,
            terraza,
            aireacondicionado
        } = req.body;

        if (!inmuebleID) {
            return res.status(400).json({ message: 'Missing inmuebleID' });
        }

        // Prepare the update document
        const updateData = {
            direccion: direccion || null,
            tipo: tipo || null,
            uso: uso || null,
            superficie: superficie !== undefined ? superficie : null,
            ano_construccion: ano_construccion !== undefined ? ano_construccion : null,
            categoria: categoria || null,
            coordinates: coordinates || null,
            location: location || null,
            habitaciones: habitaciones !== undefined ? parseInt(habitaciones, 10) : null,
            banyos: banyos !== undefined ? parseInt(banyos, 10) : null,
            garaje: garaje || false,
            ascensor: ascensor || false,
            trastero: trastero || false,
            jardin: jardin || false,
            terraza: terraza || false,
            aireacondicionado: aireacondicionado || false
        };

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');
            const inmuebleIdInt = parseInt(inmuebleID);

            // Update the main document if it directly matches 'inmuebleID'
            const result = await db.collection('inmuebles').updateOne(
                { id: inmuebleIdInt },
                { $set: updateData }
            );



            // Update properties in nestedinmuebles array
            await db.collection('inmuebles').updateMany(
                { 'nestedinmuebles.id': inmuebleIdInt },
                {
                    $set: {
                        'nestedinmuebles.$[elem].direccion': direccion || null,
                        'nestedinmuebles.$[elem].tipo': tipo || null,
                        'nestedinmuebles.$[elem].uso': uso || null,
                        'nestedinmuebles.$[elem].superficie': superficie !== undefined ? superficie : null,
                        'nestedinmuebles.$[elem].ano_construccion': ano_construccion !== undefined ? ano_construccion : null,
                        'nestedinmuebles.$[elem].categoria': categoria || null,
                        'nestedinmuebles.$[elem].coordinates': coordinates || null,
                        'nestedinmuebles.$[elem].location': location || null,
                        'nestedinmuebles.$[elem].habitaciones': habitaciones !== undefined ? parseInt(habitaciones, 10) : null,
                        'nestedinmuebles.$[elem].banyos': banyos !== undefined ? parseInt(banyos, 10) : null,
                        'nestedinmuebles.$[elem].garaje': garaje || false,
                        'nestedinmuebles.$[elem].ascensor': ascensor || false,
                        'nestedinmuebles.$[elem].trastero': trastero || false,
                        'nestedinmuebles.$[elem].jardin': jardin || false,
                        'nestedinmuebles.$[elem].terraza': terraza || false,
                        'nestedinmuebles.$[elem].aireacondicionado': aireacondicionado || false
                    }
                },
                {
                    arrayFilters: [{ 'elem.id': inmuebleIdInt }]
                }
            );

            // Update properties in nestedescaleras.nestedinmuebles array
            await db.collection('inmuebles').updateMany(
                { 'nestedescaleras.nestedinmuebles.id': inmuebleIdInt },
                {
                    $set: {
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].direccion': direccion || null,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].tipo': tipo || null,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].uso': uso || null,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].superficie': superficie !== undefined ? superficie : null,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].ano_construccion': ano_construccion !== undefined ? ano_construccion : null,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].categoria': categoria || null,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].coordinates': coordinates || null,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].location': location || null,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].habitaciones': habitaciones !== undefined ? parseInt(habitaciones, 10) : null,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].banyos': banyos !== undefined ? parseInt(banyos, 10) : null,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].garaje': garaje || false,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].ascensor': ascensor || false,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].trastero': trastero || false,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].jardin': jardin || false,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].terraza': terraza || false,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].aireacondicionado': aireacondicionado || false
                    }
                },
                {
                    arrayFilters: [
                        { 'escalera.nestedinmuebles': { $exists: true } },
                        { 'elem.id': inmuebleIdInt }
                    ]
                }
            );

            res.status(200).json({ message: 'Inmueble updated successfully' });
        } catch (error) {
            console.error('Error updating inmueble:', error);
            res.status(500).json({ message: 'Error updating inmueble', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
