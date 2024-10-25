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

            const inmuebleIdInt = parseInt(inmuebleId);

            // Update nested objects within 'inmuebles' collection
            await db.collection('inmuebles').updateMany(
                {
                    $or: [
                        { 'nestedinmuebles.id': inmuebleIdInt },
                        { 'nestedescaleras.nestedinmuebles.id': inmuebleIdInt }
                    ]
                },
                {
                    $set: {
                        'nestedinmuebles.$[elem].localizado': false,
                        'nestedinmuebles.$[elem].localizado_phone': '',
                        'nestedinmuebles.$[elem].client_id': '',
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].localizado': false,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].localizado_phone': '',
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].client_id': '',
                    }
                },
                {
                    arrayFilters: [
                        { 'elem.id': inmuebleIdInt },
                        { 'escalera.nestedinmuebles': { $exists: true } }
                    ]
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
