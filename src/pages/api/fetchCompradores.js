import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'GET') {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        try {
            const compradores = await db.collection('compradores').find({}).toArray();
            res.status(200).json(compradores);
        } catch (error) {
            console.error('Error fetching compradores:', error);
            res.status(500).json({ message: 'Error al obtener los compradores', error });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
