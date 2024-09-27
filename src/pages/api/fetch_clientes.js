import cors, { runMiddleware } from '../../utils/cors';
// /pages/api/fetch_clientes.js

import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');
            const clientes = await db.collection('clientes').find({}).toArray(); // Fetch all clients

            res.status(200).json(clientes);
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
