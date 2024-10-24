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


    if (req.method === 'POST') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            const { estadoDPV, telefono, nombreInmobiliaria, linkInmobiliaria, valoracionEstimada, inmuebleId, precioActual, fechaPublicacion, accionDPV, DPVboolean } = req.body;
            console.log('DPVInfo', req.body);

            // Insert data into the 'dpv' collection
            await db.collection('dpv').insertOne({
                estadoDPV,
                telefono,
                nombreInmobiliaria,
                linkInmobiliaria,
                valoracionEstimada: formatToInt(valoracionEstimada), // Format before inserting
                precioActual: formatToInt(precioActual), // Format before inserting
                fechaPublicacion: fechaPublicacion || null,
                accionDPV,
                inmuebleId,
                DPVboolean
            });

            // Update the 'dpv' document with the given inmuebleId
            await db.collection('inmuebles').updateOne(
                { id: inmuebleId }, // Filter by inmuebleId
                { $set: { DPV: true } } // Set estadoDPV to true
            );

            res.status(200).json({ message: 'DPV data successfully uploaded' });
        } catch (error) {
            console.error('Error uploading DPV data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
