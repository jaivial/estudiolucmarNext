// pages/api/updateZone.js

import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the default database defined in the MongoDB connection URI

            // Parse the JSON payload sent from the frontend
            const { code_id, latlngs } = req.body;

            // Convert latlngs to the expected format if necessary (e.g., array of objects)
            // Update the document in the map_zones collection with the provided code_id
            const result = await db.collection('map_zones').updateOne(
                { code_id: code_id },
                { $set: { latlngs: latlngs } }
            );

            // Check if the update was successful
            if (result.modifiedCount === 1) {
                res.status(200).json({ success: true });
            } else {
                res.status(404).json({ success: false, message: 'Zone not found or data unchanged' });
            }
        } catch (error) {
            console.error('Error updating zone:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
