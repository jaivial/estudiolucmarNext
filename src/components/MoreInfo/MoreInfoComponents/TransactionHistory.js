import React, { useState, useEffect } from 'react';
import { Tag, Divider, Accordion, Panel, Checkbox } from 'rsuite'; // For styled tag and divider
import { AiOutlineArrowRight } from 'react-icons/ai'; // Arrow icon for transaction
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/es'; // Spanish locale for moment.js

const TransactionHistory = ({ inmuebleID, transaccionesHistory, fetchTransacciones }) => {




    // Helper function to format date
    const formatDate = (dateString) => moment(dateString).format('DD/MM/YYYY');

    return (
        <Accordion defaultActiveKey={1} bordered style={{ margin: '0px', width: '100%', borderRadius: '1rem' }}>
            <Accordion.Panel style={{ backgroundColor: 'rgb(248 250 252)', padding: '0px', width: '100%', borderRadius: '1rem' }} header={'Historial de transacciones'} eventKey={1}>
                <div className="transaction-history">
                    {transaccionesHistory.length > 0 ? (
                        transaccionesHistory.map((transaccion) => (
                            <div key={transaccion._id} className="transaction-item mb-4 flex flex-col justify-center">
                                <div className="flex flex-col space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Fecha: {formatDate(transaccion.fechaFinalizacion)}</span>
                                        <span className="font-semibold">Asesor: {transaccion.asesorNombre}</span>
                                        <Tag color={transaccion.tipoEncargo === 'Venta' ? 'red' : 'violet'}>
                                            {transaccion.tipoEncargo}
                                        </Tag>
                                    </div>
                                    <Divider />


                                    <div className="venta-transaction flex flex-col items-center justify-between gap-3 pb-4">
                                        <div className="flex items-center space-x-2">
                                            <span>Cliente: {transaccion.cliente}</span>
                                            <AiOutlineArrowRight />
                                            <span>Pedido: {transaccion.pedidoName}</span>
                                        </div>
                                        <div className="transaction-price text-slate-900">
                                            Precio: {transaccion.precio.toLocaleString()}€
                                        </div>
                                    </div>


                                    <div className="comision-details text-sm text-gray-700 flex-col flex items-center justify-center gap-3">
                                        <div className='flex flex-row items-center justify-center m-0 gap-3'>
                                            <p className='m-0'>Comisión Vendedor: {transaccion.comisionVendedor.toLocaleString()}€</p>
                                            <p className='m-0'>Comisión Pedido: {transaccion.comisionPedido.toLocaleString()}€</p>
                                        </div>
                                        <p>Comisión Total: {transaccion.comisionTotal.toLocaleString()}€</p>
                                    </div>
                                    <Divider />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No se encontraron transacciones.</p>
                    )}
                </div>
            </Accordion.Panel>
        </Accordion>
    );
};

export default TransactionHistory;
