import React, { useEffect } from 'react';
import ZonesChart from './Graphs/ZonesChart.js';
import NoticiasEncargosChart from './Graphs/NoticiasEncargosChart.js';
import LocalizadosChart from './Graphs/LocalizadosChart.js';
import CategoriasChart from './Graphs/CategoriasChart.js';
import AsesoresChart from './Graphs/AsesoresChart.js';

const Analytics = ({ analyticsData }) => {

    return (
        <div className='flex flex-col gap-4 justify-center items-center'>
            <CategoriasChart analyticsData={analyticsData} />
            <AsesoresChart analyticsData={analyticsData} />
            <ZonesChart analyticsData={analyticsData} />
            <NoticiasEncargosChart analyticsData={analyticsData} />
            <LocalizadosChart analyticsData={analyticsData} />
        </div>
    );
};

export default Analytics;
