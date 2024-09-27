import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'POST') {
        const { codeID } = req.query;

        if (!codeID) {
            return res.status(400).json({ message: 'codeID is required' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Fetch the zone with the given code_id
            const zone = await db.collection('map_zones').findOne(
                { code_id: codeID },
                { projection: { zone_name: 1 } }
            );

            if (!zone) {
                return res.status(404).json({ message: 'Zone not found' });
            }

            // Set zona to null for all inmuebles with the matching zona name
            const result = await db.collection('inmuebles').updateMany(
                { zona: zone.zone_name },
                { $set: { zona: null } }
            );

            res.status(200).json({
                message: 'Inmuebles updated successfully',
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
            });
        } catch (error) {
            console.error('Error setting zona to null:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
