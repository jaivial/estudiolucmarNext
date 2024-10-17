import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'GET') {
        const { inmuebleID } = req.query; // Extract inmuebleID from query parameters

        if (!inmuebleID) {
            return res.status(400).json({ message: 'inmuebleID is required' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Fetch transactions with the matching inmuebleID from the 'ventas' collection
            const transacciones = await db.collection('ventas').find({ inmuebleID: parseInt(inmuebleID) }).toArray();

            if (transacciones.length === 0) {
                return res.status(404).json({ message: 'No transactions found for this inmuebleID' });
            }

            res.status(200).json({ transacciones });
        } catch (error) {
            console.error('Error fetching transactions:', error);
            res.status(500).json({ message: 'Error fetching transactions', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
