import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);


    if (req.method === 'POST') {
        try {
            const { id, completed } = req.body;

            // Check if the required parameters are set
            if (!id || typeof completed !== 'boolean') {
                return res.status(400).json({ success: false, message: 'Comment ID and completed status are required.' });
            }

            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            // Convert the id to an ObjectId
            const commentId = new ObjectId(id);

            // Update the comment in 'comentarios' collection
            const comentariosCollection = db.collection('comentarios');
            const updateResult = await comentariosCollection.updateOne(
                { _id: commentId },
                { $set: { comentarioProgramado: false } }
            );

            // Check if a document was updated
            if (updateResult.modifiedCount > 0) {
                return res.status(200).json({ success: true, message: 'Comment status updated successfully.' });
            } else {
                return res.status(404).json({ success: false, message: 'Comment not found.' });
            }
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error.' });
        }
    } else {
        return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }
}
