import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    console.log('Received request:', req.method, req.url);
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    // Extract the user_id from the request body
    const { user_id } = req.body;

    console.log('user_id', user_id);

    // Check if user_id is provided
    if (!user_id) {
        return res.status(400).json({ status: 'failure', message: 'user_id parameter is required' });
    }

    try {
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Fetch user information from 'users' collection
        const user = await db.collection('users').findOne({ user_id: parseInt(user_id) });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ status: 'failure', message: 'User not found' });
        }

        // Construct zone_responsable by concatenating nombre and apellido
        const zoneResponsable = `${user.nombre} ${user.apellido}`.trim();


        // Fetch the zone_name from 'map_zones' collection where zone_responsable matches the constructed value
        const zone = await db.collection('map_zones').findOne({ zone_responsable: zoneResponsable });

        // Check if zone was found and set zonaFinal accordingly
        const zonaFinal = zone && zone.zone_name ? zone.zone_name : 'Sin zona';

        // Send the response
        res.status(200).json({ status: 'success', user, zone_name: zonaFinal });
    } catch (error) {
        console.error('Error fetching user or zone information:', error);
        res.status(500).json({ status: 'failure', message: 'Error fetching user or zone information' });
    }
}
