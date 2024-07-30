import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import Toastify from 'toastify-js';
import Cookies from 'js-cookie';
import { addTask as addTaskToDB } from '../../lib/supabase/calendar/calendarFunctions';


const showToast = (message, backgroundColor) => {
    Toastify({
        text: message,
        duration: 2500,
        gravity: 'top', // `top` or `bottom`
        position: 'center', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            borderRadius: '10px',
            backgroundImage: backgroundColor,
            textAlign: 'center',
        },
        onClick: function () { }, // Callback after click
    }).showToast();
};

// Helper function to format time
const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
};

const TaskList = ({ day, tasks, refreshTasks, filteredTasksByDate }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [taskInput, setTaskInput] = useState('');
    const [taskTimeInput, setTaskTimeInput] = useState(''); // New state for task time input
    const userId = Cookies.get('user_id');

    // Handle task completion by toggling the completed state
    const handleTaskCompletion = async (taskId) => {
        try {
            await axios.post(
                'http://localhost:8000/backend/calendar/tasks.php',
                new URLSearchParams({
                    taskId,
                    userId,
                }),
            );
            showToast('Tarea completada', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            refreshTasks(day);
        } catch (error) {
            console.error('Error marking task as completed:', error);
        }
    };

    // Handle task deletion
    const handleDeleteTask = async (taskId) => {
        try {
            await axios.get('http://localhost:8000/backend/calendar/deleteTasks.php', {
                params: {
                    taskId: taskId,
                    userId: userId,
                },
            });
            showToast('Tarea eliminada', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            refreshTasks(day);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleAddTaskClick = () => {
        setIsAdding(!isAdding);
    };

    const handleTaskInputChange = (event) => {
        setTaskInput(event.target.value);
    };

    const handleTaskTimeInputChange = (event) => {
        setTaskTimeInput(event.target.value);
    };

    const handleTaskSubmit = async (event) => {
        event.preventDefault();
        try {
            const addTask = await addTaskToDB(day, taskInput, userId, taskTimeInput);
            console.log('addTask', addTask);


            showToast('Tarea añadida', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            setTaskInput('');
            setTaskTimeInput(''); // Clear task time input
            setIsAdding(false);
            refreshTasks(day);
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };



    // Sort tasks by time, with tasks without time last
    const sortedTasks = [...filteredTasksByDate].sort((a, b) => {
        if (!a.task_time && !b.task_time) return 0;
        if (!a.task_time) return 1;
        if (!b.task_time) return -1;

        return a.task_time.localeCompare(b.task_time);
    });

    return (
        <div className="bg-white rounded-xl p-4 shadow-md w-[90%] relative flex flex-col items-start justify-center gap-3">
            <div className="flex flex-col items-center justify-center gap-2 bg-blue-50 rounded-xl p-4 w-full">
                <h3 className="text-center">
                    Tareas para <br />
                    {day}
                </h3>
            </div>
            <button className="absolute top-3 right-3 bg-blue-500 text-white rounded-full font-sans font-bold text-2xl text-center flex flex-row justify-center items-center h-10 w-10 pb-0.5" onClick={handleAddTaskClick}>
                <p>+</p>
            </button>

            {Array.isArray(sortedTasks) ? (
                sortedTasks.length > 0 ? (
                    <ul className="flex flex-col gap-2 w-full">
                        {sortedTasks.map((task) => (
                            <li key={task.id} className="flex items-center gap-2 flex-row justify-between w-full px-3">
                                <input type="checkbox" checked={task.completed} onChange={() => handleTaskCompletion(task.id)} className="form-checkbox h-5 w-5 text-green-600" />
                                <div className="flex items-center gap-2 flex-grow">
                                    {task.task_time && <span className="font-bold text-gray-700">{formatTime(task.task_time)}</span>}
                                    <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.task}</span>
                                </div>
                                <button onClick={() => handleDeleteTask(task.id)} className="text-red-600 hover:text-red-800">
                                    <FaTrash />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic">No hay tareas pendientes</p>
                )
            ) : (
                <p className="text-red-500">Tasks data is not an array</p>
            )}
            {isAdding && (
                <form onSubmit={handleTaskSubmit} className="transition-transform transform rounded-md mt-2 flex flex-row items-center justify-center gap-2 w-full">
                    <input type="text" value={taskInput} onChange={handleTaskInputChange} placeholder="Añade una tarea" className="border rounded-md p-2 w-full" required />
                    <input type="time" value={taskTimeInput} onChange={handleTaskTimeInputChange} className="border rounded-md p-2" />
                    <button type="submit" className="bg-green-500 text-white rounded-md py-2 px-3">
                        +
                    </button>
                </form>
            )}
        </div>
    );
};

const startOfDayUTC = (date) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate;
};

export default TaskList;
