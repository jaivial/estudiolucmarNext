import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const tasks = await db.collection('tasks').find({
            user_id: parseInt(userId),
            task_date: {
                $gte: firstDayOfMonth.toISOString().split('T')[0],
                $lte: lastDayOfMonth.toISOString().split('T')[0]
            }
        }).toArray();

        console.log('tasks ssr', tasks);

        return res.status(200).json({ status: 'success', tasks });
    } catch (error) {
        console.error("Error fetching tasks: ", error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
