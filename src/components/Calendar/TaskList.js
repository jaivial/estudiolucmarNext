import React, { useState, useRef, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import Toastify from 'toastify-js';
import Cookies from 'js-cookie';
import axios from 'axios';
import { format, parseISO, set } from 'date-fns';
import { es } from 'date-fns/locale';
import { Toast } from 'primereact/toast';
import { SpeedDial } from 'primereact/speeddial';
import { useRouter } from 'next/router';
import './flag.css';
import { Tooltip } from 'primereact/tooltip';
import './flag.css';
import { List, Tag, Panel, Checkbox, Button } from 'rsuite';
import './tasklist.css';



const showToast = (message, backgroundColor) => {
    Toastify({
        text: message,
        duration: 2500,
        gravity: 'top',
        position: 'center',
        stopOnFocus: true,
        style: {
            borderRadius: '10px',
            backgroundImage: backgroundColor,
            textAlign: 'center',
        },
    }).showToast();
};

const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
};



const TaskList = ({ day, tasks, refreshTasks, filteredTasksByDate, setDisplayedMonth, admin, setModalAsignarTarea }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [taskInput, setTaskInput] = useState('');
    const [taskTimeInput, setTaskTimeInput] = useState('');

    const userId = Cookies.get('user_id');


    const onClose = () => {
        setModalAsignarTarea(false);
    };


    const toast = useRef(null);
    const router = useRouter();
    const items = [
        {
            label: 'Añadir Tarea',
            icon: 'pi pi-plus',
            className: 'bg-slate-800 p-3 text-white text-xl md:hover:bg-emerald-400 md:hover:text-slate-900 md:hover:shadow-lg',
            tooltipOptions: {
                tooltipLabel: 'Añadir Tarea',
            },
            command: () => {
                handleAddTaskClick();
            }
        },
        {
            label: 'Asignar Tarea a Asesor',
            icon: 'pi pi-user-plus',
            className: 'bg-slate-800 p-3 text-white text-xl md:hover:bg-emerald-400 md:hover:text-slate-900 md:hover:shadow-lg',
            tooltipOptions: {
                tooltipLabel: 'Asignar Tarea a Asesor'
            },
            command: () => {
                setModalAsignarTarea(true);
            }

        }
    ];

    const handleTaskCompletion = async (taskId) => {
        console.log('taskId', taskId);
        console.log('userId', userId);
        try {
            await axios.post(`/api/markTaskAsCompleted`, { taskId, userId });

            showToast('Tarea completada', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');

            // Convert day (YYYY-MM-DD) to YYYY-MM
            const month = format(parseISO(day), 'yyyy-MM');
            refreshTasks(month);
            setDisplayedMonth(month);
        } catch (error) {
            console.error('Error marking task as completed:', error);
        }
    };


    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`/api/deleteTask`, {
                data: { taskId, userId }
            });


            showToast('Tarea eliminada', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');

            const month = format(parseISO(day), 'yyyy-MM');
            refreshTasks(month);
            setDisplayedMonth(month);
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
            await axios.post(`/api/addTask`, {
                userId,
                task: taskInput,
                date: day,
                taskTime: taskTimeInput
            });

            showToast('Tarea añadida', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            setTaskInput('');
            setTaskTimeInput('');
            setIsAdding(false);
            refreshTasks(day);
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };


    const formatDateString = (dateString) => {
        const date = parseISO(dateString);
        const dayOfWeek = format(date, 'EEEE', { locale: es });
        const day = format(date, 'dd', { locale: es });
        const month = format(date, 'MMMM', { locale: es });
        const year = format(date, 'yyyy', { locale: es });
        return `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)} - ${day} - ${month} - ${year}`;
    };

    const SpanishDateString = formatDateString(day);

    const sortedTasks = [...filteredTasksByDate].sort((a, b) => {
        if (!a.task_time && !b.task_time) return 0;
        if (!a.task_time) return 1;
        if (!b.task_time) return -1;
        return a.task_time.localeCompare(b.task_time);
    });

    const assignedTasks = sortedTasks.filter(task => task.asignada);
    const unassignedTasks = sortedTasks.filter(task => !task.asignada);




    return (
        <>

            <div className="bg-white rounded-xl p-4 shadow-md w-[90%] relative flex flex-col items-start justify-center gap-3">

                <div className="flex flex-col items-center justify-center gap-2 bg-blue-50 rounded-xl p-4 w-full">
                    <h3 className="text-center font-sans font-bold text-lg" >
                        Tareas para <br />
                        {SpanishDateString}
                    </h3>
                </div>
                {admin === 'false' ? (
                    <>
                        <button className="absolute top-3 right-3 bg-blue-500 text-white rounded-full font-sans font-bold text-2xl text-center flex flex-row justify-center items-center h-10 w-10 pb-0.5" onClick={handleAddTaskClick}>
                            <p>+</p>
                        </button>
                    </>
                ) : (

                    <>
                        <Toast ref={toast} />
                        <Tooltip target=".speeddial-bottom-left .p-speeddial-action" className='tooltip-custom' position="left" />

                        <SpeedDial
                            model={items}
                            direction="up"
                            className="speeddial-bottom-left"
                        />

                    </>

                )
                }
                <div className="flex flex-col gap-4 w-full">
                    {/* Assigned Tasks Section */}
                    {assignedTasks.length > 0 && (
                        <Panel header={
                            <>
                                Tareas Asignadas <Tag className='ml-4 tag border-2 border-red-700'>Asignada por admin</Tag>
                            </>
                        } bordered>                    <List>
                                {assignedTasks.map(task => (
                                    <List.Item key={task._id} className="flex items-center gap-2 justify-between">
                                        <Checkbox checked={task.completed} onChange={() => handleTaskCompletion(task._id)}>
                                            <div className='flex flex-row items-center gap-4 w-full'>
                                                {task.task_time && <span className="font-bold">{formatTime(task.task_time)}</span>}
                                                <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.task}</span>
                                            </div>
                                        </Checkbox>
                                        {admin === 'true' && (
                                            <Button appearance="link" onClick={() => handleDeleteTask(task._id)} className="text-red-600">
                                                <FaTrash />
                                            </Button>
                                        )}
                                    </List.Item>
                                ))}
                            </List>
                        </Panel>
                    )}

                    {/* Unassigned Tasks Section */}
                    {unassignedTasks.length > 0 && (
                        <Panel header="Tareas No Asignadas" bordered>
                            <List>
                                {unassignedTasks.map(task => (
                                    <List.Item key={task._id} className="flex items-center gap-2 justify-between">
                                        <Checkbox checked={task.completed} onChange={() => handleTaskCompletion(task._id)}>
                                            <div className='flex flex-row items-center gap-4 w-full'>
                                                {task.task_time && <span className="font-bold">{formatTime(task.task_time)}</span>}
                                                <span className={task.completed ? 'line-through text-gray-500' : ''}>{task.task}</span>
                                            </div>
                                        </Checkbox>
                                        <Button appearance="link" onClick={() => handleDeleteTask(task._id)} className="text-red-600">
                                            <FaTrash />
                                        </Button>
                                    </List.Item>
                                ))}
                            </List>
                        </Panel>
                    )}

                    {/* No Tasks Message */}
                    {sortedTasks.length === 0 && (
                        <p className="text-gray-500 italic">No hay tareas pendientes</p>
                    )}
                </div>
                {
                    isAdding && (
                        <form onSubmit={handleTaskSubmit} className="transition-transform transform rounded-md mt-2 flex flex-row items-center justify-center gap-2 w-full">
                            <input type="text" value={taskInput} onChange={handleTaskInputChange} placeholder="Añade una tarea" className="border rounded-md p-2 w-full" required />
                            <input type="time" value={taskTimeInput} onChange={handleTaskTimeInputChange} className="border rounded-md p-2" />
                            <button type="submit" className="bg-green-500 text-white rounded-md py-2 px-3">
                                +
                            </button>
                        </form>
                    )
                }


            </div >

        </>
    );
};

export default TaskList;
