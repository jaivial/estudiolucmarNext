import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    const { inmuebleId } = req.query;

    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Fetch data from 'inmuebles' collection
        const inmuebleData = await db.collection('inmuebles').findOne({ id: parseInt(inmuebleId) }, { projection: { client_id: 1 } });

        let clientData = null;
        if (inmuebleData && inmuebleData.client_id) {
            clientData = await db.collection('clientes').findOne({ client_id: inmuebleData.client_id }, { projection: { nombre: 1, apellido: 1, telefono: 1, tipo_de_cliente: 1, client_id: 1, inmuebles_asociados_inquilino: 1, inmuebles_asociados_copropietario: 1, inmuebles_asociados_propietario: 1, inmuebles_asociados_informador: 1 } });
        }

        if (clientData) {
            res.status(200).json({
                clientData,
            });
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el teléfono localizado:', error);
        res.status(500).json({ message: 'Error al obtener el teléfono localizado', error: error.message });
    }
}
