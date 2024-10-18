import React, { useEffect, useState } from 'react';
import Lottie from 'react-lottie';
import animationData from '/public/assets/gif/gifjson.json';
import { Button, Modal, Input } from 'rsuite';
import axios from 'axios';
import Confetti from 'react-confetti';
import CountUp from 'react-countup';
import { Checkbox, AutoComplete } from 'rsuite';


const FinalizarEncargo = ({ fetchTransacciones, fetchClientesAsociados, clienteID, direccionInmueble, inmuebleID, fetchMatchingEncargos, matchingClientesEncargos, cliente, asesorID, asesorNombre, precio, encargos, tipoEncargo, encargoID, fetchData, currentPage, searchTerm, fetchInmuebleMoreInfo }) => {

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
    const [selectedClientID, setSelectedClientID] = useState(null); // Store selected client ID
    const [selectedClientName, setSelectedClienName] = useState(null); // Store selected client ID
    const [filteredClientes, setFilteredClientes] = useState(matchingClientesEncargos); // Filtered clients for autocomplete

    const [encargoFinalizado, setEncargoFinalizado] = useState({
        fechaFinalizacion: '',
        tipoEncargo: tipoEncargo,
        cliente: cliente,
        clienteID: clienteID,
        asesorID: parseInt(asesorID, 10),
        asesorNombre: asesorNombre,
        precio: parseInt(precio, 10),
        comisionVendedor: parseInt(comisionVendedor, 10),
        comisionPedido: parseInt(comisionPedido, 10),
        comisionTotal: parseInt(comisionTotal, 10),
        encargoID: parseInt(encargoID, 10),
        pedidoID: selectedClientID,
        pedidoName: selectedClientName,
        inmuebleID: inmuebleID,
        direccionInmueble: direccionInmueble,
    });
    const [ventasTotales, setVentasTotales] = useState(null);
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };


    useEffect(() => {
        fetchMatchingEncargos();
    }, [])
    // Reset the filtered clients when the modal is opened or matchingClientesEncargos changes
    useEffect(() => {
        if (openModal) {
            setFilteredClientes(matchingClientesEncargos); // Set filteredClientes to the full list when the modal opens
        }
    }, [openModal, matchingClientesEncargos]);

    // Handle selection or deselection of a row (checkbox click)
    const handleSelectRow = (id) => {
        if (selectedClientID === id._id) {
            // If already selected, unselect it (toggle off)
            setSelectedClientID(null);
            handleInputChange(null, 'pedidoID'); // Clear pedidoID
        } else {
            // Select the row and store pedidoID
            setSelectedClientID(id._id);
            setSelectedClienName(id.nombre + ' ' + id.apellido);
            handleInputChange(id._id, 'pedidoID');
        }
    };

    // Handle search in the AutoComplete input
    const handleSearch = (value) => {
        if (value) {
            setFilteredClientes(
                matchingClientesEncargos.filter(
                    (cliente) =>
                        cliente.nombre.toLowerCase().includes(value.toLowerCase()) ||  // Filter by nombre
                        cliente.apellido.toLowerCase().includes(value.toLowerCase()) ||  // Filter by apellido
                        `${cliente.nombre.toLowerCase()} ${cliente.apellido.toLowerCase()}`.includes(value.toLowerCase())  // Filter by combined nombre + apellido
                )
            );
        } else {
            setFilteredClientes(matchingClientesEncargos); // Reset if input is empty
        }
    };




    const handleOpen = () => setOpenModal(true);
    const handleClose = () => setOpenModal(false);

    const handleInputChange = (value, name) => {
        setEncargoFinalizado({
            ...encargoFinalizado,
            [name]: value
        });
    };

    useEffect(() => {
        setEncargoFinalizado(prev => ({
            ...prev,
            pedidoName: selectedClientName
        }));
    }, [selectedClientName]);


    // Function to fetch ventasTotales using axios
    const fetchVentasTotales = async (userID) => {
        try {
            const response = await axios.get(`/api/fetchTotalVentasUser`, {
                params: { userID }
            });

            if (response.data.status === 'success') {
                setVentasTotales(response.data.ventasTotales); // Update state with ventasTotales
            } else {
                throw new Error(response.data.message || 'Error fetching ventasTotales');
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    // useEffect to fetch the data on component mount
    useEffect(() => {
        if (asesorID) {
            let parameterID = parseInt(asesorID)
            fetchVentasTotales(parameterID); // Pass asesorID as userID
        }
    }, [asesorID]);

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
        handleClose();
        setShowConfirm(true); // Abrir modal de confirmación
    };

    const handleCloseConfetti = () => {
        setShowConfetti(false); // Cerrar la animación de confetti
        fetchData(currentPage, searchTerm);
        fetchClientesAsociados();
        fetchInmuebleMoreInfo();
        fetchTransacciones(inmuebleID);
    };

    const formatCurrency = (value) => {
        return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 });
    };

    useEffect(() => {
        console.log('selectedClientName', selectedClientName);

    }, [selectedClientName]);
    return (
        <div>
            <Button appearance="primary" onClick={handleOpen} style={{ marginTop: '20px' }}>
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

                        {/* Pedidos Relacionados */}
                        <div className="w-full max-w-md py-4">
                            <h3 className="text-center text-lg font-semibold mb-2">Pedidos relacionados con el encargo</h3>
                            <AutoComplete
                                data={matchingClientesEncargos.map((cliente) => `${cliente.nombre} ${cliente.apellido}`)}
                                placeholder="Buscar cliente..."
                                onChange={handleSearch}
                                className="mb-4"
                            />

                            {/* Table for displaying clientes */}
                            <div className="max-h-48 overflow-y-scroll">
                                <table className="w-full text-left table-auto border-collapse">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th className="px-4 py-2">Nombre</th>
                                            <th className="px-4 py-2">Teléfono</th>
                                            <th className="px-4 py-2">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredClientes.map((cliente) => (
                                            <tr
                                                key={cliente._id}
                                                onClick={() => handleSelectRow(cliente)}
                                                className={`cursor-pointer hover:bg-gray-100 ${selectedClientID === cliente._id ? 'bg-gray-200' : ''}`}
                                            >
                                                <td className="px-4 py-2">
                                                    <Checkbox
                                                        checked={selectedClientID === cliente._id}
                                                        onChange={() => handleSelectRow(cliente)}
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    {cliente.nombre} {cliente.apellido}
                                                </td>
                                                <td className="px-4 py-2">{cliente.telefono}</td>
                                                <td className="px-4 py-2">{cliente.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                <Modal.Body style={{ fontSize: '1rem', textAlign: 'center', paddingBottom: '40px' }}>¿Está seguro que quiere finalizar este encargo?</Modal.Body>
                <Modal.Footer style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
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
                        <h2 className="text-4xl font-bold mb-6">¡Enhorabuena! <br /> <br /> {asesorNombre} <br /> <br />¡Has completado una venta!</h2>

                        {/* Nueva h3 para comisionTotal */}
                        <h3 className="text-3xl font-bold text-blue-500 mb-2 animate-bounce">
                            + {comisionTotal}€
                        </h3>

                        {/* Contador animado para la comisión total */}
                        <h3 className="text-2xl mb-0">
                            Comisión Total: <br />
                            <CountUp
                                end={ventasTotales + comisionTotal}
                                duration={8}
                                separator="."
                                decimal=","
                                decimals={0}
                                className="text-green-400 font-semibold"
                            />
                            <span className="text-green-400 font-semibold"> €</span>  {/* Euro as suffix */}
                            <span className="text-white"> / 100K</span>
                        </h3>


                        <div className='-mt-6'>
                            <Lottie options={defaultOptions} height={500} width={500} />
                        </div>

                        {/* Botón de cerrar */}
                        <Button appearance="primary" onClick={handleCloseConfetti}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            )}

        </div >
    );
};

export default FinalizarEncargo;
