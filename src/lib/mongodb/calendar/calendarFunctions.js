import clientPromise from '../../mongodb.js';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ObjectId } from 'mongodb';

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

export const markTaskAsCompleted = async (taskId, userId) => {
    const client = await clientPromise;
    const db = client.db('inmoprocrm');

    console.log('taskId', taskId);
    console.log('userId', userId);

    try {
        const result = await db.collection('tasks').updateOne(
            { id: parseInt(taskId), user_id: parseInt(userId) },
            { $set: { completed: true } }
        );

        return result.matchedCount > 0;
    } catch (error) {
        console.error("Error updating task:", error);
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
        // Find the highest existing 'id' in the tasks collection
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
            task_date: date,
            task_time: taskTime,
            completed: false,
            user_id: parseInt(userId) // Ensure user_id is stored as an integer
        });

        return result.insertedId !== null;
    } catch (error) {
        console.error("Error adding task: ", error);
        return false;
    }
};

export const deleteTask = async (taskId, userId) => {
    const client = await clientPromise;
    const db = client.db('inmoprocrm');

    try {
        const result = await db.collection('tasks').deleteOne({
            id: parseInt(taskId),
            user_id: parseInt(userId)
        });

        return result.deletedCount > 0;
    } catch (error) {
        console.error("Error deleting task:", error);
        return false;
    }
};

