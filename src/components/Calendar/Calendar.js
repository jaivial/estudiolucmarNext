import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';
import TaskList from './TaskList'; // Adjust the import path as needed
import Cookies from 'js-cookie';
import { getTasksByDay, getTasks } from '../../lib/supabase/calendar/calendarFunctions';
import { format, startOfDay } from 'date-fns';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";



const CalendarApp = ({ tasksSSR, allTasksSSR, datesWithCompletedTasks, datesWithIncompleteTasks }) => {
    const [date, setDate] = useState(new Date());
    const [filteredTasksByDate, setFilteredTasksByDate] = useState([]);
    const [tasks, setTasks] = useState(tasksSSR);
    const [allTasks, setAllTasks] = useState(allTasksSSR);
    const [selectedDay, setSelectedDay] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [incompletedTasksDates, setIncompletedTasksDates] = useState(new Set(datesWithIncompleteTasks));
    const [completedTasksDates, setCompletedTasksDates] = useState(new Set(datesWithCompletedTasks));

    // Get user ID from cookies
    const userId = Cookies.get('user_id');

    const startOfDayUTC = (date) => {
        const localStartOfDay = startOfDay(date);
        const utcDate = new Date(localStartOfDay.getTime() - localStartOfDay.getTimezoneOffset() * 60000);
        return utcDate;
    };

    useEffect(() => {
        if (selectedDay) {
            setFilteredTasksByDate(filterAndSortTasksByDate(allTasks, selectedDay));
        }
        console.log('selectedDay', selectedDay);
        console.log('allTasks updated', allTasks);
    }, [selectedDay, allTasks]);

    useEffect(() => {
        console.log('filteredTasksByDate', filteredTasksByDate);
    }, [filteredTasksByDate]);

    const filterAndSortTasksByDate = (tasks, selectedDate) => {
        // Format the selected date to 'YYYY-MM-DD'
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        // Filter tasks that match the selected date
        const filteredTasks = tasks.filter(task => task.task_date === formattedDate);

        return filteredTasks;
    };

    const fetchTasksByDay = async (day) => {
        try {
            const tasksForDate = await getTasksByDay(day, userId);
            console.log('tasksForDate', tasksForDate);

            if (Array.isArray(tasksForDate)) {
                setTasks(tasksForDate);
            } else {
                console.warn('Fetched data is not an array:', tasksForDate);
                setTasks([]);
            }

            console.log('Tasks for day:', tasksForDate);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        }
    };

    const datesCompleteIncompleteTasks = async (allTasks) => {
        try {
            datesWithIncompleteTasks =
                new Set(
                    allTasks
                        .filter((task) => task.completed === false) // Filter tasks that are not completed
                        .map((task) => new Date(task.task_date).toISOString().split('T')[0]), // Extract and format the date
                )


            const groupTasksByDate = (tasks) => {
                return tasks.reduce((acc, task) => {
                    const date = new Date(task.task_date).toISOString().split('T')[0];
                    if (!acc[date]) {
                        acc[date] = [];
                    }
                    acc[date].push(task);
                    return acc;
                }, {});
            };

            // Group tasks by date
            const tasksByDate = groupTasksByDate(allTasks);

            // Filter dates where all tasks are completed
            const datesWithAllTasksCompleted = Object.keys(tasksByDate).filter(date => {
                return tasksByDate[date].every(task => task.completed === true);
            });

            // Convert the result to a Set
            const datesWithCompletedTasksSet = new Set(datesWithAllTasksCompleted);

            setIncompletedTasksDates(datesWithIncompleteTasks);
            setCompletedTasksDates(datesWithCompletedTasksSet);
            // Output the set of dates with incomplete and completed tasks
            console.log('Incomplete task dates:', datesWithIncompleteTasks);
            console.log('Completed task dates:', datesWithCompletedTasks);

        } catch (error) {
            console.error('Error processing tasks:', error);
        }
    };

    const fetchAllTasks = async () => {
        try {
            const allTasks = await getTasks(userId);
            setAllTasks(allTasks);
            datesCompleteIncompleteTasks(allTasks);
            console.log('All tasks:', allTasks);

        } catch (error) {
            console.error('Error fetching all tasks:', error);
        }
    };

    const onDateClick = (value) => {
        setSelectedDay(format(value, 'yyyy-MM-dd'));
        setDate(value); // Update calendar view date
    };

    const refreshTasks = (day) => {
        fetchAllTasks();
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateString = format(startOfDayUTC(date), 'yyyy-MM-dd');
            if (incompletedTasksDates.has(dateString)) {
                return 'has-tasks';
            }

        }
        return null;
    };

    const renderTileContent = ({ date, view }) => {
        if (view === 'month') {
            const dateString = format(startOfDayUTC(date), 'yyyy-MM-dd');
            if (completedTasksDates.has(dateString)) {
                return (
                    <div style={{ position: 'relative', height: 'auto' }}>
                        <IoMdCheckmarkCircleOutline style={{ position: 'absolute', bottom: '-21px', left: '50%', transform: 'translateX(-50%)', color: 'green', fontSize: '1.2rem' }} />
                    </div>
                );
            }
        }
        return null;
    };

    useEffect(() => {
        console.log('tasks', tasks);
    }, [tasks]);

    return (
        <div className="pb-36 flex flex-col items-center justify-center gap-6  ">
            <h1 className="text-center text-2xl font-bold">Calendario de tareas</h1>
            <Calendar value={date} onClickDay={onDateClick} className="w-full bg-purple-400 rounded-xl" tileClassName={tileClassName} tileContent={renderTileContent} />
            {selectedDay && <TaskList day={selectedDay} tasks={tasks} refreshTasks={refreshTasks} filteredTasksByDate={filteredTasksByDate} />}
        </div>
    );
};

export default CalendarApp;
