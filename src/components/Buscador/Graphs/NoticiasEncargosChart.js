import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const SimpleBarChart = ({ analyticsData }) => {
    // Extract "Noticias" and "Encargos" data from analyticsData
    const noticiasData = analyticsData.find(data => data.name === 'Noticias')?.value || 0;
    const encargosData = analyticsData.find(data => data.name === 'Encargos')?.value || 0;

    // Prepare data for the bar chart
    const barChartData = [
        { name: 'Noticias', count: noticiasData },
        { name: 'Encargos', count: encargosData },
    ];

    // Custom Tooltip Component
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { name, count } = payload[0].payload;
            return (
                <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
                    <p className="text-sm font-medium text-gray-700">{name}</p>
                    <p className="text-sm font-medium text-gray-700">Total: {count}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-1 justify-center items-center bg-slate-100 rounded-xl p-4 shadow-lg w-full h-auto">
            <h2 className="text-center text-xl font-bold">Noticias y Encargos</h2>
            <div className="h-72 w-full">
                <ResponsiveContainer>
                    <BarChart
                        data={barChartData}
                        margin={{
                            top: 20, right: 30, left: 20, bottom: 5,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0B0785" />
                                <stop offset="25%" stopColor="#162899" />
                                <stop offset="50%" stopColor="#224AAE" />
                                <stop offset="75%" stopColor="#2D6CC2" />
                                <stop offset="100%" stopColor="#388DD6" />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fill: '#000' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" fill="url(#colorGradient)" radius={[15, 15, 0, 0]} barSize={90}>
                            <LabelList dataKey="count" position="top" fill='#000' style={{ fontSize: '16px' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SimpleBarChart;
