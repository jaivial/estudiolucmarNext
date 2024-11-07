// components/analytics-charts/ComisionTotalAreaChart.js
import React, { useState } from 'react';
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, Tab } from 'rsuite';
import { Icon } from '@iconify/react';
import Lottie from 'lottie-react';
import mobileGraphMoneyAnimation from '../../../public/assets/gif/mobilegraphsmoney.json';
import { XAxis, YAxis } from 'recharts';

// Wrapper for XAxis with default parameters
const XAxisWrapper = ({ axisLine = { stroke: '#cccccc' }, tick = false, ...props }) => {
    return <XAxis axisLine={axisLine} tick={tick} {...props} />;
};

// Wrapper for YAxis with default parameters
const YAxisWrapper = ({ axisLine = { stroke: '#cccccc' }, tick = false, ...props }) => {
    return <YAxis axisLine={axisLine} tick={tick} {...props} />;
};


const ComisionTotalAreaChart = ({ data, performance }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    // Mapping selected period to the respective data array
    const periodDataMap = {
        week: data.last14Days,
        month: data.last8Weeks,
        sixMonths: data.last8Months,
        year: data.last8Years
    };

    // Mapping each tab to its corresponding label
    const periodLabelMap = {
        week: "Comisión esta semana",
        month: "Comisión este mes",
        sixMonths: "Comisión últimos 6 meses",
        year: "Comisión último año"
    };

    // Gradient colors starting from blue-100 to slate-50
    const gradientColors = ['#bfdbfe', '#60a5fa', '#3b82f6', '#2563eb', '#1e3a8a'];

    const chartData = periodDataMap[selectedPeriod].map((entry, index) => ({
        name: `${selectedPeriod} ${index + 1}`,
        comisionTotal: entry.comisionTotal
    }));

    // Check if all data in the chartData is zero
    const isDataEmpty = chartData.every(entry => entry.comisionTotal === 0);

    // Define performance and current/previous information based on selected period
    const performanceInfo = {
        week: {
            comisionTotal: data.currentWeek.comisionTotal,
            previousComisionTotal: data.previousWeek.comisionTotal,
            change: performance.week.comisionPerformance
        },
        month: {
            comisionTotal: data.currentMonth.comisionTotal,
            previousComisionTotal: data.previousMonth.comisionTotal,
            change: performance.month.comisionPerformance
        },
        sixMonths: {
            comisionTotal: data.current6Months.comisionTotal,
            previousComisionTotal: data.previous6Months.comisionTotal,
            change: performance.sixMonths.comisionPerformance
        },
        year: {
            comisionTotal: data.currentYear.comisionTotal,
            previousComisionTotal: data.previousYear.comisionTotal,
            change: performance.year.comisionPerformance
        }
    };

    const { comisionTotal, previousComisionTotal, change } = performanceInfo[selectedPeriod];
    const isPositiveChange = change > 0;
    const difference = comisionTotal - previousComisionTotal;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <h4 className="text-slate-50 pb-3 text-lg">Comisión Total</h4>
            <Tabs
                appearance="pills"
                activeKey={selectedPeriod}
                onSelect={setSelectedPeriod}
                className=" text-white -mb-2"
            >
                <Tabs.Tab eventKey="week" title="Semana" />
                <Tabs.Tab eventKey="month" title="Mes" />
                <Tabs.Tab eventKey="sixMonths" title="6 Meses" />
                <Tabs.Tab eventKey="year" title="Año" />
            </Tabs>



            {/* Conditional Rendering for Chart or Lottie Animation */}
            {isDataEmpty ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-50">
                    <Lottie animationData={mobileGraphMoneyAnimation} style={{ width: 200, height: 200 }} loop />
                    <p className="mt-4">No hay información para el periodo seleccionado.</p>
                </div>
            ) : (
                <>
                    {/* Performance Info */}
                    <div className="mt-4 text-center">
                        <h5 className="text-lg text-slate-50">{periodLabelMap[selectedPeriod]}: {comisionTotal.toLocaleString('es-ES')} €</h5>

                        {/* Difference between current and previous */}
                        <div className={`flex items-center justify-center text-lg ${difference > 0 ? 'text-green-500'
                            : difference < 0 ? 'text-red-500'
                                : 'text-slate-50'
                            }`}>
                            <Icon
                                icon={
                                    difference > 0
                                        ? "streamline:money-graph-arrow-increase-ascend-growth-up-arrow-stats-graph-right-grow"
                                        : difference < 0
                                            ? "streamline:money-graph-arrow-decrease-down-stats-graph-descend-right-arrow"
                                            : "pepicons-pop:line-x"
                                }
                                className="mr-1"
                            />
                            <span>{difference !== 0 ? `${Math.abs(difference).toLocaleString('es-ES')} €` : '0 €'}</span>
                        </div>

                        {/* Performance percentage change */}
                        <div className={`flex items-center justify-center text-lg ${isPositiveChange ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-slate-50'}`}>
                            <Icon icon={isPositiveChange ? 'mdi:arrow-up-bold' : change < 0 ? 'mdi:arrow-down-bold' : 'pepicons-pop:line-x'} className="mr-1" />
                            <span>{change !== 0 ? `${Math.abs(change)}%` : '0%'}</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300} style={{ marginLeft: '-50px' }}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorComisionTotal" x1="0" y1="0" x2="0" y2="1">
                                    {gradientColors.map((color, index) => (
                                        <stop
                                            key={index}
                                            offset={`${(index / (gradientColors.length - 1)) * 100}%`}
                                            stopColor={color}
                                            stopOpacity={1}
                                        />
                                    ))}
                                </linearGradient>
                            </defs>
                            {/* Remove the grid */}
                            {/* <CartesianGrid strokeDasharray="1 1" /> */}

                            {/* Use the wrapper components here */}
                            <XAxisWrapper />
                            <YAxisWrapper />

                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="comisionTotal"
                                stroke="#8884d8"
                                fillOpacity={1}
                                fill="url(#colorComisionTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                </>
            )}
        </div>
    );
};

export default ComisionTotalAreaChart;
