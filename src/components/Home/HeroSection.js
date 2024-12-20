import React, { useEffect, useState } from 'react';
import '../Home/HeroSection.css';
import CalendarApp from '../Calendar/Calendar';
import dynamic from 'next/dynamic';

// Dynamically import VentasAlquilerBarChart and ComisionTotalLineChart with no SSR
const Lottie = dynamic(() => import('lottie-react'), {
    ssr: false,
});
// Dynamically import VentasAlquilerBarChart and ComisionTotalLineChart with no SSR
const VentasAlquilerBarChart = dynamic(() => import('../analytics-charts/VentasAlquilerBarChart'), {
    ssr: false,
});

const ComisionTotalLineChart = dynamic(() => import('../analytics-charts/ComisionTotalLineChart'), {
    ssr: false,
});
const ObjetivosComisionesChart = dynamic(() => import('../analytics-charts/ObjetivosComisionesChart'), {
    ssr: false,
});
const TotalCountsDiv = dynamic(() => import('../analytics-charts/TotalCountsDiv'), {
    ssr: false,
});

const HeroSection = ({ userAnalytics, initialUserName, tasksSSR, allTasksSSR, datesWithCompletedTasks, datesWithIncompleteTasks, admin, setModalAsignarTarea }) => {
    const [time, setTime] = useState('');

    useEffect(() => { // Empty dependency array means this effect runs once on mount and cleanup on unmount
        console.log('userAnalytics inside Hero Section', userAnalytics);
    }, [userAnalytics]);

    useEffect(() => {
        const capitalizeFirstLetter = (string) => {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };

        const updateTime = () => {
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Europe/Madrid', // Set timezone to Madrid, Spain
            };
            const madridTime = new Date().toLocaleString('es-ES', options); // Use 'es-ES' locale for Spanish
            const capitalizedTime = capitalizeFirstLetter(madridTime);
            setTime(capitalizedTime);
        };

        updateTime(); // Call updateTime function immediately to set the initial time

        const intervalId = setInterval(updateTime, 1000); // Update time every second
        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    return (
        <div className="h-auto w-full flex flex-col justify-start items-center pt-28 overflow-y-auto overflow-x-hidden bg-gradient-to-t from-slate-400 via-slate-300 to-slate-200 relative z-[100] pb-20">
            <div id="clock" className="text-lg font-sans font-medium text-zinc-800 absolute top-10 z-10 w-full text-center">{time}</div>

            <div id="nombre-header" className="flex flex-col items-center justify-center w-full h-[60px] pb-10">
                <p className="font-sans text-xl font-medium text-zinc-800 fade-in">Hola,</p>
                <p className="font-sans text-xl font-medium text-zinc-800 fade-in" id="nombreusuario-texto">{initialUserName}</p>
            </div>
            <div id="home-title" className="flex flex-col items-center justify-center w-full h-auto pb-8">
                <p className="text-4xl font-bold text-center animate-fade-in-up">Bienvenido a</p>
                <h1 className="animate-fade-in-up-delayed text-5xl font-sans font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-sky-800 via-sky-600 to-sky-300 inline-block text-center">Estudio Lucmar</h1>
            </div>
            <div className='flex flex-row justify-center items-start w-full h-full gap-2 px-6 max-[800px]:flex-col max-[800px]:gap-0' >

                <div className='rounded-3xl w-1/2 h-full max-[800px]:w-full'>
                    <CalendarApp tasksSSR={tasksSSR} allTasksSSR={allTasksSSR} datesWithCompletedTasks={datesWithCompletedTasks} datesWithIncompleteTasks={datesWithIncompleteTasks} admin={admin} setModalAsignarTarea={setModalAsignarTarea} />
                </div>
                <div className='rounded-3xl w-1/2 h-auto bg-slate-800 p-4 max-[800px]:w-full'>
                    <ObjetivosComisionesChart analyticsResults={userAnalytics?.analyticsResults} futureEncargoComisiones={userAnalytics?.futureEncargoComisiones} totalComsiones={userAnalytics?.totalComision} />
                    <ComisionTotalLineChart data={userAnalytics?.analyticsResults} performance={userAnalytics?.performance} />
                    <TotalCountsDiv counts={userAnalytics?.countTotalInmublesUser} />
                    <VentasAlquilerBarChart data={userAnalytics?.analyticsResults} />
                </div>

            </div>
        </div>
    );
};

export default HeroSection;
