import React, { useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { useState } from 'react';

const DPVInfoComponent = ({ inmuebleId }) => {
    const [DPVInfo, setDPVInfo] = useState(null);
    const showToast = (message, backgroundColor) => {
        Toastify({
            text: message,
            duration: 2500,
            gravity: 'top',
            position: 'center',
            stopOnFocus: true,
            style: {
                borderRadius: '10px',
                backgroundImage: backgroundColor,
                textAlign: 'center',
            },
            onClick: function () { },
        }).showToast();
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/dpv/`, { params: { inmuebleId } });
            // Set fetched data to state variables
            if (response.data) {
                console.log('response.data', response.data);
                setDPVInfo(response.data);
                setDPVInfo(prevState => ({
                    ...prevState,
                    DPVboolean: true
                }));
            }
        } catch (error) {
            console.error('Error fetching DPV data:', error);
            showToast('Error al obtener los datos del DPV.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="p-4 flex flex-col gap-4 items-center" style={{ width: '100%' }}>
            <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                <h3 className="text-lg font-medium text-gray-700">Estado del DPV:</h3>
                <p className="text-gray-600">{DPVInfo.estadoDPV}</p>
            </div>
            <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                <h3 className="text-lg font-medium text-gray-700">Nombre de la inmobiliaria:</h3>
                <p className="text-gray-600">{DPVInfo.nombreInmobiliaria}</p>
            </div>
            <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                <h3 className="text-lg font-medium text-gray-700">Link de la inmobiliaria:</h3>
                <a href={DPVInfo.linkInmobiliaria} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {DPVInfo.linkInmobiliaria.length > 35 ? DPVInfo.linkInmobiliaria.substring(0, 35) + '...' : DPVInfo.linkInmobiliaria}
                </a>
            </div>
            <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                <h3 className="text-lg font-medium text-gray-700">Teléfono:</h3>
                <p className="text-gray-600">{DPVInfo.telefono}</p>
            </div>
            <div className='flex flex-row gap-6 justify-center items-stretch h-auto'>
                <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center justify-center">
                    <h3 className="text-lg font-medium text-gray-700 text-center">Precio actual:</h3>
                    <p className="text-gray-600 text-center">{DPVInfo.precioActual} €</p>
                </div>
                <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center justify-center">
                    <h3 className="text-lg font-medium text-gray-700 text-center">Valoración estimada:</h3>
                    <p className="text-gray-600 text-center">{DPVInfo.valoracionEstimada} €</p>
                </div>
            </div>
            <div className={`rounded-md p-3 flex flex-col gap-2 w-full items-center ${DPVInfo.precioActual - DPVInfo.valoracionEstimada < 20000 ? 'bg-red-300' : DPVInfo.precioActual - DPVInfo.valoracionEstimada <= 40000 ? 'bg-orange-300' : 'bg-gray-100'}`}>
                <h3 className="text-lg font-medium text-gray-700">Distancia precio:</h3>
                <p className="text-gray-600">{DPVInfo.precioActual - DPVInfo.valoracionEstimada} €</p>
            </div>
            <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                <h3 className="text-lg font-medium text-gray-700">Fecha de publicación:</h3>
                <p className="text-gray-600">
                    {DPVInfo.fechaPublicacion ? format(parseISO(DPVInfo.fechaPublicacion), 'dd-MM-yyyy') : ''}
                </p>
            </div>
        </div>
    );
};

export default DPVInfoComponent;
