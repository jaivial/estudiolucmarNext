import cors, { runMiddleware } from '../../utils/cors';
import { v4 as uuidv4 } from 'uuid';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'POST') {
        try {
            console.log('req.body', req.body);

            // Generate unique client_id using uuid
            const clienteData = {
                ...req.body,
                client_id: uuidv4(), // Add a unique client_id to the client
            };

            // Check if informador is true
            if (req.body.informador) {
                const inmuebleId = parseInt(req.body.inmuebleId, 10); // Ensure inmuebleId is parsed as integer
                const inmuebleDireccion = req.body.inmuebleDireccion;

                // If inmuebles_asociados_informador doesn't exist, initialize it
                clienteData.inmuebles_asociados_informador = clienteData.inmuebles_asociados_informador || [];

                // Push new object to the inmuebles_asociados_informador array
                clienteData.inmuebles_asociados_informador.push({
                    id: inmuebleId,
                    direccion: inmuebleDireccion,
                });
            }

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
