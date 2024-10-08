import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const SimpleBarChart = ({ analyticsData }) => {
    // Extract "Noticias" and "Encargos" data from analyticsData
    const noticiastateData = analyticsData.noticiastate || {};
    const encargostateData = analyticsData.encargostate || {};

    // Find the count for true values in noticiastate and encargostate
    const noticiasData = noticiastateData.true || 0;
    const encargosData = encargostateData.true || 0;

    // Prepare raw data for the bar chart
    const rawBarChartData = [
        { name: 'Noticias', count: noticiasData },
        { name: 'Encargos', count: encargosData },
    ];

    // Calculate the maximum count
    const maxCount = Math.max(noticiasData, encargosData);

    // Apply square root scaling if maxCount is less than 40, otherwise apply log2 scaling
    const barChartData = rawBarChartData.map(item => ({
        ...item,
        scaledCount: maxCount < 40 ? Math.sqrt(item.count) : Math.log2(item.count + 20),  // Adding 20 to avoid log2(0)
    }));

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

    // Function to capitalize the first letter of each word
    const capitalizeWords = (str) => {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    };

    // // Process zonas data to replace "null" with "Sin zona" and capitalize words
    // const processedZonasData = Object.keys(analyticsData.zonas).map(key => {
    //     const zona = key === 'null' || key === 'NULL' ? 'Sin zona' : capitalizeWords(key);
    //     return {
    //         zona,
    //         count: analyticsData.zonas[key],
    //     };
    // });

    // // Process responsables data to capitalize words
    // const processedResponsablesData = Object.keys(analyticsData.responsables).map(key => {
    //     const responsable = key === 'null' || key === 'NULL' ? 'Sin asignar' : capitalizeWords(key);
    //     return {
    //         responsable,
    //         count: analyticsData.responsables[key],
    //     };
    // });

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
                        <Bar dataKey="scaledCount" fill="url(#colorGradient)" radius={[15, 15, 0, 0]} barSize={80}>
                            <LabelList dataKey="count" position="top" fill='#000' style={{ fontSize: '16px' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SimpleBarChart;
