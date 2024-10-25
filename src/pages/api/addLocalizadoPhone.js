import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'POST') {
        try {
            const { inmuebleId, telefono, client_id } = req.body;
            const parsedtelefono = parseInt(telefono);
            console.log('inmuebleId', inmuebleId);
            console.log('telefono', telefono);
            console.log('client_id', client_id);

            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            const inmuebleIdInt = parseInt(inmuebleId);

            // Update the main 'inmuebles' document if it matches 'inmuebleId'
            await db.collection('inmuebles').updateOne(
                { id: inmuebleIdInt },
                {
                    $set: {
                        localizado: true,
                        localizado_phone: parsedtelefono,
                        client_id: client_id,
                    },
                }
            );

            // Update nestedinmuebles within 'inmuebles' collection
            await db.collection('inmuebles').updateMany(
                { 'nestedinmuebles.id': inmuebleIdInt },
                {
                    $set: {
                        'nestedinmuebles.$[elem].localizado': true,
                        'nestedinmuebles.$[elem].localizado_phone': parsedtelefono,
                        'nestedinmuebles.$[elem].client_id': client_id,
                    }
                },
                {
                    arrayFilters: [{ 'elem.id': inmuebleIdInt }]
                }
            );

            // Update nestedinmuebles within nestedescaleras in 'inmuebles' collection
            await db.collection('inmuebles').updateMany(
                { 'nestedescaleras.nestedinmuebles.id': inmuebleIdInt },
                {
                    $set: {
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].localizado': true,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].localizado_phone': parsedtelefono,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].client_id': client_id,
                    }
                },
                {
                    arrayFilters: [
                        { 'escalera.nestedinmuebles': { $exists: true } },
                        { 'elem.id': inmuebleIdInt }
                    ]
                }
            );

            res.status(200).json({ message: 'Teléfono localizado con éxito' });
        } catch (error) {
            console.error('Error al localizar teléfono:', error);
            res.status(500).json({ message: 'Error al localizar teléfono', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
