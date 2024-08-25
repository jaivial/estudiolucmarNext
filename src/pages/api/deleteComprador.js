import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { comprador_id } = req.body;

        if (!comprador_id) {
            return res.status(400).json({ message: 'Falta el ID del comprador' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            const result = await db.collection('compradores').deleteOne({ _id: new ObjectId(comprador_id.toString()) });

            if (result.deletedCount === 1) {
                res.status(200).json({ message: 'Comprador eliminado con éxito' });
            } else {
                res.status(404).json({ message: 'Comprador no encontrado' });
            }
        } catch (error) {
            console.error('Error eliminando el comprador:', error);
            res.status(500).json({ message: 'Error eliminando el comprador', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
