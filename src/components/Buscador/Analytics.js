import { it } from 'date-fns/locale';
import React, { useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = ({ analyticsData }) => {
    // Extract responsables data and total from analyticsData
    const responsablesData = analyticsData.find(data => data.name === 'Responsables').value;
    const totalItems = analyticsData.find(data => data.name === 'Total').value;


    // Prepare data for the PieChart
    const chartData = responsablesData.map(item => ({
        name: item.responsable === 'NULL' ? 'Sin asignar' : item.responsable,
        value: (item.count / totalItems) * 100, // Calculate percentage
        count: item.count,
    }));

    useEffect(() => {
        console.log('chartData', chartData);
        console.log('totalItems', totalItems);
    }, [chartData]);

    // Define colors for the pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#FFCE56'];

    // Custom label to format percentage and count with a break line
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, index }) => {
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
                <tspan x={x} >{`${chartData[index].value.toFixed(2)}%`}</tspan>
                <tspan x={x} dy="1.2em">{`Total: \n${chartData[index].count}`}</tspan>
            </text>
        );
    };

    // Custom Legend Renderer
    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <ul className="flex flex-row flex-wrap justify-center"> {/* Tailwind classes for styling */}
                {payload.map((entry, index) => (
                    <li key={`item-${index}`} className="mx-4 my-2 flex items-center">
                        <div
                            className="w-4 h-4 mr-2 rounded-md"
                            style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{entry.value}</span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="flex flex-col gap-1 justify-center items-center bg-slate-200 rounded-lg p-4 shadow-md">
            <h2 className="text-center text-xl font-bold">Inmuebles asignados <br /> a asesores</h2>
            <div className='w-full h-52'>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            fill="#8884d8"
                            label={renderCustomLabel}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                        <Legend content={renderLegend} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Analytics;
