import React, { useState, useEffect } from 'react';
import { Accordion, Tag } from 'rsuite';
import axios from 'axios';

const ClientesAsociados = ({ inmuebleId }) => {
    const [clientesAsociados, setClientesAsociados] = useState([]);
    const [clientesAsociadosInmueble, setClientesAsociadosInmueble] = useState([]);

    useEffect(() => {


        const fetchClientesAsociados = async () => {
            try {
                const response = await axios.get('/api/fetchClientesAsociados', {
                    params: {
                        inmuebleId: inmuebleId,
                    },
                });
                console.log('response', response.data);
                setClientesAsociados(response.data.clientesTotales);
                setClientesAsociadosInmueble(response.data.clientesTarget);
            } catch (error) {
                console.error('Error fetching clientes asociados del inmueble:', error);
            }
        };

        fetchClientesAsociados();
    }, [inmuebleId]);

    return (
        <Accordion defaultActiveKey={['0']} className='w-auto ml-[16px] mr-[16px] mt-[20px] border-1 border-gray-300 bg-gray-100 rounded-lg shadow-lg'>
            <Accordion.Panel header="Clientes Asociados" eventKey="0">
                {clientesAsociadosInmueble.length > 0 ? (
                    <ul>
                        {clientesAsociadosInmueble.map((cliente) => (
                            <li key={cliente._id} className="flex flex-row justify-between items-center gap-2">
                                <div className="flex flex-row justify-start items-center gap-2">
                                    <p className="text-lg font-semibold">{cliente.nombre} {cliente.apellido}</p>
                                    <div>
                                        {cliente.tipo_de_cliente.map(tipo => (
                                            <Tag
                                                key={tipo}
                                                color={
                                                    tipo === 'propietario' ? 'green' :
                                                        tipo === 'copropietario' ? 'blue' :
                                                            tipo === 'inquilino' ? 'orange' :
                                                                'cyan'
                                                }
                                                style={{ marginBottom: '5px', marginRight: '5px' }}
                                            >
                                                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                            </Tag>
                                        ))}
                                    </div>
                                </div>
                                <a href={`tel:${cliente.telefono}`} className="text-lg font-semibold text-blue-500 underline">{cliente.telefono}</a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay clientes asociados a este inmueble.</p>
                )}
            </Accordion.Panel>
        </Accordion>
    );
};

export default ClientesAsociados;
