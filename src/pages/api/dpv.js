import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        const inmuebleId = parseInt(req.query.inmuebleId);

        if (!inmuebleId) {
            return res.status(400).json({ error: 'Inmueble ID is required' });
        }

        const dpvData = await db.collection('dpv').findOne({ inmuebleId });

        if (!dpvData) {
            return res.status(404).json({ error: 'DPV not found' });
        }

        res.status(200).json(dpvData);
    } catch (error) {
        console.error('Error fetching DPV data:', error);
        res.status(500).json({ error: 'Failed to fetch DPV data' });
    }
}