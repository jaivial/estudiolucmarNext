import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') { // Change to POST since it's a logout action
        try {
            const { user_id, session_id } = req.body; // Get user_id and session_id from the request body
            console.log('user_id', user_id);
            console.log('session_id', session_id);

            // Ensure both user_id and session_id are provided
            if (!user_id || !session_id) {
                return res.status(400).json({ status: 'failure', message: 'Missing user_id or session_id' });
            }

            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Remove all documents that match the user_id and session_id
            const result = await db.collection('active_sessions').deleteMany({
                user_id: parseInt(user_id),
                session_id: session_id
            });

            // Check if the operation deleted any documents
            if (result.deletedCount === 0) {
                return res.status(404).json({ status: 'failure', message: 'No active sessions found' });
            }

            res.status(200).json({ status: 'success', message: 'Logged out successfully' });
        } catch (error) {
            console.error('Error during logout:', error);
            res.status(500).json({ status: 'failure', message: 'Error during logout' });
        }
    } else {
        res.setHeader('Allow', ['POST']); // Only allow POST requests
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}