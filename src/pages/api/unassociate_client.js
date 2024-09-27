import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    const { inmuebleId, clienteId } = req.body;

    console.log('inmuebleId', inmuebleId);
    console.log('clienteId', clienteId);

    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Convert clienteId to ObjectId for MongoDB operation
        const clienteObjectId = new ObjectId(clienteId);

        // Update the cliente document by pulling the inmuebleId from the arrays
        const updateResult = await db.collection('clientes').updateOne(
            { _id: clienteObjectId },
            {
                $pull: {
                    inmuebles_asociados_propietario: { id: parseInt(inmuebleId) },
                    inmuebles_asociados_inquilino: { id: parseInt(inmuebleId) }
                }
            }
        );

        console.log('updateResult', updateResult);

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'Cliente not found or inmuebleId not associated with this cliente' });
        }

        res.status(200).json({ message: 'Cliente unassociated successfully', status: 'success' });
    } catch (error) {
        console.error('Error unassociating cliente:', error);
        res.status(500).json({ message: 'Error unassociating cliente', error: error.message });
    }
}
