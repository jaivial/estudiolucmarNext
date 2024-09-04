import clientPromise from '../../lib/mongodb'; // Adjust the path as needed
export default async function handler(req, res) {
    if (req.method === 'PUT') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            const { estadoDPV, telefono, nombreInmobiliaria, linkInmobiliaria, evaluacionEstimada, inmuebleId } = req.body;

            // Update the 'dpv' document with the given inmuebleId
            await db.collection('dpv').updateOne(
                { inmuebleId: inmuebleId }, // Filter by inmuebleId
                {
                    $set: {
                        estadoDPV,
                        telefono,
                        nombreInmobiliaria,
                        linkInmobiliaria,
                        evaluacionEstimada
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