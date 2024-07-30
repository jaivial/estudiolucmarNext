import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';
import TaskList from './TaskList'; // Adjust the import path as needed
import Cookies from 'js-cookie';
import { getTasksByDay, getTasks } from '../../lib/supabase/calendar/calendarFunctions';
import { format, set, startOfDay } from 'date-fns';

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

    useEffect(() => {
        // console.log('tasksSSR', tasksSSR);
        // console.log('allTasksSSR', allTasksSSR);
        // console.log('incompletedTasksDates', incompletedTasksDates);
        // console.log('completedTasksDates', completedTasksDates);

    }, []);

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


            datesWithCompletedTasks =
                new Set(
                    allTasks
                        .filter((task) => task.completed === true) // Filter tasks that are completed
                        .map((task) => new Date(task.task_date).toISOString().split('T')[0]), // Extract and format the date
                )

            setIncompletedTasksDates(datesWithIncompleteTasks);
            setCompletedTasksDates(datesWithCompletedTasks);
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
            if (completedTasksDates.has(dateString)) {
                return 'completed-tasks';
            }
        }
        return null;
    };

    useEffect(() => {
        console.log('tasks', tasks);
    }, [tasks]);

    return (
        <div className="pb-28 flex flex-col items-center justify-center gap-4 px-6 py-8 rounded-lg shadow-md">
            <h1 className="text-center text-2xl font-bold">Calendario de tareas</h1>
            <Calendar value={date} onClickDay={onDateClick} className="w-full bg-purple-400 rounded-xl" tileClassName={tileClassName} />
            {selectedDay && <TaskList day={selectedDay} tasks={tasks} refreshTasks={refreshTasks} filteredTasksByDate={filteredTasksByDate} />}
        </div>
    );
};

export default CalendarApp;
