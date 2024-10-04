import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    console.log('Received request:', req.method, req.url);
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    // Extract the user_id from the request query
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

        // Fetch all user information from 'users' collection where 'user_id' matches the parameter
        const user = await db.collection('users').findOne({ user_id: parseInt(user_id) });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ status: 'failure', message: 'User not found' });
        }

        // Return the fetched user data
        res.status(200).json({ status: 'success', user });
    } catch (error) {
        console.error('Error fetching user information:', error);
        res.status(500).json({ status: 'failure', message: 'Error fetching user information' });
    }
}
