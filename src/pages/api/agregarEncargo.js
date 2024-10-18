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

    const {
        encargo_id,
        tipoEncargo,
        comercial,
        cliente,
        precio,
        tipoComision,
        comision,
        fecha,
        comisionCompradorValue,
        comisionComprador,
        tiempoExclusiva,
    } = req.body;

    console.log('encargo_id', encargo_id);

    try {
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Insert into 'encargos' collection
        const encargoResult = await db.collection('encargos').insertOne({
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

        if (encargoResult.insertedCount === 0) {
            throw new Error('Failed to insert encargo');
        }

        // Update 'inmuebles' collection
        let inmueblesResult = await db.collection('inmuebles').updateOne(
            { id: parseInt(encargo_id, 10) },
            { $set: { encargostate: true } }
        );

        // If the main property was not updated, search for the nested ones
        if (inmueblesResult.modifiedCount === 0) {
            // Try to update nestedinmuebles inside documents with tipoagrupacion == 2
            inmueblesResult = await db.collection('inmuebles').updateOne(
                {
                    tipoagrupacion: 2,
                    "nestedinmuebles.id": parseInt(encargo_id, 10)
                },
                { $set: { "nestedinmuebles.$.encargostate": true } }
            );

            // If still not updated, try to update nestedescaleras.nestedinmuebles inside documents with tipoagrupacion == 2
            if (inmueblesResult.modifiedCount === 0) {
                inmueblesResult = await db.collection('inmuebles').updateOne(
                    {
                        tipoagrupacion: 2,
                        "nestedescaleras.nestedinmuebles.id": parseInt(encargo_id, 10)
                    },
                    { $set: { "nestedescaleras.$[].nestedinmuebles.$[elem].encargostate": true } },
                    { arrayFilters: [{ "elem.id": parseInt(encargo_id, 10) }] }
                );
            }
        }

        // If still not updated, return an error
        if (inmueblesResult.modifiedCount === 0) {
            throw new Error('Failed to update inmuebles or nested property');
        }

        res.status(200).json({ success: 'Record added and encargoState updated successfully' });
    } catch (error) {
        console.error('Error connecting to database:', error);
        res.status(500).json({ error: `Error connecting to database: ${error.message}` });
    }
}
