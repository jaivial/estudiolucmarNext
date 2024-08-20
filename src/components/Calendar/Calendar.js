import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';
import TaskList from './TaskList';
import Cookies from 'js-cookie';
import { format, set, startOfDay } from 'date-fns';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import axios from 'axios';

const CalendarApp = ({ tasksSSR, allTasksSSR, datesWithCompletedTasks, datesWithIncompleteTasks }) => {
    const [date, setDate] = useState(new Date());
    const [filteredTasksByDate, setFilteredTasksByDate] = useState([]);
    const [tasks, setTasks] = useState(tasksSSR);
    const [allTasks, setAllTasks] = useState(allTasksSSR);
    const [selectedDay, setSelectedDay] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [incompletedTasksDates, setIncompletedTasksDates] = useState(new Set(datesWithIncompleteTasks));
    const [completedTasksDates, setCompletedTasksDates] = useState(new Set(datesWithCompletedTasks));
    const [displayedMonth, setDisplayedMonth] = useState(format(new Date(), 'yyyy-MM')); // Initialize with the current month

    const onActiveStartDateChange = ({ activeStartDate }) => {
        setDisplayedMonth(format(activeStartDate, 'yyyy-MM')); // Update the displayed month
        fetchAllTasks(format(activeStartDate, 'yyyy-MM')); // Fetch tasks for the new month
        console.log('THE MONTH', displayedMonth);
    };

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
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const filteredTasks = tasks.filter(task => task.task_date === formattedDate);
        return filteredTasks;
    };

    const datesCompleteIncompleteTasks = async (allTasks) => {
        try {
            const datesWithIncompleteTasks =
                new Set(
                    allTasks
                        .filter((task) => task.completed === false)
                        .map((task) => new Date(task.task_date).toISOString().split('T')[0]),
                );

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

            const tasksByDate = groupTasksByDate(allTasks);

            const datesWithAllTasksCompleted = Object.keys(tasksByDate).filter(date => {
                return tasksByDate[date].every(task => task.completed === true);
            });

            const datesWithCompletedTasksSet = new Set(datesWithAllTasksCompleted);

            setIncompletedTasksDates(datesWithIncompleteTasks);
            setCompletedTasksDates(datesWithCompletedTasksSet);

            console.log('Incomplete task dates:', datesWithIncompleteTasks);
            console.log('Completed task dates:', datesWithCompletedTasks);

        } catch (error) {
            console.error('Error processing tasks:', error);
        }
    };

    const fetchAllTasks = async (month) => {
        try {
            const functionToActivate = 'getTasks';
            const response = await axios.get(`/api/calendar_functions`, {
                params: { userId, functionToActivate, month }, // Pass the month parameter
            });
            const allTasks = response.data.tasks;
            setAllTasks(allTasks);
            datesCompleteIncompleteTasks(allTasks);
            console.log('All tasks HERE:', allTasks);
        } catch (error) {
            console.error('Error fetching all tasks:', error);
        }
    };

    const onDateClick = (value) => {
        setSelectedDay(format(value, 'yyyy-MM-dd'));
        setDate(value);
    };

    const refreshTasks = () => {
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

    const scheduleDailyTask = () => {
        const now = new Date();
        const currentTime = now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }).split(' ')[1];
        const [currentHour, currentMinute, currentSecond] = currentTime.split(':').map(Number);
        const millisecondsUntilMidnight = ((23 - currentHour) * 3600 + (59 - currentMinute) * 60 + (60 - currentSecond)) * 1000;

        setTimeout(() => {
            axios.post(`/api/tasks`);
            setInterval(() => axios.post(`/api/tasks`), 24 * 60 * 60 * 1000);
        }, millisecondsUntilMidnight);
    };

    useEffect(() => {
        scheduleDailyTask();
    }, []);

    return (
        <div className="pb-36 flex flex-col items-center justify-center gap-6  ">
            <h1 className="text-center text-2xl font-bold">Calendario de tareas</h1>
            <Calendar
                value={date}
                onClickDay={onDateClick}
                onActiveStartDateChange={onActiveStartDateChange} // Listen for month change
                className="w-full bg-purple-400 rounded-xl"
                tileClassName={tileClassName}
                tileContent={renderTileContent}
            />
            {selectedDay && <TaskList day={selectedDay} tasks={tasks} refreshTasks={refreshTasks} filteredTasksByDate={filteredTasksByDate} />}
        </div>
    );
};

export default CalendarApp;
