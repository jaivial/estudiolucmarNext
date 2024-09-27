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

    const { encargo_id, tipoEncargo, comercial, cliente, precio, tipoComision, comision, fecha } = req.body;

    console.log('encargo_id', encargo_id);
    console.log('tipoEncargo', tipoEncargo);
    console.log('comercial', comercial);
    console.log('cliente', cliente);
    console.log('precio', precio);
    console.log('tipoComision', tipoComision);
    console.log('comision', comision);
    console.log('fecha', fecha);


    try {
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Start a session for transaction
        const session = client.startSession();
        session.startTransaction();

        try {
            // Insert into 'encargos' collection
            await db.collection('encargos').insertOne({
                encargo_id: parseInt(encargo_id, 10),
                encargo_fecha: fecha,
                comercial_encargo: comercial,
                tipo_encargo: tipoEncargo,
                comision_encargo: parseInt(comision, 10),
                cliente_id: parseInt(cliente, 10),
                precio_1: parseInt(precio, 10),
                tipo_comision_encargo: tipoComision
            }, { session });

            // Update 'inmuebles' collection
            await db.collection('inmuebles').updateOne(
                { id: parseInt(encargo_id, 10) },
                { $set: { encargostate: true } },
                { session }
            );

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ success: 'Record added and encargoState updated successfully' });
        } catch (error) {
            // Abort transaction on error
            await session.abortTransaction();
            session.endSession();
            console.error('Error in transaction:', error);
            res.status(500).json({ error: 'Transaction failed: ' + error.message });
        }
    } catch (error) {
        console.error('Error connecting to database:', error);
        res.status(500).json({ error: 'Error connecting to database' });
    }
}
