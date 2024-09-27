import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { orphanIds } = req.body;

    if (!orphanIds || !Array.isArray(orphanIds) || orphanIds.length === 0) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        for (const orphanId of orphanIds) {
            // Delete inmuebles with tipoagrupacion = 2
            await db.collection('inmuebles').deleteMany({
                id: orphanId,
                tipoagrupacion: 2
            });

            // Delete inmuebles nested in nestedescaleras
            await db.collection('inmuebles').updateMany(
                {},
                {
                    $pull: {
                        nestedescaleras: {
                            id: orphanId // Target the id of the nestedescalera object
                        }
                    }
                }
            );
        }

        res.status(200).json({ status: 'success', message: 'Orphans deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error' });
    }
}