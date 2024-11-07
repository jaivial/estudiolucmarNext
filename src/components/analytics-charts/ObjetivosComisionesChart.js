// components/analytics-charts/ObjetivosComisionesChart.js
import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import goalAnimation from '../../../public/assets/gif/goal.json';
import trophyAnimation from '../../../public/assets/gif/trophy.json';

const ObjetivosComisionesChart = ({ totalComsiones, analyticsResults, futureEncargoComisiones }) => {
    useEffect(() => {
        console.log('analyticsResults', analyticsResults);
        console.log('futureEncargoComisiones', futureEncargoComisiones);
        console.log('totalComsiones', totalComsiones);
    }, [analyticsResults]);

    const goal = 100000;
    const currentComisionTotal = totalComsiones || 0;
    const pendingComisionTotal = futureEncargoComisiones || 0;

    // Calculate the percentage of goal reached by current and pending commissions
    const achievedPercentage = (currentComisionTotal / goal) * 100;
    const pendingPercentage = ((currentComisionTotal + pendingComisionTotal) / goal) * 100;

    // Total rectangles and how many are filled for each chart
    const totalRectangles = 65;
    const achievedFilledRectangles = Math.round((achievedPercentage / 100) * totalRectangles);
    const pendingFilledRectangles = Math.min(totalRectangles, Math.round((pendingPercentage / 100) * totalRectangles));

    // Extended gradient colors for the achieved commission
    const gradientColors = [
        '#ef4444', '#f55e5e', '#f87171', '#fb8c3e', '#f97316', '#fba823',
        '#fbbf24', '#fcd34d', '#facc15', '#fde047', '#d9e636', '#a3e635',
        '#72d57d', '#4ade80', '#36c17d', '#22c55e', '#1fb14a', '#16a34a',
        '#188038', '#15803d', '#14532d'
    ];

    // Get color for each achieved commission rectangle
    const getRectangleColor = (index) => {
        const colorIndex = Math.floor((index / totalRectangles) * gradientColors.length);
        return gradientColors[colorIndex] || gradientColors[gradientColors.length - 1];
    };

    return (
        <div className="w-full flex flex-col items-center justify-center p-0">
            {currentComisionTotal >= goal && (
                <div className="flex flex-col items-center mb-4">
                    <h4 className="text-green-500 font-bold text-xl mb-2">¡Objetivo conseguido!</h4>
                    <div className="flex justify-center items-center gap-4">
                        <Lottie animationData={goalAnimation} style={{ width: 80, height: 80 }} loop={false} />
                        <Lottie animationData={trophyAnimation} style={{ width: 80, height: 80 }} loop={false} />
                    </div>
                </div>
            )}

            <h4 className="text-slate-50 text-lg mb-2">Objetivo de Comisiones</h4>
            <div className='flex flex-col items-center justify-center w-full gap-0 border-slate-50 border-2 rounded-3xl p-4 bg-slate-100 mb-4'>
                <p className="text-slate-800 mt-0 mb-4 text-lg font-semibold text-center">
                    Comisiones actuales: <br /> {currentComisionTotal.toLocaleString('es-ES')} € / {goal.toLocaleString('es-ES')} €
                </p>

                {/* Achieved Commissions Chart */}
                <div className="w-full flex items-center justify-center mb-4">
                    {Array.from({ length: totalRectangles }, (_, index) => (
                        <div
                            key={index}
                            className="h-6 w-1 rounded-full mx-[1.5px]"
                            style={{
                                backgroundColor: index < achievedFilledRectangles ? getRectangleColor(index) : '#d6d7da',
                            }}
                        ></div>
                    ))}
                </div>

                <p className="text-slate-600 mt-0 text-md mb-4">
                    Progreso logrado: {achievedPercentage.toFixed(1)}%
                </p>
            </div>

            {/* Pending + Achieved Commissions Chart */}
            <div className='flex flex-col items-center justify-center w-full gap-0 border-slate-50 border-2 rounded-3xl p-4 bg-slate-100'>
                <h4 className="text-slate-800 text-lg mb-0">Comisiones proyectadas:</h4>
                <p className="text-slate-800 mt-0 mb-0 text-lg font-semibold text-center">{(pendingComisionTotal + currentComisionTotal).toLocaleString('es-ES')} € / {goal.toLocaleString('es-ES')} €</p>
                <p className="text-slate-800 mb-2">Comisiones pendientes: {pendingComisionTotal.toLocaleString('es-ES')} €</p>
                <div className="w-full flex items-center justify-center">
                    {Array.from({ length: totalRectangles }, (_, index) => (
                        <div
                            key={index}
                            className="h-6 w-1 rounded-full mx-[1.5px]"
                            style={{
                                backgroundColor:
                                    index < pendingFilledRectangles
                                        ? index < achievedFilledRectangles
                                            ? getRectangleColor(index)
                                            : '#60a5fa' // Blue-400 for pending commission rectangles
                                        : '#d6d7da', // Light gray for unfilled
                            }}
                        ></div>
                    ))}
                </div>

                <p className="text-slate-600 mt-2 text-md">
                    Progreso total proyectado: {pendingPercentage.toFixed(1)}%
                </p>
            </div>
        </div>
    );
};

export default ObjetivosComisionesChart;
