import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'GET') {
        console.log('req.method', req.method);
        try {
            // Extract the parameters from the query string
            const { id, descripcion } = req.query;
            const parsedId = parseInt(id);
            console.log('id', parsedId);
            console.log('typeof id', typeof parsedId);
            console.log('descripcion', descripcion);
            console.log('typeof descripcion', typeof descripcion);

            // Check if required parameters are present
            if (!id || !descripcion) {
                return res.status(400).json({ status: 'error', message: 'Required parameters not set.' });
            }

            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name
            const collection = db.collection('inmuebles');

            console.log('id', parsedId);

            // Update the document where 'id' field matches the provided value
            const result = await collection.updateOne(
                { id: parsedId }, // Filter to find the document by 'id'
                { $set: { descripcion: descripcion } } // Set the new description
            );

            if (result.matchedCount > 0) {
                return res.status(200).json({ status: 'success', message: 'Description updated successfully.' });
            } else {
                return res.status(404).json({ status: 'error', message: 'No document found with the given id.' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: 'error', message: 'Internal Server Error.' });
        }
    } else {
        return res.status(405).json({ status: 'error', message: 'Invalid request method.' });
    }
}
