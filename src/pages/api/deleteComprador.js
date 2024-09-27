import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'DELETE') {
        const { comprador_id } = req.body;

        if (!comprador_id) {
            return res.status(400).json({ message: 'Falta el ID del comprador' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Update the 'pedido' field to false for the cliente with the given comprador_id
            const updateResult = await db.collection('clientes').updateOne(
                { _id: new ObjectId(comprador_id.toString()) },
                { $set: { pedido: false } }
            );

            if (updateResult.modifiedCount === 1) {
                res.status(200).json({ message: 'Pedido actualizado a falso con éxito' });
            } else {
                res.status(404).json({ message: 'Cliente con el ID de comprador proporcionado no encontrado' });
            }
        } catch (error) {
            console.error('Error actualizando el pedido del cliente:', error);
            res.status(500).json({ message: 'Error actualizando el pedido del cliente', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
