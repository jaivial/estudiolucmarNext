// pages/api/fetchAllZones.js

import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            // Fetch all documents from the 'map_zones' collection
            const zones = await db.collection('map_zones').find({}).toArray();

            // Map the MongoDB documents to the desired format
            const formattedZones = zones.map(zone => ({
                id: zone.id,
                zone_name: zone.zone_name,
                color: zone.color,
                zone_responsable: zone.zone_responsable,
                latlngs: zone.latlngs,
                code_id: zone.code_id,
            }));

            // Return the zones data as a JSON response
            res.status(200).json(formattedZones);
        } catch (error) {
            console.error('Error fetching zones:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
