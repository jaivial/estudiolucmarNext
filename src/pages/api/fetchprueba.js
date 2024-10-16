import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import getConnection from "../../lib/db.js";

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    try {
        // Connect to the MongoDB client
        const client = await getConnection();
        const db = client.db('inmoprocrm'); // Use the correct database name

        // Query the 'inmuebles' collection to select only the 'direccion' field, limit to 10 results
        const results = await db.collection('inmuebles')
            .find({}, { projection: { direccion: 1, _id: 0 } })
            .limit(10)
            .toArray();

        // Return the results as JSON
        res.status(200).json(results);
    } catch (e) {
        console.error('API Error:', e.message, e.stack);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}
