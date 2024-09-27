import { metadata } from "../components/layouts/IndexLayout.js";
import GeneralLayout from "../components/layouts/GeneralLayout.js";
import Image from "next/image";
import logoLucmar from "../../public/assets/icons/icon-256.webp";
import "../app/globals.css";
import LoginForm from "../components/LoginForm/LoginForm.js";
import { useRouter } from 'next/navigation'
import { useEffect } from "react";
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import Toastify from 'toastify-js';
import { checkLogin } from "../lib/mongodb/login/checkLogin.js";
import HeroSection from "../components/Home/HeroSection.js";
import { parse } from 'cookie';
import { fetchUserName } from "../lib/mongodb/home/fetchuserHome.js";
import { getTasksByDaySSR, getTasksSSR } from "../lib/mongodb/calendar/calendarFunctions.js";



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

export async function getServerSideProps(context) {
    const { req } = context;
    let user = null;

    try {
        user = await checkLogin(req); // Pass the request object to checkActiveUser
        if (!user || user.length === 0) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }
    } catch (error) {
        console.error('Error during server-side data fetching:', error.message);
    }

    const cookies = parse(req.headers.cookie || '');
    const user_id = cookies.user_id;
    let initialUserName = null;

    try {
        if (user_id) {
            initialUserName = await fetchUserName(user_id);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }

    const day = new Date();
    let tasksSSR;
    try {
        tasksSSR = await getTasksByDaySSR(day, user_id);
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }

    let allTasksSSR;
    let datesWithIncompleteTasks;
    let datesWithCompletedTasks;
    try {
        allTasksSSR = await getTasksSSR(user_id);

        try {
            datesWithIncompleteTasks = Array.from(
                new Set(
                    allTasksSSR
                        .filter((task) => task.completed === false) // Filter tasks that are not completed
                        .map((task) => new Date(task.task_date).toISOString().split('T')[0]), // Extract and format the date
                )
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

            // Group tasks by date
            const tasksByDate = groupTasksByDate(allTasksSSR);

            // Filter dates where all tasks are completed
            const datesWithAllTasksCompleted = Object.keys(tasksByDate).filter(date => {
                return tasksByDate[date].every(task => task.completed === true);
            });

            // Convert the result to a Set
            const datesWithCompletedTasksSet = new Set(datesWithAllTasksCompleted);

            datesWithCompletedTasks = Array.from(datesWithCompletedTasksSet);


        } catch (error) {
            console.error('Error processing tasks:', error);
        }

    } catch (error) {
        console.error('Error fetching all tasks:', error);
    }




    return {
        props: {
            user,
            initialUserName,
            tasksSSR,
            allTasksSSR,
            datesWithCompletedTasks,
            datesWithIncompleteTasks,
        },
    };
}



export default function Home({ user, initialUserName, tasksSSR, allTasksSSR, datesWithCompletedTasks, datesWithIncompleteTasks }) {

    useEffect(() => {
        const toastMessage = localStorage.getItem('toastMessage');
        if (toastMessage) {
            const { message, style } = JSON.parse(toastMessage);
            // Display the toast message
            showToast(message, style);
            // Remove the message from localStorage
            localStorage.removeItem('toastMessage');
        }
    }, []);

    return (
        <GeneralLayout title={metadata.title} description={metadata.description} user={user}>
            <div style={{ paddingTop: 'var(--safe-area-inset-top)' }} className="h-full w-full">
                <HeroSection initialUserName={initialUserName} tasksSSR={tasksSSR} allTasksSSR={allTasksSSR} datesWithCompletedTasks={datesWithCompletedTasks} datesWithIncompleteTasks={datesWithIncompleteTasks} />
            </div>
        </GeneralLayout>
    );
}