// components/analytics-charts/TotalComisionRadialChart.js
import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const TotalComisionRadialChart = ({ totalComision }) => {
    const chartData = [
        { name: 'Total Comision', value: totalComision, fill: '#8884d8' }
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart innerRadius="10%" outerRadius="80%" data={chartData} startAngle={180} endAngle={0}>
                <RadialBar minAngle={15} label={{ fill: '#8884d8', position: 'insideStart' }} background dataKey="value" />
                <Legend />
                <Tooltip />
            </RadialBarChart>
        </ResponsiveContainer>
    );
};

export default TotalComisionRadialChart;
