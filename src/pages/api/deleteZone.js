// pages/api/deleteZone.js

import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { zoneCodeId } = req.query; // Assuming ID is passed as query parameter

            // Connect to MongoDB
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            // Delete the zone from the 'map_zones' collection
            const result = await db.collection('map_zones').deleteOne({ code_id: zoneCodeId });

            // Check if the deletion was successful
            const success = result.deletedCount > 0;

            // Send JSON response back to the frontend
            res.status(200).json({ success });
        } catch (error) {
            console.error('Error deleting zone:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
