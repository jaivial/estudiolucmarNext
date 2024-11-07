import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { taskId, userId } = req.body;

    console.log('taskId', taskId);



    const client = await clientPromise;
    const db = client.db('inmoprocrm');

    try {
        const result = await db.collection('tasks').deleteOne({
            _id: new ObjectId(taskId),
            user_id: parseInt(userId)
        });

        console.log('result', result);

        if (result.acknowledged) {
            return res.status(200).json({ status: 'success', message: 'Task deleted successfully' });
        } else {
            return res.status(404).json({ status: 'error', message: 'Task not found' });
        }
    } catch (error) {
        console.error("Error deleting task:", error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
