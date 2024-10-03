import cors, { runMiddleware } from '../../utils/cors';
import { v4 as uuidv4 } from 'uuid';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'POST') {
        try {
            const { userId, task, taskDate, taskTime } = req.body;



            // Find the highest existing 'id' in the tasks collection
            const client = await clientPromise;
            const db = client.db('inmoprocrm');
            const highestTask = await db.collection('tasks')
                .find({})
                .sort({ id: -1 }) // Sort by id in descending order
                .limit(1)
                .toArray();

            // Determine the new task ID
            const newTaskId = highestTask.length > 0 ? highestTask[0].id + 1 : 1;

            // Insert the new task with the calculated ID
            const result = await db.collection('tasks').insertOne({
                id: newTaskId, // Auto-incremented ID
                task: task,
                task_date: taskDate, // Formatted date
                task_time: taskTime, // Formatted time
                completed: false,
                user_id: parseInt(userId), // Ensure user_id is stored as an integer
                asignada: true,
            });

            res.status(201).json({ message: 'Tarea asignada con éxito', taskId: result.insertedId, success: true });
        } catch (error) {
            console.error('Error al asignar tarea:', error);
            res.status(500).json({ message: 'Error al asignar tarea', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
