import { supabase } from '../supabaseClient.js';
import { format } from 'date-fns';

// Function to get tasks by day for a specific user
export const getTasksByDay = async (day, userId) => {
    // Ensure the day is in a format recognized by your database, e.g., 'YYYY-MM-DD'
    const formattedDay = format(new Date(day), 'yyyy-MM-dd'); // Format the date

    let { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('task_date', formattedDay)
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching tasks: ", error);
        return [];
    }

    return tasks.map(task => ({
        id: task.id,
        task: task.task,
        completed: task.completed,
        task_time: task.task_time
    }));
}
export const getTasksByDaySSR = async (day, userId) => {
    // Ensure the day is in a format recognized by your database, e.g., 'YYYY-MM-DD'
    const formattedDay = format(new Date(day), 'yyyy-MM-dd'); // Format the date

    let { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('task_date', formattedDay)
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching tasks: ", error);
        return [];
    }

    return tasks.map(task => ({
        id: task.id,
        task: task.task,
        completed: task.completed,
        task_time: task.task_time
    }));
}

// Function to mark a task as completed for a specific user
export const markTaskAsCompleted = async (taskId, userId) => {
    let { error } = await supabase
        .from('tasks')
        .update({ completed: true })
        .eq('id', taskId)
        .eq('user_id', userId);

    if (error) {
        console.error("Error updating task: ", error);
        return false;
    }

    return true;
}

// Function to get all tasks for a specific user
export const getTasks = async (userId) => {
    let { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching tasks: ", error);
        return [];
    }

    return tasks.map(task => ({
        id: task.id,
        task: task.task,
        completed: task.completed,
        task_date: task.task_date,
        task_time: task.task_time
    }));
}

export const getTasksSSR = async (userId) => {
    let { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching tasks: ", error);
        return [];
    }

    return tasks.map(task => ({
        id: task.id,
        task: task.task,
        completed: task.completed,
        task_date: task.task_date,
        task_time: task.task_time
    }));
}

// Function to add a new task for a specific user
export const addTask = async (date, task, userId, taskTime = null) => {
    let { error } = await supabase
        .from('tasks')
        .insert([
            { task_date: date, task: task, completed: false, user_id: userId, task_time: taskTime }
        ]);

    if (error) {
        console.error("Error adding task: ", error);
        return false;
    }

    return true;
}

export const deleteTask = async (taskId, userId) => {
    const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('user_id', userId)
        .eq('id', taskId);

    if (error) {
        console.error("Error deleting task:", error);
        return false;
    }
    return data;
};


export const moveIncompleteTasksToNextDay = async () => {
    // Get the current date in local time (Spain)
    const now = new Date();
    const madridDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const currentDateString = madridDate.toISOString().split('T')[0];

    // Fetch incomplete tasks for the current date
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('completed', false)
        .eq('task_date', currentDateString);

    if (error) {
        console.error('Error fetching tasks:', error);
        return;
    }

    // Calculate the next date
    madridDate.setDate(madridDate.getDate() + 1);
    const nextDateString = madridDate.toISOString().split('T')[0];

    // Update tasks to the next date
    for (const task of tasks) {
        const { id } = task;
        const { error } = await supabase
            .from('tasks')
            .update({ task_date: nextDateString })
            .eq('id', id);

        if (error) {
            console.error('Error updating task:', error);
        }
    }

}
