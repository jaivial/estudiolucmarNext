import React from 'react';
import { Icon } from '@iconify/react';
import dynamic from 'next/dynamic'; // Import dynamic from next/dynamic

const DetailsInfoOne = dynamic(() => import('./MoreInfoComponents/DetailsInfoOne.js'));

import LocalizadoCard from './MoreInfoComponents/LocalizadoCard';


const desktopAdditionalInfo = ({ data, encargoData, isVisible, setIsVisible, screenWidth, inmuebles_asociados_inquilino, inmuebles_asociados_propietario, inmuebles_asociados_informador, nombre, apellido, inmuebleId }) => {

    return (
        <>
            <div className={`${screenWidth < 705 ? 'flex flex-col w-full' : 'flex flex-col gap-4'}`}>
                <div className='flex flex-col gap-6'>
                    <div className='h-auto w-full ml-2'>
                        {data.inmueble.encargostate && data.inmueble.encargostate === true ? (
                            <>
                                {
                                    encargoData?.tipo_encargo === 'Venta' && (
                                        <div className='flex flex-row gap-1 items-center'>
                                            <Icon icon="codicon:circle-filled" className='text-green-500 text-2xl' />
                                            <p className='text-green-500 text-xl font-bold'>En venta</p>
                                        </div>
                                    )
                                }
                                {
                                    encargoData?.tipo_encargo === 'Alquiler' && (
                                        <div className='flex flex-row gap-1 items-center'>
                                            <Icon icon="codicon:circle-filled" className='text-green-500 text-2xl' />
                                            <p className='text-green-500 text-xl font-bold'>En alquiler</p>
                                        </div>
                                    )
                                }
                                {
                                    !encargoData && (
                                        <div className='flex flex-row gap-1 items-center'>
                                            <Icon icon="codicon:circle-filled" className='text-red-500 text-2xl' />
                                            <p className='text-red-500 text-xl font-bold'>No hay encargo</p>
                                        </div>
                                    )
                                }
                            </>
                        ) : data.inmueble.noticiastate && data.inmueble.noticiastate === true ? (
                            <>
                                <div className='flex flex-row gap-1 items-center'>
                                    <Icon icon="codicon:circle-filled" className='text-orange-500 text-2xl' />
                                    <p className='text-orange-500 text-xl font-bold'>Con noticia</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className='flex flex-row gap-1 items-center'>
                                    <Icon icon="codicon:circle-filled" className='text-red-500 text-2xl' />
                                    <p className='text-red-500 font-bold text-xl'>Sin actividad</p>
                                </div>
                            </>
                        )}
                    </div>
                    <div className='h-auto w-full ml-2'>
                        {encargoData?.precio_2 ? (
                            <>
                                {
                                    encargoData?.tipo_encargo === 'Venta' && (
                                        <p className='text-sans text-4xl text-slate-900 font-extrabold'>{encargoData.precio_2.toLocaleString('es-ES')} €</p>
                                    )
                                }
                                {
                                    encargoData?.tipo_encargo === 'Alquiler' && (
                                        <p className='text-sans text-4xl text-slate-900 font-extrabold'>{encargoData.precio_2.toLocaleString('es-ES')}  € / mes</p>
                                    )
                                }
                            </>
                        ) : (
                            <>
                                {
                                    encargoData?.tipo_encargo === 'Venta' && (
                                        <p className='text-sans text-4xl text-slate-900 font-extrabold'>{encargoData.precio_1.toLocaleString('es-ES')} €</p>
                                    )
                                }
                                {
                                    encargoData?.tipo_encargo === 'Alquiler' && (
                                        <p className='text-sans text-4xl text-slate-900 font-extrabold'>{encargoData.precio_1.toLocaleString('es-ES')}  € / mes</p>
                                    )
                                }
                            </>
                        )}
                    </div>
                    <div className='h-auto w-full flex flex-col'>
                        <h1 className="text-base font-semibold text-start w-full -mb-2 ml-2">{data.inmueble.direccion}</h1>
                        <DetailsInfoOne data={data} encargoData={encargoData} isVisible={isVisible} setIsVisible={setIsVisible} screenWidth={screenWidth} className='p-0' />
                    </div>
                </div>
                <div className='h-auto w-full'>
                    <LocalizadoCard data={data} inmuebles_asociados_informador={inmuebles_asociados_informador} inmuebles_asociados_inquilino={inmuebles_asociados_inquilino} inmuebles_asociados_propietario={inmuebles_asociados_propietario} nombre={nombre} apellido={apellido} inmuebleId={inmuebleId} />
                </div>
            </div >
        </>
    );

};

export default desktopAdditionalInfo;
