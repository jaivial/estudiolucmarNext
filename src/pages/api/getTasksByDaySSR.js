import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { format } from 'date-fns';

export default async function handler(req, res) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { day, userId } = req.body;

    if (!day || !userId) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    const client = await clientPromise;
    const db = client.db('inmoprocrm'); // Use the correct database name
    const formattedDay = format(new Date(day), 'yyyy-MM-dd'); // Format the date

    try {
        const tasks = await db.collection('tasks').find({
            task_date: formattedDay,
            user_id: parseInt(userId)
        }).toArray();

        const tasksByDay = tasks.map(task => ({
            id: task.id,
            task: task.task,
            completed: task.completed,
            task_time: task.task_time
        }));

        return res.status(200).json({ status: 'success', tasks: tasksByDay });
    } catch (error) {
        console.error("Error fetching tasks by day: ", error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
