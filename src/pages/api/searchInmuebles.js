import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    try {
        console.time("Fetch Duration");

        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        const { pattern = '' } = req.query;

        // Build the query object to match the pattern in the desired fields
        const query = pattern
            ? {
                $or: [
                    { direccion: { $regex: pattern, $options: 'i' } }, // Match pattern in direccion
                    { 'nestedinmuebles.direccion': { $regex: pattern, $options: 'i' } }, // Match pattern in nestedinmuebles.direccion
                    { 'nestedescaleras.nestedinmuebles.direccion': { $regex: pattern, $options: 'i' } } // Match pattern in nestedescaleras.nestedinmuebles.direccion
                ]
            }
            : {};

        // Query the 'inmuebles' collection to find matching documents, ordered by 'direccion' asc, limit to 10 results
        const results = await db.collection('inmuebles')
            .find(query)
            .sort({ direccion: 1 })
            .limit(10)
            .toArray();

        console.timeEnd("Fetch Duration");

        res.status(200).json(results);
    } catch (e) {
        console.error('API Error:', e.message, e.stack);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}
