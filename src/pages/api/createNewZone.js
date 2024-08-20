import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            // Assuming JSON payload is sent from the React frontend
            const { code_id, zone_name, color, zone_responsable, latlngs } = req.body;

            // Connect to MongoDB
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            // Find the highest id in the map_zones collection
            const highestIdZone = await db.collection('map_zones')
                .find({})
                .sort({ id: -1 })  // Sort by id in descending order
                .limit(1)           // Get the document with the highest id
                .toArray();

            // Determine the new id
            const newId = highestIdZone.length > 0 ? highestIdZone[0].id + 1 : 1;

            // Insert the new zone into the map_zones collection
            const result = await db.collection('map_zones').insertOne({
                id: newId,  // Assign the new id
                code_id: code_id,
                zone_name: zone_name,
                color: color,
                zone_responsable: zone_responsable,
                latlngs: latlngs, // Directly store the latlngs as an array
            });

            // Check if the insertion was successful
            const success = result.insertedId ? true : false;

            // Return the success status as a JSON response
            res.status(200).json({ success });
        } catch (error) {
            console.error('Error creating new zone:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
