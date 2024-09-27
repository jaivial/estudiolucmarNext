import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            const clientes = await db.collection('clientes').find({}).toArray();

            res.status(200).json({ status: 'success', clientes });
        } catch (error) {
            console.error('Error fetching clientes:', error);
            res.status(500).json({ status: 'failure', message: 'Error fetching clientes' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
