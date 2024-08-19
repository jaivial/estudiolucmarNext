import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CategoriasChart = ({ analyticsData }) => {
    // Safely extract data from analyticsData
    const categoriasData = analyticsData?.categorias || {};

    // Convert the categorias object into an array of { name, count } objects
    const rawBarChartData = Object.entries(categoriasData).map(([key, count]) => {
        // Normalizamos el nombre de la categoría
        const normalizedKey = key === 'NULL' || key === '' ? 'Sin categoria' : key;
        // Convertimos la primera letra en mayúscula y el resto en minúsculas
        const name = normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1).toLowerCase();

        return {
            name,
            count,
        };
    });


    // Determine the maximum count value
    const maxCount = Math.max(...rawBarChartData.map(item => item.count));

    // Apply square root scaling if maxCount is less than 40, otherwise apply log10 scaling
    const barChartData = rawBarChartData.map(item => ({
        ...item,
        scaledCount: maxCount < 40 ? Math.sqrt(item.count) : Math.log2(item.count + 20),
    }));

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
    const isBarChartDataAvailable = barChartData.length > 0;

    return (
        <div className="flex flex-col gap-1 justify-center items-center bg-slate-100 rounded-xl p-4 shadow-lg w-full h-auto pt-5">
            <h2 className="text-center text-xl font-bold">Distribución de Categorías</h2>
            <div className='h-[220px] w-full'> {/* Increased height to make bars taller */}
                <ResponsiveContainer>
                    {isBarChartDataAvailable ? (
                        <BarChart data={barChartData} margin={{ top: 30, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0B0785" />
                                    <stop offset="25%" stopColor="#162899" />
                                    <stop offset="50%" stopColor="#224AAE" />
                                    <stop offset="75%" stopColor="#2D6CC2" />
                                    <stop offset="100%" stopColor="#388DD6" />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                radius={[15, 15, 0, 0]}
                                dataKey="scaledCount"
                                fill="url(#colorGradient)"
                                label={renderCustomBarLabel}
                                barSize={55} // Adjust barSize to make the bars taller
                            >
                                {barChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
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
        </div >
    );
};

export default CategoriasChart;
