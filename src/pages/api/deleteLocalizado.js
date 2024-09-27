import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    const { inmuebleId } = req.query;

    if (req.method === 'DELETE') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Update the main 'inmuebles' collection
            await db.collection('inmuebles').updateMany(
                { $or: [{ id: parseInt(inmuebleId) }, { 'nestedinmuebles.id': parseInt(inmuebleId) }, { 'nestedescaleras.nestedinmuebles.id': parseInt(inmuebleId) }] },
                {
                    $set: {
                        localizado: false,
                        localizado_phone: '',
                        client_id: '',
                    },
                }
            );

            res.status(200).json({ message: 'Localizado eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar el localizado:', error);
            res.status(500).json({ message: 'Error al eliminar el localizado', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}
