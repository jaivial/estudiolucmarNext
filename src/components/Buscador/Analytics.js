import React, { useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const Analytics = ({ analyticsData }) => {
    // Safely extract data using optional chaining and provide default values if data is undefined
    const responsablesData = analyticsData.find(data => data.name === 'Responsables')?.value || [];
    const totalItems = analyticsData.find(data => data.name === 'Total')?.value || 0;
    const categoriasData = analyticsData.find(data => data.name === 'Categorias')?.value || [];

    // Prepare data for the charts
    const chartData = responsablesData.map(item => ({
        name: item.responsable === 'NULL' ? 'Sin asignar' : item.responsable,
        value: (item.count / totalItems) * 100, // Calculate percentage
        count: item.count,
    }));

    // Apply logarithmic scaling to the count values to adjust bar heights
    const barChartData = categoriasData.map(item => ({
        name: item.categoria === 'NULL' ? 'Sin categoria' : item.categoria,
        count: item.count,
        scaledCount: item.count > 0 ? Math.log10(item.count) : 0, // Apply log10 to count values
    }));

    useEffect(() => {
        console.log('barChartData', barChartData);
        console.log('chartData', chartData);
        console.log('totalItems', totalItems);
    }, [barChartData, chartData, totalItems]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#36A2EB', '#FFCE56'];
    const COLORSBARCHART = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
                <tspan x={x}>{`${chartData[index].value.toFixed(2)}%`}</tspan>
                <tspan x={x} dy="1.2em">{`Total: \n${chartData[index].count}`}</tspan>
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
                            style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{entry.value}</span>
                    </li>
                ))}
            </ul>
        );
    };

    const renderCustomBarLabel = ({ x, y, width, index }) => {
        // Directly access barChartData by index
        const count = barChartData[index].count;

        return (
            <text x={x + width / 2} y={y - 6} fill="#666" textAnchor="middle">
                {count}
            </text>
        );
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const count = payload[0].payload.count; // Access the count value

            return (
                <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded shadow-lg">
                    <p className="label font-medium">{`${label}`}</p>
                    <p className="intro">{`${count} inmuebles`}</p>
                </div>
            );
        }

        return null;
    };





    // Check if any of the required data is missing or empty
    const isBarChartDataAvailable = barChartData.length > 0 && totalItems > 0 && categoriasData.length > 0;
    const isPieChartDataAvailable = chartData.length > 0 && totalItems > 0 && responsablesData.length > 0;

    return (
        <div className='flex flex-col gap-4 justify-center items-center'>
            <div className="flex flex-col gap-1 justify-center items-center bg-slate-100 rounded-xl p-4 shadow-lg w-full h-80 pt-5">
                <h2 className="text-center text-xl font-bold">Distribución de Categorías</h2>
                <ResponsiveContainer>
                    {isBarChartDataAvailable ? (
                        <BarChart data={barChartData} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="scaledCount" fill="#8884d8" label={renderCustomBarLabel}>
                                {barChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORSBARCHART[index % COLORSBARCHART.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    ) : (
                        <div className="flex justify-center items-center w-full h-full">
                            <p className="text-center text-lg font-medium text-gray-700">No hay datos disponibles</p>
                        </div>
                    )}
                </ResponsiveContainer>
            </div>

            <div className="flex flex-col gap-1 justify-center items-center bg-slate-100 rounded-xl p-4 shadow-lg w-full h-80">
                <h2 className="text-center text-xl font-bold">Inmuebles asignados <br /> a asesores</h2>
                <ResponsiveContainer>
                    {isPieChartDataAvailable ? (
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

export default Analytics;
