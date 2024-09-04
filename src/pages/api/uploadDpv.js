import clientPromise from '../../lib/mongodb'; // Adjust the path as needed

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            const { estadoDPV, telefono, nombreInmobiliaria, linkInmobiliaria, evaluacionEstimada, inmuebleId } = req.body;

            // Insert data into the 'dpv' collection
            await db.collection('dpv').insertOne({
                estadoDPV,
                telefono,
                nombreInmobiliaria,
                linkInmobiliaria,
                evaluacionEstimada,
                inmuebleId
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
