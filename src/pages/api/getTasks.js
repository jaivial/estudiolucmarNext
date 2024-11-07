import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId, month } = req.body;

    const client = await clientPromise;
    const db = client.db('inmoprocrm'); // Use the correct database name

    try {
        // Parse the month parameter to get the first and last day of the month
        const [year, monthNumber] = month.split('-').map(Number);
        const firstDayOfMonth = new Date(year, monthNumber - 1, 1); // monthNumber - 1 because Date months are 0-indexed
        const lastDayOfMonth = new Date(year, monthNumber, 0); // Day 0 gives us the last day of the previous month

        const tasks = await db.collection('tasks').find({
            user_id: parseInt(userId),
            task_date: {
                $gte: firstDayOfMonth.toISOString().split('T')[0],
                $lte: lastDayOfMonth.toISOString().split('T')[0]
            }
        }).toArray();

        const formattedTasks = tasks.map(task => ({
            id: task.id,
            task: task.task,
            completed: task.completed,
            task_date: task.task_date,
            task_time: task.task_time,
            asignada: task.asignada ? task.asignada : false,
            _id: task._id
        }));

        return res.status(200).json({ status: 'success', tasks: formattedTasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
