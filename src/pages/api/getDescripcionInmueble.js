import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { id } = req.query; // Extract 'id' from request body
            const parsedId = parseInt(id);
            console.log('id', parsedId);
            console.log('typeof id', typeof parsedId);

            if (!id) {
                return res.status(400).json({ status: 'error', message: 'Required parameter not set.' });
            }


            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name
            const collection = db.collection('inmuebles');

            // Fetch the document with the given ID
            const inmueble = await collection.findOne({ id: parsedId });

            if (inmueble && inmueble.descripcion) {
                return res.status(200).json({ status: 'success', descripcion: inmueble.descripcion });
            } else {
                return res.status(200).json({ status: 'error', message: 'No description found for the given id.' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Internal Server Error.' });
        }
    } else {
        return res.status(405).json({ status: 'error', message: 'Invalid request method.' });
    }
}
