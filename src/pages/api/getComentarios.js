import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { id } = req.query;
            // Check if the required parameter is set
            if (!id) {
                return res.status(400).json({ success: false, message: 'ID parameter is required.' });
            }

            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name
            const collection = db.collection('comentarios');

            // Fetch comments from the collection where 'comentario_id' matches the provided value
            const comments = await collection.find({ comentario_id: parseInt(id, 10) }).toArray();

            if (comments.length > 0) {
                return res.status(200).json({ success: true, comments: comments });
            } else {
                return res.status(200).json({ success: false, message: 'No comments found for the given ID.' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, message: 'Internal Server Error.' });
        }
    } else {
        return res.status(405).json({ success: false, message: 'Invalid request method.' });
    }
}
