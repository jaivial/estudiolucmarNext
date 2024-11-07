import { useState, useEffect } from "react";
import { metadata } from "../components/layouts/IndexLayout.js";
import GeneralLayout from "../components/layouts/GeneralLayout.js";
import Image from "next/image";
import logoLucmar from "../../public/assets/icons/icon-256.webp";
import "../app/globals.css";
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import Toastify from 'toastify-js';
import { checkLogin } from "../lib/mongodb/login/checkLogin.js";
import HeroSection from "../components/Home/HeroSection.js";
import { parse } from 'cookie';
import { fetchUserName } from "../lib/mongodb/home/fetchuserHome.js";
import { Modal, Button, Form, SelectPicker, Input } from 'rsuite';
import { DatePicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css'; // Make sure to include RSuite styles
import axios from 'axios';




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
    const admin = cookies.admin;
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
        const response = await fetch(`http://localhost:3000/api/getTasksByDaySSR`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ day, userId: user_id })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tasks by day');
        }

        tasksSSR = await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }


    let allTasksSSR;
    let datesWithIncompleteTasks;
    let datesWithCompletedTasks;
    try {
        // Fetch tasks from the API
        const response = await fetch(`http://localhost:3000/api/getTasksSSR`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user_id })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        // Get the JSON response and extract the tasks array
        let responseData = await response.json();
        allTasksSSR = responseData.tasks; // Ensure we're getting the array of tasks
        console.log('allTasksSSR', allTasksSSR);

        // Ensure allTasksSSR is an array before filtering
        if (Array.isArray(allTasksSSR)) {
            datesWithIncompleteTasks = Array.from(
                new Set(
                    allTasksSSR
                        .filter((task) => !task.completed) // Filter tasks that are not completed
                        .map((task) => new Date(task.task_date).toISOString().split('T')[0]) // Extract and format the date
                )
            );
        } else {
            console.error('allTasksSSR is not an array:', allTasksSSR);
            datesWithIncompleteTasks = [];
        }
        console.log('datesWithIncompleteTasks', datesWithIncompleteTasks);

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

        console.log('datesWithCompletedTasks', datesWithCompletedTasks);



    } catch (error) {
        console.error('Error fetching all tasks:', error);
    }

    let userData = null;
    if (user_id) {
        try {
            // Construct the URL
            const response = await fetch(`http://localhost:3000/api/fetchuserinformation`, {
                method: 'POST', // Specify the method
                headers: {
                    'Content-Type': 'application/json', // Specify the content type
                },
                body: JSON.stringify({ user_id }) // Pass user_id in the body
            });

            if (response.status === 200) {
                userData = await response.json();
            } else {
                console.error('Error fetching user data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }
    let userAnalyticsProps = null;
    // Fetch analytics data
    if (userData && userData.user) {
        try {
            const analyticsResponse = await axios.get('http://localhost:3000/api/fetchUserAnalytics', {
                params: {
                    userId: userData.user.id,
                    user_id: parseInt(userData.user.user_id, 10),
                },
            });

            userAnalyticsProps = analyticsResponse.data;
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        }
    }


    return {
        props: {
            user,
            user_id,
            initialUserName,
            tasksSSR,
            allTasksSSR,
            datesWithCompletedTasks,
            datesWithIncompleteTasks,
            admin,
            userData,
            userAnalyticsProps
        },
    };
}



export default function Home({ user, user_id, initialUserName, tasksSSR, allTasksSSR, datesWithCompletedTasks, datesWithIncompleteTasks, admin, userData, userAnalyticsProps }) {

    const [modalAsignarTarea, setModalAsignarTarea] = useState(false);
    const [selectedAsesor, setSelectedAsesor] = useState(null);
    const [asesorOptions, setAsesorOptions] = useState([]);
    const [taskInput, setTaskInput] = useState('');
    const [day, setDay] = useState(new Date());
    const [taskTimeInput, setTaskTimeInput] = useState(new Date());
    const [userAnalytics, setUserAnalytics] = useState(userAnalyticsProps);


    const fetchAnalytics = async (userId, user_id) => {
        try {
            const response = await axios.get(`/api/fetchUserAnalytics`, {
                params: { userId, user_id },
            });
            setUserAnalytics(response.data); // Store the API response in userAnalytics
            console.log('userAnalytics pepepep', response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    useEffect(() => {
        console.log('userData', userData);
        fetchAnalytics(userData.user.id, parseInt(userData.user.user_id, 10));
    }, []);

    const handleTaskSubmit = async () => {
        try {
            // Format day to YYYY-MM-DD
            const formattedDay = day.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'

            // Format taskTimeInput to HH:mm
            const formattedTime = taskTimeInput.toTimeString().split(' ')[0].slice(0, 5); // Convert to 'HH:mm'

            const response = await axios.post(`/api/asignarTarea`, {
                userId: parseInt(selectedAsesor), // Parse the userId to an integer
                task: taskInput,
                taskDate: formattedDay,
                taskTime: formattedTime,
            });
            if (response.data.success) {
                showToast('Tarea asignada', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                setTaskInput('');
                setTaskTimeInput(new Date()); // Reset task time input
                setDay(new Date()); // Reset day
                setModalAsignarTarea(false);
                setSelectedAsesor(null);
            } else {
                showToast('Error al asignar tarea', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };


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

    const fetchAsesores = async () => {
        try {
            const response = await axios.get('/api/fetchAsesores');
            console.log('Asesores fetched:', response.data.asesores);
            const asesoresToMap = response.data.asesores;

            setAsesorOptions(
                asesoresToMap.map((asesor) => ({
                    label: `${asesor.nombre} ${asesor.apellido}`,
                    value: asesor.user_id,
                })),
            );
        } catch (error) {
            console.error('Error fetching asesores:', error);
        }
    };

    useEffect(() => {
        fetchAsesores();
    }, []);

    useEffect(() => {
        console.log('asesorOptions', asesorOptions);
    }, [asesorOptions]);

    const handleTaskInputChange2 = (value) => {
        setTaskInput(value);
    };

    const handleTaskTimeInputChange2 = (value) => {
        setTaskTimeInput(value);
    };

    const handleAsesorChange = (value) => {
        setSelectedAsesor(value);
    };
    const handleDateChange = (value) => {
        setDay(value); // Set the selected date
    };

    return (
        <GeneralLayout title={metadata.title} description={metadata.description} user={user} userData={userData}>
            <div className="h-full">
                <Modal open={modalAsignarTarea} onClose={() => setModalAsignarTarea(false)} size="md" overflow={false} backdrop={true} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0px 2px', marginBottom: '70px' }}>
                    <Modal.Header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', marginTop: '10px' }}>
                        <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>Asignar Tarea</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '10px 25px', fontSize: '1rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
                        <Form fluid style={{ width: '60%' }}>
                            <Form.Group>
                                <Form.ControlLabel>Descripción de la Tarea</Form.ControlLabel>
                                <Input
                                    as="textarea" // Change this to a textarea
                                    name="task"
                                    value={taskInput}
                                    onChange={handleTaskInputChange2}
                                    placeholder="Añade una tarea"
                                    required
                                    rows={3} // Set the number of visible rows
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Selecciona una fecha</Form.ControlLabel>
                                <DatePicker
                                    value={day} // Bind the selected date to the state
                                    onChange={handleDateChange} // Update state on change
                                    format="dd-MM-yyyy" // Set the desired date format to dd-MM-yyyy
                                    placeholder="dd-MM-yyyy" // Optional: placeholder for the input
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Hora de la Tarea</Form.ControlLabel>
                                <DatePicker
                                    value={taskTimeInput} // Bind the selected date to the state
                                    onChange={handleTaskTimeInputChange2} // Update state on change
                                    format="HH:mm" // Set the desired date format to dd-MM-yyyy

                                />

                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Asesor</Form.ControlLabel>
                                <SelectPicker
                                    data={asesorOptions}
                                    value={selectedAsesor}
                                    onChange={handleAsesorChange}
                                    placeholder="Selecciona un asesor"
                                    block
                                />
                            </Form.Group>
                        </Form>
                        <Modal.Footer className="flex flex-col justify-center gap-1 mt-2">
                            <Button type="submit" appearance="primary" onClick={handleTaskSubmit}>
                                Asignar Tarea
                            </Button>
                            <Button onClick={() => setModalAsignarTarea(false)} appearance="subtle" style={{ margin: '0px' }}>
                                Cancelar
                            </Button>
                        </Modal.Footer>
                    </Modal.Body>
                </Modal>

                <div style={{ paddingTop: 'var(--safe-area-inset-top)' }} className="h-full w-full">
                    <HeroSection userAnalytics={userAnalytics} initialUserName={initialUserName} tasksSSR={tasksSSR} allTasksSSR={allTasksSSR} datesWithCompletedTasks={datesWithCompletedTasks} datesWithIncompleteTasks={datesWithIncompleteTasks} admin={admin} setModalAsignarTarea={setModalAsignarTarea} />
                </div>
            </div>
        </GeneralLayout >
    );
}