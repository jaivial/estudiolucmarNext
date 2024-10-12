import React, { use, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Tag } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';


const LocalizadoCard = ({ data, inmuebles_asociados_informador, inmuebles_asociados_inquilino, inmuebles_asociados_propietario, nombre, apellido, inmuebleId }) => {


    return (
        <>
            {data.inmueble.localizado ? (
                <div className="w-full flex flex-col justify-center items-center">
                    <div className="w-full bg-white border-blue-400 border-2 p-6 gap-4 rounded-lg shadow-md flex flex-col">
                        <div className="text-lg font-bold capitalize">Información del localizado</div>
                        <div className="flex flex-col gap-4">
                            <div className='flex flex-row gap-2 items-center'>
                                <p className='m-0'>Nombre:</p>
                                <p className='font-bold m-0'>{nombre} {apellido}</p>
                            </div>
                            <div className='flex flex-row gap-2 items-center'>
                                <p>Teléfono:</p>
                                <div className="flex flex-row gap-2 items-center">
                                    <p><a href={`tel:${data.inmueble.localizado_phone}`}>{data.inmueble.localizado_phone}</a></p>
                                    <a href={`tel:${data.inmueble.localizado_phone}`} className="rounded-md bg-slate-300 duration-300 p-2">
                                        <Icon icon="line-md:phone-call-loop" />
                                    </a>
                                </div>
                            </div>
                            {(
                                (inmuebles_asociados_inquilino?.some(inquilino => inquilino.id === inmuebleId)) ||
                                (inmuebles_asociados_propietario?.some(propietario => propietario.id === inmuebleId)) ||
                                (inmuebles_asociados_informador?.some(informador => informador.id === inmuebleId))
                            ) ? (
                                <div className="flex flex-row gap-2 items-center justify-start">
                                    <p>Tipo de Cliente:</p>
                                    <div>
                                        {inmuebles_asociados_inquilino?.some(inquilino => parseInt(inquilino.id) === parseInt(inmuebleId)) && (
                                            <Tag color="orange" style={{ marginBottom: '0px', marginRight: '5px' }}>Inquilino</Tag>
                                        )}
                                        {inmuebles_asociados_propietario?.some(propietario => propietario.id === inmuebleId) && (
                                            <Tag color="green" style={{ marginBottom: '0px', marginRight: '5px' }}>Propietario</Tag>
                                        )}
                                        {inmuebles_asociados_informador?.some(informador => informador.id === inmuebleId) && (
                                            <Tag style={{ marginBottom: '0px', marginRight: '0px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '2px solid #60a5fa', color: '#2563eb' }}>Informador</Tag>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-row gap-2">
                                    <p>Tipo de Cliente: Sin Asignar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
                :
                (
                    <div className="w-full flex flex-col justify-center items-center">
                        <div className="w-full h-[200px] bg-white border-blue-400 border-2 p-6 gap-4 rounded-lg shadow-md flex flex-col items-center justify-center">
                            <Icon icon="line-md:phone-off-loop" className='text-3xl' />
                            <p className='font-sans text-slate-900 font-base'>Inmueble no localizado</p>
                        </div>
                    </div>
                )}
        </>
    );
};

export default LocalizadoCard;
