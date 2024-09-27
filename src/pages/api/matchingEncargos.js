import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    const { precio_1, precio_2, tipo_encargo } = req.query;

    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        // Determine the interest based on tipo_encargo
        const interest = tipo_encargo === 'Venta' ? 'comprar' : 'alquilar';

        // Use precio_2 if it's available, otherwise use precio_1
        const precio = precio_2 || precio_1;

        // Query to match clients based on the criteria
        const matchingClients = await db.collection('clientes').find({
            pedido: true,
            interes: interest,
            rango_precios: {
                $elemMatch: {
                    $gte: 0, // Assuming the range starts from 0
                    $lte: parseInt(precio, 10)
                }
            }
        }, {
            projection: {
                nombre: 1,
                apellido: 1,
                telefono: 1,
                email: 1,
                client_id: 1
            }
        }).toArray();

        // Return the matching clients
        res.status(200).json(matchingClients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}