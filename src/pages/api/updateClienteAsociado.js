import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const editCliente = req.body;
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');
            const { _id, ...updateData } = editCliente;

            const response = await db.collection('clientes').updateOne(
                { _id: new ObjectId(_id) },
                { $set: updateData }
            );

            if (response.modifiedCount === 1) {
                res.status(200).json({ status: 'success', message: 'Cliente actualizado con éxito' });
            } else {
                res.status(404).json({ status: 'fail', message: 'Cliente no encontrado o datos no modificados' });
            }
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            res.status(500).json({ status: 'error', message: 'Error al actualizar cliente', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
