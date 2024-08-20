// pages/api/tasks.js
import { getTasks, moveIncompleteTasksToNextDay } from '../../lib/mongodb/calendar/calendarFunctions';

export default async function handler(req, res) {
    const { userId, functionToActivate, month } = req.query; // Extract userId, functionToActivate, and month from query parameters

    try {
        if (req.method === 'GET' && functionToActivate === 'getTasks') {
            // Pass the month parameter to the getTasks function
            const tasks = await getTasks(userId, month);
            res.status(200).json({ tasks });
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching tasks' });
    }
}
