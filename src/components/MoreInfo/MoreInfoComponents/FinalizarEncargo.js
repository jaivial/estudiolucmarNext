import React, { useEffect, useState } from 'react';
import { Button, Modal, Input } from 'rsuite';
import axios from 'axios';
import Confetti from 'react-confetti';
import CountUp from 'react-countup';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const FinalizarEncargo = ({ cliente, asesorID, asesorNombre, precio, encargos, tipoEncargo }) => {
    // Lógica para calcular la comisión del vendedor
    const calcularComisionVendedor = () => {
        let comisionVendedor = 0;
        if (encargos.length > 0 && encargos[0].tipo_comision_encargo === 'Porcentaje') {
            if (encargos[0].precio_2) {
                comisionVendedor = (encargos[0].precio_2 * encargos[0].comision_encargo) / 100;
            } else {
                comisionVendedor = (encargos[0].precio_1 * encargos[0].comision_encargo) / 100;
            }
        } else if (encargos.length > 0 && encargos[0].tipo_comision_encargo === 'Fijo') {
            comisionVendedor = encargos[0].comision_encargo;
        }
        return comisionVendedor;
    };

    // Lógica para calcular la comisión del pedido (comisiónComprador)
    const calcularComisionPedido = () => {
        let comisionPedido = 0;
        if (encargos.length > 0 && encargos[0].comisionComprador === 'Porcentaje') {
            comisionPedido = encargos[0].precio_2
                ? (encargos[0].precio_2 * encargos[0].comisionCompradorValue) / 100
                : (encargos[0].precio_1 * encargos[0].comisionCompradorValue) / 100;
        } else if (encargos.length > 0 && encargos[0].comisionComprador === 'Fijo') {
            comisionPedido = encargos[0].comisionCompradorValue;
        }
        return comisionPedido;
    };

    const comisionVendedor = calcularComisionVendedor();
    const comisionPedido = calcularComisionPedido();
    const comisionTotal = comisionVendedor + comisionPedido;

    // Estados para manejar el modal y la información del encargo
    const [openModal, setOpenModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [encargoFinalizado, setEncargoFinalizado] = useState({
        fechaFinalizacion: '',
        tipoEncargo: tipoEncargo,
        cliente: cliente,
        asesorID: parseInt(asesorID, 10),
        asesorNombre: asesorNombre,
        precio: parseInt(precio, 10),
        comisionVendedor: parseInt(comisionVendedor, 10),
        comisionPedido: parseInt(comisionPedido, 10),
        comisionTotal: parseInt(comisionTotal, 10)
    });

    const handleOpen = () => setOpenModal(true);
    const handleClose = () => setOpenModal(false);

    const handleInputChange = (value, name) => {
        setEncargoFinalizado({
            ...encargoFinalizado,
            [name]: value
        });
    };

    const handleFinalizarEncargo = async () => {
        try {
            const response = await axios.post('/api/finalizarEncargo', encargoFinalizado);
            if (response.status === 200) {
                setShowConfetti(true); // Mostrar confetti al finalizar encargo
                setOpenModal(false);   // Cerrar el modal
                setShowConfirm(false); // Cerrar el modal de confirmación
            } else {
                console.error('Error al finalizar el encargo', 5000);
            }
        } catch (error) {
            console.error('Error en la solicitud', 5000);
        }
    };

    const handleConfirm = () => {
        setShowConfirm(true); // Abrir modal de confirmación
    };

    const handleCloseConfetti = () => {
        setShowConfetti(false); // Cerrar la animación de confetti
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
    };

    // Datos para el gráfico de línea con subidas y bajadas simuladas
    const data = {
        labels: ['0%', '25%', '50%', '75%', '100%'],
        datasets: [
            {
                label: 'Progreso Comisión',
                data: [0, 100000 * 0.35, 100000 * 0.25, 100000 * 0.65, 99900],
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
            }
        ]
    };

    const options = {
        animation: {
            duration: 8000, // 8 seconds for the animation
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100000, // The maximum value on the Y axis
                ticks: {
                    stepSize: 10000, // Steps of 10,000
                    callback: function (value) {
                        return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
                    }
                }
            }
        },
        maintainAspectRatio: false, // Disable default aspect ratio to control height
    };

    return (
        <div>
            <Button appearance="primary" onClick={handleOpen}>
                Finalizar Encargo
            </Button>

            {/* Modal para revisar el encargo */}
            <Modal open={openModal} onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title>Finalizar Encargo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="flex flex-col items-center space-y-4">
                        {/* Fecha de Finalización */}
                        <div className="w-full max-w-md border-b border-gray-300 py-4">
                            <div className="text-center text-lg font-semibold">Fecha de Finalización</div>
                            <div className="mt-2 flex justify-center">
                                <Input
                                    type="date"
                                    value={encargoFinalizado.fechaFinalizacion}
                                    onChange={(value) => handleInputChange(value, 'fechaFinalizacion')}
                                />
                            </div>
                        </div>

                        {/* Tipo de Encargo */}
                        <div className="w-full max-w-md border-b border-gray-300 py-4">
                            <div className="text-center text-lg font-semibold">Tipo de Encargo</div>
                            <div className="mt-2 text-center text-gray-600">{encargoFinalizado.tipoEncargo}</div>
                        </div>

                        {/* Cliente */}
                        <div className="w-full max-w-md border-b border-gray-300 py-4">
                            <div className="text-center text-lg font-semibold">Cliente</div>
                            <div className="mt-2 text-center text-gray-600">{encargoFinalizado.cliente}</div>
                        </div>

                        {/* Asesor */}
                        <div className="w-full max-w-md border-b border-gray-300 py-4">
                            <div className="text-center text-lg font-semibold">Asesor</div>
                            <div className="mt-2 text-center text-gray-600">{encargoFinalizado.asesorNombre}</div>
                        </div>

                        {/* Precio */}
                        <div className="w-full max-w-md border-b border-gray-300 py-4">
                            <div className="text-center text-lg font-semibold">Precio</div>
                            <div className="mt-2 text-center text-gray-600">{formatCurrency(encargoFinalizado.precio)}</div>
                        </div>

                        {/* Comisión Vendedor */}
                        <div className="w-full max-w-md border-b border-gray-300 py-4">
                            <div className="text-center text-lg font-semibold">Comisión Vendedor</div>
                            <div className="mt-2 text-center text-gray-600">{formatCurrency(encargoFinalizado.comisionVendedor)}</div>
                        </div>

                        {/* Comisión Pedido */}
                        <div className="w-full max-w-md border-b border-gray-300 py-4">
                            <div className="text-center text-lg font-semibold">Comisión Pedido</div>
                            <div className="mt-2 text-center text-gray-600">{formatCurrency(encargoFinalizado.comisionPedido)}</div>
                        </div>

                        {/* Comisión Total */}
                        <div className="w-full max-w-md py-4">
                            <div className="text-center text-lg font-semibold">Comisión Total</div>
                            <div className="mt-2 text-center text-gray-600">{formatCurrency(encargoFinalizado.comisionTotal)}</div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleConfirm} appearance="primary">
                        Finalizar Encargo
                    </Button>
                    <Button onClick={handleClose} appearance="subtle">
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de confirmación */}
            <Modal open={showConfirm} onClose={() => setShowConfirm(false)} size="xs">
                <Modal.Body>¿Está seguro que quiere finalizar este encargo?</Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleFinalizarEncargo} appearance="primary">
                        Sí
                    </Button>
                    <Button onClick={() => setShowConfirm(false)} appearance="subtle">
                        No
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Animación de confetti y mensaje final */}
            {showConfetti && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-90 flex flex-col justify-center items-center z-50">
                    {/* Confetti animado */}
                    <Confetti width={window.innerWidth} height={window.innerHeight} />
                    <Confetti width={window.innerWidth} height={window.innerHeight} />

                    {/* Mensaje de éxito */}
                    <div className="text-center text-white animate-fade-in">
                        <h2 className="text-4xl font-bold mb-6">¡Enhorabuena! ¡Has completado una venta!</h2>

                        {/* Contador animado para la comisión total */}
                        <h3 className="text-2xl mb-6">
                            Comisión Total:
                            <CountUp
                                end={comisionTotal}
                                duration={8}
                                separator="."
                                decimal=","
                                decimals={2}
                                prefix="€"
                                className="text-green-400 font-semibold"
                            />
                            <span className="text-white"> / 100K</span>
                        </h3>

                        {/* Gráfico de progreso con subidas y bajadas */}
                        <div className="w-1/2 mx-auto mb-6" style={{ height: '400px' }}> {/* Taller height */}
                            <Line data={data} options={options} />
                        </div>


                        {/* Botón de cerrar */}
                        <Button appearance="primary" onClick={handleCloseConfetti}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinalizarEncargo;
