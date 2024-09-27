// /pages/api/seleccionaClienteEncargos.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        // Only allow GET requests
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Fetch all documents from the 'clientes' collection
        const clientes = await db.collection('clientes')
            .find({}, { projection: { _id: 0, nombre: 1, apellido: 1, client_id: 1 } })
            .toArray();

        // Transform the data
        const result = clientes.map(cliente => ({
            nombrecompleto_cliente: `${cliente.nombre} ${cliente.apellido}`,
            id: cliente.client_id
        }));

        // Return the fetched data
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching clientes:', error);
        res.status(500).json({ error: 'Error fetching clientes' });
    }
}
