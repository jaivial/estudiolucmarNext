import cors, { runMiddleware } from '../../utils/cors';
import { getTasks, addTask, markTaskAsCompleted, deleteTask } from '../../lib/mongodb/calendar/calendarFunctions';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    const { userId, functionToActivate, month } = req.query; // Extract userId, functionToActivate, and month from query parameters

    try {
        if (req.method === 'GET' && functionToActivate === 'getTasks') {
            const tasks = await getTasks(userId, month);
            res.status(200).json({ tasks });
        } else if (req.method === 'POST') {
            const { taskId, taskDate, task, taskTime, functionToActivate, userId } = req.body;

            if (functionToActivate === 'addTask') {
                const result = await addTask(taskDate, task, userId, taskTime, taskId);
                res.status(200).json({ success: result });
            }
            if (functionToActivate === 'markTaskAsCompleted') {
                console.log('here');
                const result = await markTaskAsCompleted(taskId, userId);
                res.status(200).json({ success: result });
            }
            if (functionToActivate === 'deleteTask') {
                const result = await deleteTask(taskId, userId);
                res.status(200).json({ success: result });
            }

        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
}
