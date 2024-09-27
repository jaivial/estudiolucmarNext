import { v4 as uuidv4 } from 'uuid';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {

            console.log('req.body', req.body);
            // Genera un client_id único usando uuid
            const clienteData = {
                ...req.body,
                client_id: uuidv4(), // Añade un client_id único al cliente
            };

            const result = await addCliente(clienteData);
            res.status(201).json({ message: 'Cliente agregado con éxito', clienteId: result.insertedId });
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            res.status(500).json({ message: 'Error al agregar cliente', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

const addCliente = async (clienteData) => {
    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');
        const result = await db.collection('clientes').insertOne(clienteData);
        return result;
    } catch (error) {
        console.error('Error adding cliente:', error);
        throw new Error('Failed to add cliente');
    }
};
