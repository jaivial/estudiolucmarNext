import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DPVBarChart = ({ analyticsData }) => {
    const dpvData = analyticsData?.DPV || [];
    const totalItems = Object.values(dpvData).reduce((sum, value) => sum + value, 0);

    // Prepare data for the chart, handling 'null' and empty strings
    const chartData = Object.entries(dpvData)
        .filter(([key]) => key !== 'NULL' && key !== 'null') // Filter out 'NULL' and 'null' keys
        .map(([key, count], index) => {
            const normalizedKey = key === 'true' ? 'Sí' : 'No';
            return {
                name: normalizedKey,
                value: (count / totalItems) * 100,
                count: count,
                gradientId: `colorGradient${index % 8}`,
            };
        });
    // 8 Balanced Color Palettes with Three Gradient Colors
    const gradients = [
        ['#1A237E', '#3949AB', '#7986CB'],  // Dark Indigo to Medium Blue to Light Blue
        ['#B71C1C', '#E53935', '#EF9A9A'],  // Dark Red to Bright Red to Light Red
        ['#1B5E20', '#4CAF50', '#A5D6A7'],  // Dark Green to Bright Green to Light Green
        ['#4A148C', '#8E24AA', '#CE93D8'],  // Dark Purple to Medium Purple to Light Purple
        ['#6A1B9A', '#AB47BC', '#D1C4E9'],  // Dark Violet to Bright Violet to Soft Violet
        ['#F57F17', '#FFB300', '#FFE082'],  // Dark Amber to Bright Amber to Light Amber
        ['#0D47A1', '#2196F3', '#90CAF9'],  // Dark Blue to Medium Blue to Light Blue
        ['#3E2723', '#795548', '#D7CCC8'],  // Dark Brown to Medium Brown to Light Brown
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

    const isPieChartDataAvailable = chartData.length > 0 && totalItems > 0;

    return (
        <div className="flex flex-col gap-1 justify-center items-center bg-slate-100 rounded-xl p-4 shadow-lg w-full h-auto mb-6">
            <h2 className="text-center text-xl font-bold">Distribución de DPV</h2>
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

export default DPVBarChart;