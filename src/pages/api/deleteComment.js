import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            console.log('id', id);

            // Check if the required parameter is set
            if (!id) {
                return res.status(400).json({ success: false, message: 'Comment ID is required.' });
            }

            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            // Convert the id to an ObjectId
            const commentId = new ObjectId(id);

            // Step 1: Delete the comment from 'comentarios' collection
            const comentariosCollection = db.collection('comentarios');
            const deleteResult = await comentariosCollection.deleteOne({ _id: commentId });

            if (deleteResult.deletedCount === 0) {
                return res.status(404).json({ success: false, message: 'Comment not found.' });
            }

            // Step 2: Delete the corresponding task in the 'tasks' collection
            const tasksCollection = db.collection('tasks');
            const taskDeleteResult = await tasksCollection.deleteOne({
                id: { $regex: `^${id}comment` } // Find the task where id starts with the comment id + 'comment'
            });

            // Check if the task was found and deleted
            if (taskDeleteResult.deletedCount === 0) {
                return res.status(404).json({ success: true, message: 'Comment deleted, but no matching task found.' });
            }

            // Return success if both the comment and the task are deleted
            return res.status(200).json({ success: true, message: 'Comment and associated task deleted successfully.' });

        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error.' });
        }
    } else {
        return res.status(405).json({ success: false, message: 'Method not allowed.' });
    }
}
