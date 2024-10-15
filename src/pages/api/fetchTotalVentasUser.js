import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    // Get userID from query parameters
    const { userID } = req.query;

    try {
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Fetch all comisionTotal fields from ventas where asesorID equals userID
        const ventas = await db.collection('ventas').find({ asesorID: parseInt(userID, 10) }, { projection: { comisionTotal: 1 } }).toArray();

        // Sum up all comisionTotal fields
        const ventasTotales = ventas.reduce((total, venta) => total + (venta.comisionTotal || 0), 0);

        // Return the total ventas as response
        res.status(200).json({ status: 'success', ventasTotales });
    } catch (error) {
        console.error('Error fetching ventas:', error);
        res.status(500).json({ status: 'failure', message: 'Error fetching ventas' });
    }
}
