import cors, { runMiddleware } from '../../utils/cors';
// /pages/api/agregarEncargo.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);


    if (req.method !== 'POST') {
        // Only allow POST requests
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    console.log(req.body);

    const { encargo_id, tipoEncargo, comercial, cliente, precio, tipoComision, comision, fecha, comisionCompradorValue, comisionComprador, tiempoExclusiva } = req.body;

    console.log('encargo_id', encargo_id);
    console.log('tipoEncargo', tipoEncargo);
    console.log('comercial', comercial);
    console.log('cliente', cliente);
    console.log('precio', precio);
    console.log('tipoComision', tipoComision);
    console.log('comision', comision);
    console.log('fecha', fecha);
    console.log('comisionCompradorValue', comisionCompradorValue);
    console.log('comisionComprador', comisionComprador);
    console.log('tiempoExclusiva', tiempoExclusiva);


    try {
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Insert into 'encargos' collection
        await db.collection('encargos').insertOne({
            encargo_id: parseInt(encargo_id, 10),
            encargo_fecha: fecha,
            comercial_encargo: comercial,
            tipo_encargo: tipoEncargo,
            comision_encargo: parseInt(comision, 10),
            cliente_id: cliente,
            fullCliente: cliente,
            precio_1: parseInt(precio, 10),
            tipo_comision_encargo: tipoComision,
            comisionComprador: comisionComprador,
            comisionCompradorValue: parseInt(comisionCompradorValue, 10),
            tiempo_exclusiva: tiempoExclusiva,
        });

        // Update 'inmuebles' collection
        await db.collection('inmuebles').updateOne(
            { id: parseInt(encargo_id, 10) },
            { $set: { encargostate: true } }
        );

        // Update 'inmuebles.nestedinmuebles' collection
        await db.collection('inmuebles.nestedinmuebles').updateOne(
            { id: parseInt(encargo_id, 10) },
            { $set: { encargostate: true } }
        );

        // Update 'inmuebles.nestedescaleras.nestedinmuebles' collection
        await db.collection('inmuebles.nestedescaleras.nestedinmuebles').updateOne(
            { id: parseInt(encargo_id, 10) },
            { $set: { encargostate: true } }
        );

        res.status(200).json({ success: 'Record added and encargoState updated successfully' });
    } catch (error) {
        console.error('Error connecting to database:', error);
        res.status(500).json({ error: 'Error connecting to database' });
    }
}
