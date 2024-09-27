import cors, { runMiddleware } from '../../utils/cors';
// /pages/api/actualizarEncargo.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method !== 'POST') {
        // Only allow POST requests
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { encargo_id, fecha, comercial, tipoEncargo, comision, cliente, precio, tipoComision, fullCliente } = req.body;

    console.log('encargo_id', encargo_id);
    console.log('fecha', fecha);
    console.log('comercial', comercial);
    console.log('tipoEncargo', tipoEncargo);
    console.log('comision', comision);
    console.log('cliente', cliente);
    console.log('precio', precio);
    console.log('tipoComision', tipoComision);


    if (isNaN(parseInt(encargo_id))) {
        console.error('Invalid encargo_id:', encargo_id);
        return res.status(400).json({ success: false, message: 'ID must be a valid integer' });
    }

    try {
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Update the document in the 'encargos' collection
        const result = await db.collection('encargos').updateOne(
            { encargo_id: encargo_id },
            {
                $set: {
                    encargo_fecha: fecha,
                    comercial_encargo: comercial.value,
                    tipo_encargo: tipoEncargo,
                    comision_encargo: parseInt(comision, 10),
                    cliente_id: parseInt(cliente, 10),
                    precio_1: parseInt(precio, 10),
                    tipo_comision_encargo: tipoComision,
                    fullCliente: fullCliente
                }
            }
        );

        console.log('result', result);
        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Encargo not found or no changes made' });
        }

        // Respond with success message
        res.status(200).json({ success: true, message: 'Registro actualizado correctamente' });
    } catch (error) {
        console.error('Error updating encargo:', error);
        res.status(500).json({ success: false, message: 'Error actualizando registro' });
    }
}
