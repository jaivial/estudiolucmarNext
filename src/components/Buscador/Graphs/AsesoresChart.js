import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SimpleBarChart = ({ analyticsData }) => {
    // Safely extract data using optional chaining and provide default values if data is undefined
    const responsablesData = analyticsData.find(data => data.name === 'Responsables')?.value || [];
    const totalItems = analyticsData.find(data => data.name === 'Total')?.value || 0;

    // Prepare data for the charts
    const chartData = responsablesData.map((item, index) => ({
        name: item.responsable === 'NULL' ? 'Sin asignar' : item.responsable,
        value: (item.count / totalItems) * 100, // Calculate percentage
        count: item.count,
        gradientId: `colorGradient${index % 8}`, // Unique gradient ID for each slice, cycling through 8 gradients
    }));

    // 8 Diverse Color Palettes
    const gradients = [
        ['#0B0785', '#388DD6'],  // Deep Blue to Light Blue
        ['#1E1E1E', '#585858'],  // Black to Grey
        ['#172B3C', '#62727B'],  // Dark Slate to Slate Grey
        ['#005F73', '#94D2BD'],  // Teal to Mint
        ['#3A0CA3', '#F72585'],  // Purple to Pink
        ['#FF6700', '#FFC300'],  // Orange to Yellow
        ['#283618', '#606C38'],  // Olive to Moss Green
        ['#6D597A', '#B56576'],  // Dusty Rose to Mauve
    ];

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = 25 + innerRadius + (outerRadius - innerRadius);
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="black"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                style={{ fontSize: '0.9em' }}
            >
                {`Total: ${chartData[index].count}`}
            </text>
        );
    };

    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <ul className="flex flex-row flex-wrap justify-center">
                {payload.map((entry, index) => (
                    <li key={`item-${index}`} className="mx-4 my-2 flex items-center">
                        <div
                            className="w-4 h-4 mr-2 rounded-md"
                            style={{
                                background: `linear-gradient(180deg, ${gradients[index % 8][0]}, ${gradients[index % 8][1]})`,
                            }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{entry.value}</span>
                    </li>
                ))}
            </ul>
        );
    };

    const isPieChartDataAvailable = chartData.length > 0 && totalItems > 0 && responsablesData.length > 0;

    return (
        <div className="flex flex-col gap-1 justify-center items-center bg-slate-100 rounded-xl p-4 shadow-lg w-full h-auto">
            <h2 className="text-center text-xl font-bold">Inmuebles asignados <br /> a asesores</h2>
            <div className='h-72 w-full'>
                <ResponsiveContainer>
                    {isPieChartDataAvailable ? (
                        <PieChart>
                            <defs>
                                {chartData.map((entry, index) => (
                                    <linearGradient id={entry.gradientId} x1="0" y1="0" x2="0" y2="1" key={index}>
                                        <stop offset="0%" stopColor={gradients[index % 8][0]} />
                                        <stop offset="100%" stopColor={gradients[index % 8][1]} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={60}
                                fill="#8884d8"
                                label={renderCustomLabel}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`url(#${entry.gradientId})`} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                            <Legend content={renderLegend} />
                        </PieChart>
                    ) : (
                        <div className="flex justify-center items-center w-full h-full">
                            <p className="text-center text-lg font-medium text-gray-700">No hay datos disponibles</p>
                        </div>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SimpleBarChart;
