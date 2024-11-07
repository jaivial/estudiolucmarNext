import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { date, task, userId, taskTime } = req.body;
    console.log('req.body', req.body);



    const client = await clientPromise;
    const db = client.db('inmoprocrm'); // Use the correct database name

    try {
        // Insert the new task with the calculated ID
        const result = await db.collection('tasks').insertOne({
            task,
            task_date: date,
            task_time: taskTime || null,
            completed: false,
            user_id: parseInt(userId) // Ensure user_id is stored as an integer
        });

        console.log('result', result);

        if (result.insertedId) {
            return res.status(200).json({ status: 'success', taskId: result.insertedId });
        } else {
            throw new Error('Failed to insert the task');
        }
    } catch (error) {
        console.error("Error adding task:", error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
