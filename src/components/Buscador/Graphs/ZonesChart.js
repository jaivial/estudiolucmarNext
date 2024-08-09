import React, { useState } from 'react';
import { PieChart, Pie, Sector, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomActiveShapePieChart = ({ analyticsData }) => {
    // Extract "Zonas" data from analyticsData
    const zonasData = analyticsData.find(data => data.name === 'Zonas')?.value || [];

    // Process the data to replace "NULL" with "Sin zona"
    const processedZonasData = zonasData.map(item => ({
        zona: item.zona === 'NULL' ? 'Sin zona' : item.zona,
        count: item.count,
    }));

    // State to track active index for custom active shape
    const [activeIndex, setActiveIndex] = useState(0);

    // Custom active shape for the pie chart
    const renderActiveShape = (props) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 8) * cos;
        const sy = cy + (outerRadius + 8) * sin;
        const mx = cx + (outerRadius + 18) * cos;
        const my = cy + (outerRadius + 18) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 20;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
                <text x={cx} y={cy} dy={8} textAnchor="middle" fill='#000' style={{ fontSize: '0.8rem' }}>
                    {payload.zona}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 4}
                    outerRadius={outerRadius + 8}
                    fill={fill}
                />
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                <circle cx={ex} cy={ey} r={4} fill={fill} stroke="none" />
                <text x={ex + (cos >= 0 ? 1 : -1) * 10} y={ey} textAnchor={textAnchor} fill="#333" style={{ fontSize: '0.9rem' }}>{`${value}`}</text>
                <text x={ex + (cos >= 0 ? 1 : -1) * 2} y={ey} dy={22} textAnchor={textAnchor} fill="#999" style={{ fontSize: '0.9rem' }}>
                    {`(${(percent * 100).toFixed(2)}%)`}
                </text>
            </g>
        );
    };

    // Handle active index change
    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    const COLORS = [
        '#40A2E3', // Vivid Sky Blue
        '#03346E', // Deep Blue
        '#0088FE', // Blue
        '#00C49F', // Cyan
        '#FFBB28', // Yellow
        '#FF8042', // Orange
        '#0D9276', // Dark Teal
        '#82C4E6', // Light Blue
        '#A7E3D4', // Mint Green
        '#CCE8F5', // Pale Blue
    ];



    const renderCustomLegend = () => {
        return (
            <ul className="grid grid-cols-2 gap-2 justify-center items-center -mt-8">
                {processedZonasData.map((entry, index) => (
                    <li key={`item-${index}`} className="flex items-center">
                        <div
                            className="w-4 h-4 mr-2 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium">{entry.zona}</span>
                    </li>
                ))}
            </ul>
        );
    };


    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { zona, count } = payload[0].payload;

            return (
                <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
                    <p className="text-sm font-medium text-gray-700">{`${zona} ${count}`}</p>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col gap-1 justify-center items-center bg-slate-100 rounded-xl p-4 shadow-lg w-full h-auto">
            <h2 className="text-center text-xl font-bold">Inmuebles asignados <br /> a zonas</h2>
            <div className='h-72 w-full -mt-12'>
                <ResponsiveContainer>
                    {processedZonasData.length > 0 ? (
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={processedZonasData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="count"
                                onMouseEnter={onPieEnter}
                            >
                                {processedZonasData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={renderCustomLegend} />
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

export default CustomActiveShapePieChart;
