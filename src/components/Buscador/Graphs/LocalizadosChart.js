import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const StraightAnglePieChart = ({ analyticsData }) => {
    // Extract "Localizados" and "Total" data from analyticsData
    const localizadoData = analyticsData.localizado || {};
    const totalValue = analyticsData.totalInmuebles || 0;

    // Find the count for true values in localizado
    const localizadosValue = localizadoData.true || 0;

    // Calculate "No Localizados" value
    const noLocalizadosValue = totalValue - localizadosValue;

    // Adjust localizadosValue if it is less than 40
    const adjustedLocalizadosValue = localizadosValue < 1 ? localizadosValue + (5 - localizadosValue) / 2 : localizadosValue;

    // Apply log10 to values for better visual balance if necessary
    const logLocalizados = adjustedLocalizadosValue > 0 ? Math.sqrt(adjustedLocalizadosValue) : 0;
    const logNoLocalizados = noLocalizadosValue > 0 ? Math.sqrt(noLocalizadosValue) : 0;

    // Function to capitalize the first letter of each word
    const capitalizeWords = (str) => {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    };

    // Prepare data for the pie chart, including both log10 values and the original values for tooltip
    const pieChartData = [
        { name: capitalizeWords('localizados'), value: logLocalizados, originalValue: localizadosValue },
        { name: capitalizeWords('no localizados'), value: logNoLocalizados, originalValue: noLocalizadosValue },
    ];

    // Custom Tooltip Component showing the original total value
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const { name, originalValue } = payload[0].payload;
            return (
                <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
                    <p className="text-sm font-medium text-gray-700">{name}</p>
                    <p className="text-sm font-medium text-gray-700">Total: {originalValue}</p>
                </div>
            );
        }
        return null;
    };

    // Custom Legend Component with rounded squares
    const CustomLegend = () => {
        return (
            <ul className="flex justify-center gap-4 -mt-16">
                {pieChartData.map((entry, index) => (
                    <li key={`item-${index}`} className="flex items-center">
                        <div
                            className="w-4 h-4 rounded-lg mr-2"
                            style={{
                                backgroundColor: entry.name === capitalizeWords('localizados') ? '#224AAE' : '#C0C0C0',
                                backgroundImage: entry.name === capitalizeWords('localizados')
                                    ? 'linear-gradient(180deg, #0B0785, #388DD6)'
                                    : 'none'
                            }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="flex flex-col justify-center items-center bg-slate-100 rounded-xl pt-4 shadow-lg w-full h-auto mb-4">
            <h2 className="text-center text-xl font-bold">Localizados vs No Localizados</h2>
            <div className="h-56 w-full -mb-3">
                <ResponsiveContainer>
                    <PieChart>
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0B0785" />
                                <stop offset="25%" stopColor="#162899" />
                                <stop offset="50%" stopColor="#224AAE" />
                                <stop offset="75%" stopColor="#2D6CC2" />
                                <stop offset="100%" stopColor="#388DD6" />
                            </linearGradient>
                        </defs>
                        <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={55}
                            outerRadius={80}
                            fill="url(#colorGradient)"
                            dataKey="value"
                            isAnimationActive={false}
                        >
                            {pieChartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.name === capitalizeWords('localizados') ? 'url(#colorGradient)' : '#C0C0C0'}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                    <CustomLegend />
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StraightAnglePieChart;
