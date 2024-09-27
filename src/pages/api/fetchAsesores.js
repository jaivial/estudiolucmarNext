import cors, { runMiddleware } from '../../utils/cors';
// /pages/api/fetchAsesores.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    try {
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Fetch 'name' and 'apellido' from 'users' collection
        const asesores = await db.collection('users').find({}, { projection: { _id: 0, nombre: 1, apellido: 1 } }).toArray();
        console.log('asesores', asesores);

        // Return the fetched data
        res.status(200).json({ status: 'success', asesores });
    } catch (error) {
        console.error('Error fetching asesores:', error);
        res.status(500).json({ status: 'failure', message: 'Error fetching asesores' });
    }
}
