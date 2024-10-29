// components/analytics-charts/TotalCountsDiv.js
import React, { useEffect } from 'react';

const TotalCountsDiv = ({ counts }) => {


    useEffect(() => {
        console.log('counts', counts);
    }, [counts]);

    // Define display labels for each count
    const countLabels = {
        totalInmueblesZone: "Inmuebles en Zona",
        totalNoticias: "Noticias",
        totalEncargos: "Encargos",
        totalEncargosFinalizados: "Encargos Finalizados",
    };

    return (
        <div className="bg-slate-50 rounded-3xl text-slate-800 p-6 m-4 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-center">Resumen de Totales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(countLabels).map(([key, label]) => {
                    // Find the relevant count object in the array
                    const countData = counts.find(count => count[key] !== undefined);
                    const countValue = countData ? countData[key] : 0;

                    return (
                        <div key={key} className="flex flex-col items-center justify-center text-center bg-slate-100 rounded-xl p-4">
                            <p className="text-lg font-medium">{label}</p>
                            <p className="text-2xl font-bold">{countValue}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TotalCountsDiv;
