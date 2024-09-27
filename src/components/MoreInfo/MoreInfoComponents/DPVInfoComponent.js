import React, { use, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { useState } from 'react';
import { Accordion, Panel, Modal, Button, InputNumber, DatePicker, CustomProvider, SelectPicker, InputPicker } from 'rsuite';
import esES from 'rsuite/locales/es_ES';


const DPVInfoComponent = ({ DPVInfo }) => {


    useEffect(() => {
        console.log('DPVInfo', DPVInfo);
    }, []);

    return (
        <Accordion defaultActiveKey={['0']} className='w-auto ml-[16px] mr-[16px] mt-[20px] border-1 border-gray-300 bg-gray-100 rounded-lg shadow-lg'>
            <Accordion.Panel header="DPV" eventKey="0" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {DPVInfo && (
                    <div className="p-4 flex flex-col gap-4 items-center" style={{ width: '100%' }}>
                        <div className="bg-slate-200 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                            <h3 className="text-lg font-medium text-gray-700">Estado del DPV:</h3>
                            <p className="text-gray-600 text-base">{DPVInfo.estadoDPV}</p>
                        </div>
                        <div className="bg-slate-200 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                            <h3 className="text-lg font-medium text-gray-700">Nombre de la inmobiliaria:</h3>
                            <p className="text-gray-600 text-base">{DPVInfo.nombreInmobiliaria}</p>
                        </div>
                        <div className="bg-slate-200 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                            <h3 className="text-lg font-medium text-gray-700">Link de la inmobiliaria:</h3>
                            <a href={DPVInfo.linkInmobiliaria} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {DPVInfo.linkInmobiliaria.length > 35 ? DPVInfo.linkInmobiliaria.substring(0, 35) + '...' : DPVInfo.linkInmobiliaria}
                            </a>
                        </div>
                        <div className="bg-slate-200 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                            <h3 className="text-lg font-medium text-gray-700">Teléfono:</h3>
                            <p className="text-gray-600 text-base">{DPVInfo.telefono}</p>
                        </div>
                        <div className='flex flex-row gap-6 justify-center items-stretch h-auto'>
                            <div className="bg-slate-200 rounded-md p-3 flex flex-col gap-2 w-full items-center justify-center">
                                <h3 className="text-lg font-medium text-gray-700 text-center">Precio actual:</h3>
                                <p className="text-gray-600 text-center text-base">{DPVInfo.precioActual.toLocaleString('de-DE')} €</p>
                            </div>
                            <div className="bg-slate-200 rounded-md p-3 flex flex-col gap-2 w-full items-center justify-center">
                                <h3 className="text-lg font-medium text-gray-700 text-center">Valoración estimada:</h3>
                                <p className="text-gray-600 text-center text-base">{DPVInfo.valoracionEstimada.toLocaleString('de-DE')} €</p>
                            </div>
                        </div>
                        <div className={`rounded-md p-3 flex flex-col gap-2 w-full items-center ${DPVInfo.precioActual - DPVInfo.valoracionEstimada < 20000 ? 'bg-red-300' : DPVInfo.precioActual - DPVInfo.valoracionEstimada <= 40000 ? 'bg-orange-300' : 'bg-slate-200'}`}>
                            <h3 className="text-lg font-medium text-gray-700">Distancia precio:</h3>
                            <p className="text-gray-600 text-base">{(DPVInfo.precioActual - DPVInfo.valoracionEstimada).toLocaleString('de-DE')} €</p>
                        </div>
                        <div className="bg-slate-200 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                            <h3 className="text-lg font-medium text-gray-700">Fecha de publicación:</h3>
                            <p className="text-gray-600 text-base">
                                {DPVInfo.fechaPublicacion ? format(parseISO(DPVInfo.fechaPublicacion), 'dd-MM-yyyy') : 'Fecha no establecida'}
                            </p>
                        </div>
                    </div>
                )}
            </Accordion.Panel>
        </Accordion>

    );
};

export default DPVInfoComponent;
