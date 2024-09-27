import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    const { _id } = req.query;

    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        // Query to select all fields from the document where _id matches
        const document = await db.collection('clientes').findOne({ _id: new ObjectId(_id) });

        // Return the document
        res.status(200).json(document);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}