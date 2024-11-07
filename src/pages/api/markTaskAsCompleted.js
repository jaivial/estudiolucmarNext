import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { taskId, userId } = req.body;



    const client = await clientPromise;
    const db = client.db('inmoprocrm');

    console.log('taskId', taskId);
    console.log('userId', userId);

    try {
        const result = await db.collection('tasks').updateOne(
            { _id: new ObjectId(taskId), user_id: parseInt(userId) },
            { $set: { completed: true } }
        );

        console.log('result', result);

        if (result.acknowledged) {
            return res.status(200).json({ status: 'success', message: 'Task marked as completed' });
        } else {
            return res.status(404).json({ status: 'error', message: 'Task not found' });
        }
    } catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
