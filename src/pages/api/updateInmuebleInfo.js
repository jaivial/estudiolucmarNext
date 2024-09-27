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

            // Update the document
            const result = await db.collection('inmuebles').updateOne(
                { id: inmuebleID },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Inmueble not found' });
            }

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
