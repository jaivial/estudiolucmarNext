import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb'; // Adjust the path as needed

// Helper function to remove dots from a string and parse it as an integer
const formatToInt = (value) => {
    if (!value) return 0; // Return 0 if value is null or undefined
    const formattedValue = value.replace(/\./g, ''); // Remove dots
    return parseInt(formattedValue, 10); // Parse as integer
};

export default async function handler(req, res) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'PUT') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name
            console.log('req.body', req.body);

            const { estadoDPV, telefono, nombreInmobiliaria, linkInmobiliaria, valoracionEstimada, precioActual, fechaPublicacion, accionDPV, inmuebleId, DPVboolean } = req.body;

            // Update the 'dpv' document with the given inmuebleId
            await db.collection('dpv').updateOne(
                { inmuebleId: inmuebleId }, // Filter by inmuebleId
                {
                    $set: {
                        estadoDPV,
                        telefono,
                        nombreInmobiliaria,
                        linkInmobiliaria,
                        valoracionEstimada: (typeof valoracionEstimada === 'string') ? formatToInt(valoracionEstimada) : valoracionEstimada,
                        precioActual: (typeof precioActual === 'string') ? formatToInt(precioActual) : precioActual, // Format before inserting
                        fechaPublicacion: fechaPublicacion || null,
                        accionDPV,
                        DPVboolean,
                    }
                }
            );

            res.status(200).json({ message: 'DPV data successfully updated' });
        } catch (error) {
            console.error('Error updating DPV data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}