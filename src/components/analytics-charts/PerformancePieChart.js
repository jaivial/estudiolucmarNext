// components/analytics-charts/PerformancePieChart.js
import React from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from 'recharts';

const PerformancePieChart = ({ performance }) => {
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    const chartData = [
        { name: 'Week', value: performance.week.ventasPerformance },
        { name: 'Month', value: performance.month.ventasPerformance },
        { name: '6 Months', value: performance.sixMonths.ventasPerformance },
        { name: 'Year', value: performance.year.ventasPerformance }
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" label>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default PerformancePieChart;
