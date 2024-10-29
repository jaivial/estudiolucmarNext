// components/analytics-charts/VentasAlquilerPieChart.js
import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, Tab } from 'rsuite';
import Lottie from 'lottie-react';
import houseContractAnimation from '../../../public/assets/gif/housecontract.json';

const VentasAlquilerPieChart = ({ data }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    const transformValue = (value) => Math.sqrt(value); // Change to Math.log10(value) if preferred

    const periods = {
        week: {
            name: 'Semana',
            data: [
                { name: 'Ventas', value: transformValue(data.currentWeek.ventasSum) },
                { name: 'Alquiler', value: transformValue(data.currentWeek.alquilerSum) }
            ],
        },
        month: {
            name: 'Mes',
            data: [
                { name: 'Ventas', value: transformValue(data.currentMonth.ventasSum) },
                { name: 'Alquiler', value: transformValue(data.currentMonth.alquilerSum) }
            ],
        },
        sixMonths: {
            name: '6 Meses',
            data: [
                { name: 'Ventas', value: transformValue(data.current6Months.ventasSum) },
                { name: 'Alquiler', value: transformValue(data.current6Months.alquilerSum) }
            ],
        },
        year: {
            name: 'Año',
            data: [
                { name: 'Ventas', value: transformValue(data.currentYear.ventasSum) },
                { name: 'Alquiler', value: transformValue(data.currentYear.alquilerSum) }
            ],
        },
    };

    const gradientColors = ['#e0f2fe', '#93c5fd', '#3b82f6', '#1e3a8a'];

    // Check if all values in the current period are zero
    const isDataEmpty = periods[selectedPeriod].data.every(entry => entry.value === 0);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
            <h4 className="text-slate-50 pb-3 text-lg">Comparación de ventas y alquiler</h4>
            <Tabs
                appearance="pills"
                activeKey={selectedPeriod}
                onSelect={setSelectedPeriod}
                className=" text-white -mb-2"
            >
                <Tab eventKey="week" title="Semana" />
                <Tab eventKey="month" title="Mes" />
                <Tab eventKey="sixMonths" title="6 Meses" />
                <Tab eventKey="year" title="Año" />
            </Tabs>

            {isDataEmpty ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-50">
                    <Lottie animationData={houseContractAnimation} style={{ width: 250, height: 250 }} loop />
                    <p className="mt-0">Todavía no hay datos disponibles para este período.</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={periods[selectedPeriod].data}
                            cx="50%"
                            cy="50%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${Math.round((value / (periods[selectedPeriod].data.reduce((acc, curr) => acc + curr.value, 0))) * 100)}%`}
                        >
                            {periods[selectedPeriod].data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={gradientColors[index % gradientColors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default VentasAlquilerPieChart;
