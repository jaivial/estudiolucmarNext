import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'DELETE') {
        try {
            const { zoneCodeId } = req.body; // Extract zoneCodeId from the body of the DELETE request

            // Connect to MongoDB
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            // Delete the zone from the 'map_zones' collection
            const result = await db.collection('map_zones').deleteOne({ code_id: zoneCodeId });

            // Check if the deletion was successful
            const success = result.deletedCount > 0;

            // Send JSON response back to the frontend
            res.status(200).json({ success });
        } catch (error) {
            console.error('Error deleting zone:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
