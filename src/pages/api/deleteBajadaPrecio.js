import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'DELETE') {
        try {
            // Connect to MongoDB
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Get the encargo_ID from the request body
            const { encargo_ID } = req.body;

            // Delete the precio_2 field from the document in the 'encargos' collection
            const result = await db.collection('encargos').updateOne(
                { encargo_id: parseInt(encargo_ID) },
                { $unset: { precio_2: "" } }
            );

            // Check if the update was successful
            if (result.modifiedCount > 0) {
                res.status(200).json({ success: true });
            } else {
                res.status(500).json({ success: false, message: 'Error deleting precio_2' });
            }
        } catch (error) {
            console.error('Error deleting precio_2:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
