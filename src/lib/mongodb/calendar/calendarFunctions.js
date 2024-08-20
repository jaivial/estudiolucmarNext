import clientPromise from '../../mongodb.js';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

// Function to get tasks by day for a specific user
export const getTasksByDay = async (day, userId) => {
    const client = await clientPromise;
    const db = client.db('inmoprocrm'); // Use the correct database name

    const formattedDay = format(new Date(day), 'yyyy-MM-dd'); // Format the date

    try {
        const tasks = await db.collection('tasks').find({
            task_date: formattedDay,
            user_id: userId
        }).toArray();

        return tasks.map(task => ({
            id: task._id,
            task: task.task,
            completed: task.completed,
            task_time: task.task_time
        }));
    } catch (error) {
        console.error("Error fetching tasks: ", error);
        return [];
    }
};

export const getTasksByDaySSR = async (day, userId) => {
    const client = await clientPromise;
    const db = client.db('inmoprocrm'); // Use the correct database name

    const formattedDay = format(new Date(day), 'yyyy-MM-dd'); // Format the date
    console.log('formattedDay', typeof formattedDay);
    console.log('user_id', userId);

    try {
        const tasks = await db.collection('tasks').find({
            task_date: formattedDay,
            user_id: parseInt(userId)
        }).toArray();

        return tasks.map(task => ({
            id: task.id,
            task: task.task,
            completed: task.completed,
            task_time: task.task_time
        }));

    } catch (error) {
        console.error("Error fetching tasks: ", error);
        return [];
    }
};

// Function to mark a task as completed for a specific user
export const markTaskAsCompleted = async (taskId, userId) => {
    const client = await clientPromise;
    const db = client.db('inmoprocrm'); // Use the correct database name

    try {
        const result = await db.collection('tasks').updateOne(
            { _id: taskId, user_id: userId },
            { $set: { completed: true } }
        );

        if (result.matchedCount === 0) {
            console.error("No matching task found");
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error updating task: ", error);
        return false;
    }
};

export const getTasks = async (userId, month) => {
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

        console.log('tasks', tasks);

        return tasks.map(task => ({
            id: task.id,
            task: task.task,
            completed: task.completed,
            task_date: task.task_date,
            task_time: task.task_time
        }));
    } catch (error) {
        console.error("Error fetching tasks: ", error);
        return [];
    }
};


export const getTasksSSR = async (userId) => {
    const client = await clientPromise;
    const db = client.db('inmoprocrm'); // Use the correct database name

    try {
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

        return tasks.map(task => ({
            id: task.id,
            task: task.task,
            completed: task.completed,
            task_date: task.task_date,
            task_time: task.task_time
        }));
    } catch (error) {
        console.error("Error fetching tasks: ", error);
        return [];
    }
};


// Function to add a new task for a specific user
export const addTask = async (date, task, userId, taskTime = null) => {
    const client = await clientPromise;
    const db = client.db('inmoprocrm'); // Use the correct database name

    try {
        const result = await db.collection('tasks').insertOne({
            task_date: date,
            task: task,
            completed: false,
            user_id: userId,
            task_time: taskTime
        });

        return result.insertedId !== null;
    } catch (error) {
        console.error("Error adding task: ", error);
        return false;
    }
};

export const deleteTask = async (taskId, userId) => {
    const client = await clientPromise;
    const db = client.db('inmoprocrm'); // Use the correct database name

    try {
        const result = await db.collection('tasks').deleteOne({
            _id: taskId,
            user_id: userId
        });

        if (result.deletedCount === 0) {
            console.error("No matching task found");
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error deleting task:", error);
        return false;
    }
};

export const moveIncompleteTasksToNextDay = async () => {
    const client = await clientPromise;
    const db = client.db('inmoprocrm'); // Use the correct database name

    // Get the current date in local time (Spain)
    const now = new Date();
    const madridDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const currentDateString = madridDate.toISOString().split('T')[0];

    try {
        // Fetch incomplete tasks for the current date
        const tasks = await db.collection('tasks').find({
            completed: false,
            task_date: currentDateString
        }).toArray();

        // Calculate the next date
        madridDate.setDate(madridDate.getDate() + 1);
        const nextDateString = madridDate.toISOString().split('T')[0];

        // Update tasks to the next date
        for (const task of tasks) {
            await db.collection('tasks').updateOne(
                { _id: task._id },
                { $set: { task_date: nextDateString } }
            );
        }
    } catch (error) {
        console.error('Error moving tasks to next day:', error);
    }
};
