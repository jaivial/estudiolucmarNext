// pages/api/encargosFetch.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use your actual database name

            const { id } = req.query;

            console.log('id encargosFetch', id);

            if (!id) {
                return res.status(400).json({ error: 'ID parameter is missing' });
            }

            // Convert id to integer
            const numericId = parseInt(id, 10);

            // Fetch the document from the 'encargos' collection
            const encargo = await db.collection('encargos').findOne({ encargo_id: numericId });


            // Return the document as JSON
            res.status(200).json(encargo);
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
