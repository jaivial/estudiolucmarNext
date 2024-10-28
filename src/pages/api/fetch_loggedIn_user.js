import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);


    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Get the user_id from the query parameters
        const userId = parseInt(req.query.user_id);

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const loggedInUser = await db.collection('users').findOne(
            { user_id: userId },
            { projection: { _id: 1, user_id: 1, nombre: 1, apellido: 1, email: 1, password: 1, admin: 1, profile_photo: 1 } }
        );

        if (!loggedInUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ loggedInUser });
    } catch (error) {
        console.error('Error fetching logged-in user:', error);
        res.status(500).json({ error: 'Failed to fetch the logged-in user' });
    }
}
