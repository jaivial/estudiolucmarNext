import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Slider from 'react-slider';
import { AiOutlineDown, AiOutlineUp, AiOutlinePlus, AiOutlineClose } from 'react-icons/ai';
import Select from 'react-select';
import Toastify from 'toastify-js';
import moment from 'moment';
import 'moment/locale/es'; // Import Spanish locale for moment.js
import { IoCalendarNumber } from 'react-icons/io5';
import { MdRealEstateAgent } from 'react-icons/md';
import { RiAuctionLine } from 'react-icons/ri';
import { TbCalendarDollar } from 'react-icons/tb';
import { FaHandHoldingDollar } from 'react-icons/fa6';
import { TbUrgent } from 'react-icons/tb';
import { FaUserTie } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { BiSolidPurchaseTag } from 'react-icons/bi';
import { MdOutlinePriceCheck } from 'react-icons/md';
import { MdAttachMoney } from 'react-icons/md';
import { TbPigMoney } from 'react-icons/tb';
import { FaUserTag } from 'react-icons/fa';
import { FaArrowTrendDown } from "react-icons/fa6";
import esES from 'rsuite/locales/es_ES';
import { Accordion, Panel, Modal, Button, InputNumber, DatePicker, CustomProvider, SelectPicker, Tabs, Table, Whisper, Tooltip, Tag, Input } from 'rsuite'; // Import Accordion and Panel from rsuite
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Icon } from '@iconify/react';
import './encargosdetails.css';
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { GiSandsOfTime } from "react-icons/gi";
import dynamic from 'next/dynamic';
const FinalizarEncargo = dynamic(() => import('./FinalizarEncargo'), { ssr: false });



const { Column, HeaderCell, Cell } = Table;

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

const EncargosDetails = ({ fetchTransacciones, fetchClientes, setClienteOptions, clienteOptions, refreshMatchingClientesEncargos, fetchClientesAsociados, data, fetchInmuebleMoreInfo, fetchData, currentPage, searchTerm, screenWidth }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [encargos, setEncargos] = useState([]);
    const [tipoEncargo, setTipoEncargo] = useState('');
    const [selectedAsesor, setSelectedAsesor] = useState(null);
    const [asesorOptions, setAsesorOptions] = useState([]);
    const [precio, setPrecio] = useState('');
    const [tipoComision, setTipoComision] = useState('');
    const [comision, setComision] = useState('');
    const [fecha, setFecha] = useState('');
    const [draggableValue, setDraggableValue] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEncargoId, setCurrentEncargoId] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [matchingCliente, setMatchingCliente] = useState([null]);
    const [nombreCliente, setNombreCliente] = useState('');
    const [selectedClienteEncargo, setSelectedClienteEncargo] = useState(null);
    const [precio_1, setPrecio_1] = useState('');
    const [precio_2, setPrecio_2] = useState('');
    const [tipo_encargo, setTipo_encargo] = useState('');
    const [matchingClientesEncargos, setMatchingClientesEncargos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [verMásClienteEncargo, setVerMásClienteEncargo] = useState(false);
    const [infoClienteMathingEncargo, setInfoClienteMathingEncargo] = useState(null);
    const [lodingMoreInfoClienteMatchingEncargo, setLodingMoreInfoClienteMatchingEncargo] = useState(false);
    const [isBajadaModalOpen, setIsBajadaModalOpen] = useState(false); // State for the modal
    const [newPrecio, setNewPrecio] = useState(''); // State for the new price
    const [tiempoExclusiva, setTiempoExclusiva] = useState(null); // State for the new price
    const [tiempoExclusivaCounter, setTiempoExclusivaCounter] = useState(''); // State for the new price
    const [comisionComprador, setComisionComprador] = useState(''); // State for the new price
    const [comisionCompradorValue, setComisionCompradorValue] = useState(null); // State for the new price
    const [loadingTiempoExclusiva, setLoadingTiempoExclusiva] = useState(false);
    const [encargoState, setEncargoState] = useState(null);


    useEffect(() => {
        console.log('selectedAsesor', selectedAsesor);
    }, [selectedAsesor]);


    function toThousands(value) {
        return value ? `${value}`.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&.') : value;
    }

    // Function to disable past dates
    const disablePastDates = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remove time part of today for accurate comparison
        return date < today; // Disable if the date is in the past
    };


    useEffect(() => {
        let interval;

        // If a date is selected, start the interval
        if (tiempoExclusiva) {
            setLoadingTiempoExclusiva(true);
            interval = setInterval(() => {
                const now = new Date();
                const selectedDate = new Date(tiempoExclusiva);
                const diff = selectedDate - now;

                if (diff <= 0) {
                    clearInterval(interval);
                    setTiempoExclusivaCounter('¡Tiempo agotado!');
                } else {
                    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const diffHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const diffSeconds = Math.floor((diff % (1000 * 60)) / 1000);
                    const months = Math.floor(diffDays / 30);

                    setTiempoExclusivaCounter(`${months} meses, ${diffDays % 30} días, ${diffHours} horas, ${diffMinutes} minutos, ${diffSeconds} segundos`);
                }
                setLoadingTiempoExclusiva(false);
            }, 1000);
        }

        // Clean up the interval on component unmount or date change
        return () => clearInterval(interval);
    }, [tiempoExclusiva]);

    // Function to handle delete price reduction
    const handleDeleteBajadaPrecio = async (encargo_ID) => {
        try {
            const response = await axios.delete('/api/deleteBajadaPrecio', { data: { encargo_ID } });
            if (response.data.success) {
                showToast('Bajada de precio eliminada correctamente', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                fetchEncargos(); // Refresh the encargos
                setIsBajadaModalOpen(false); // Close the modal
            } else {
                alert('Error al eliminar la bajada de precio');
            }
        } catch (error) {
            console.error('Error deleting price reduction:', error);
        }
    };

    // Function to handle price reduction
    const handleBajadaPrecio = async () => {
        try {
            const encargo_ID = data.inmueble.id;
            const response = await axios.post('/api/setBajadaPrecio', { newPrecio, encargo_ID });
            if (response.data.success) {
                showToast('Precio actualizado correctamente', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                fetchEncargos(); // Refresh the encargos
                setIsBajadaModalOpen(false); // Close the modal
            } else {
                alert('Error al actualizar el precio.');
            }
        } catch (error) {
            console.error('Error updating price:', error);
        }
    };


    const fetchEncargos = async () => {
        if (data.inmueble.encargostate === false) {
            return;
        } else {
            try {
                const inmuebleId = data.inmueble.id;
                const response = await axios.get('/api/encargosFetch', {
                    params: { id: inmuebleId },
                });
                if (response.data !== null) {
                    const encargo = response.data;
                    console.log('encargo', encargo);
                    if (encargo.fullCliente) {
                        setSelectedClienteEncargo(encargo.fullCliente.value);
                    }
                    setPrecio_1(encargo.precio_1);
                    setPrecio_2(encargo.precio_2);
                    setTipo_encargo(encargo.tipo_encargo);
                    if (encargo) {
                        setEncargos([encargo]);

                    } else {
                        console.error('No encargo data available');
                        setEncargos([]);
                    }
                    setTiempoExclusiva(encargo.tiempo_exclusiva);
                    setEncargoState(data.inmueble.encargostate);
                }
            } catch (error) {
                console.error('Error fetching encargos:', error);
                setEncargos([]);
            }
        }
    };


    const fetchAsesores = async () => {
        try {
            const response = await axios.get('/api/fetchAsesores');
            const asesores = response.data.asesores;
            console.log('asesores', asesores);
            if (Array.isArray(asesores)) {
                setAsesorOptions(
                    asesores.map((user) => ({
                        value: `${parseInt(user.user_id, 10)}`,
                        label: `${user.nombre} ${user.apellido}`,
                    })),
                );
            } else {
                console.error('Invalid data format for asesores');
            }
        } catch (error) {
            console.error('Error fetching asesores:', error);
        }
    };

    const handleSelectCliente = (value) => {
        const selectedOption = clienteOptions.find(option => option.value === value);
        setSelectedCliente(selectedOption || null);
        setSelectedClienteEncargo(selectedOption);
    };
    const handleSelectAsesor = (value) => {
        const selectedOption = asesorOptions.find(option => option.value === value);
        setSelectedAsesor(selectedOption || null);
    };





    useEffect(() => {
        fetchEncargos();
        fetchAsesores();
        fetchClientes();
    }, [data]);



    const handlePopupClose = () => {
        setTipoEncargo('');
        setSelectedAsesor(null);
        setPrecio('');
        setTipoComision('');
        setComision('');
        setFecha('');
        setDraggableValue(0);
        setSelectedCliente(null);
        setIsPopupOpen(false);
        if (isEditing) {
            setSelectedClienteEncargo(encargos[0].fullCliente.value);
        }

    };

    const handleAddEncargo = async () => {
        if (!tipoEncargo) {
            showToast('Selecciona el tipo de encargo', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }

        if (!selectedAsesor) {
            showToast('Selecciona un asesor', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }
        if (!precio) {
            showToast('Introduce el precio', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }
        if (!tipoComision) {
            showToast('Selecciona el tipo de comisión', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }
        if (!comision) {
            showToast('Introduce la comisión', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }
        if (!comisionCompradorValue) {
            showToast('Introduce el valor de la comisión del pedido', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }
        if (!comisionComprador) {
            showToast('Selecciona el tipo de comisión del pedido', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }
        if (!selectedCliente) {
            showToast('Selecciona un cliente', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }

        const params = {
            encargo_id: isEditing ? encargos[0].encargo_id : data.inmueble.id,
            tipoEncargo: tipoEncargo,
            comercial: selectedAsesor,
            cliente: selectedCliente || '',
            fullCliente: selectedCliente || '',
            precio: precio.replace(/\D/g, ''),
            tipoComision: tipoComision,
            comision: comision,
            comisionCompradorValue: comisionCompradorValue,
            comisionComprador: comisionComprador,
            tiempoExclusiva: tiempoExclusiva,

            fecha: fecha || new Date(),
        }

        try {
            const endpoint = isEditing ? '/api/updateEncargo' : '/api/agregarEncargo';

            const response = await axios.post(endpoint, params);

            console.log('PARAMS', params);

            if (response.data) {
                showToast(isEditing ? 'Encargo actualizado' : 'Encargo añadido', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                handlePopupClose();
                await fetchEncargos();
                fetchInmuebleMoreInfo();
                fetchData(currentPage, searchTerm);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error adding/updating encargo:', error);
        }
    };

    const handleEditEncargo = (encargo, asesorOptions, clienteOptions) => {

        // Assuming encargo is the object with the details of the encargo you want to edit
        setTipoEncargo(encargo[0].tipo_encargo);

        setPrecio(toThousands(encargo[0].precio_1) || '');
        setTipoComision(encargo[0].tipo_comision_encargo || '');
        setComision(encargo[0].comision_encargo || '');
        setFecha(encargo[0].encargo_fecha || '');
        setIsEditing(true);
        setCurrentEncargoId(encargo.encargo_id);
        setIsPopupOpen(true);
        setComisionComprador(encargo[0].comisionComprador);
        setComisionCompradorValue(encargo[0].comisionCompradorValue);
        setTiempoExclusiva(encargo[0].tiempo_exclusiva);
        setSelectedCliente(encargos[0].fullCliente);
        setSelectedClienteEncargo(encargos[0].fullCliente);
        setSelectedAsesor(encargos[0].comercial_encargo);
    };

    const handleDeleteEncargo = async () => {

        try {
            const encargoIdToDelete = encargos[0].encargo_id;

            // Make DELETE request to API endpoint with encargo_id as a query parameter
            const response = await axios.delete('/api/deleteEncargo', {
                params: {
                    id: encargoIdToDelete,
                },
            });

            if (response.data.success) {
                showToast('Encargo eliminado correctamente', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');

                // Optional: Filter out the deleted encargo from the array
                const updatedEncargos = encargos.filter(encargo => encargo.encargo_id !== encargoIdToDelete);

                // Update state with the new list of encargos
                setEncargos(null);
                setEncargoState(false);
                handlePopupClose();
                setIsEditing(false);
                fetchInmuebleMoreInfo();
                fetchData(currentPage, searchTerm);
            } else {
                alert('Error al eliminar el encargo.');
            }
        } catch (error) {
            console.error('Error deleting encargo:', error);
        }
    };

    const formatDate = (dateString) => {
        return moment(dateString).format('DD/MM/YYYY');
    };

    // Helper function to format date to Spanish format
    const formatDateTwo = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD');
    };

    // Function to fetch matching encargos
    const fetchMatchingEncargos = useCallback(async () => {
        setLoading(true);

        try {
            const response = await axios.get('/api/matchingEncargos', {
                params: { precio_1, precio_2, tipo_encargo },
            });
            if (response.data) {
                // Handle the response data
                setMatchingClientesEncargos(response.data);
                console.log('matchingClientesEncargos hola', response.data);
                setTimeout(() => {
                    setLoading(false);
                }, 100);
            }
        } catch (error) {
            console.error('Error fetching matching encargos:', error);
        }
    },);

    useEffect(() => {
        console.log('refreshMatchingClientesEncargos', refreshMatchingClientesEncargos);
        fetchMatchingEncargos();
    }, [refreshMatchingClientesEncargos]);


    // Function to handle opening client details
    const handleOpen = async (_id) => {
        setLodingMoreInfoClienteMatchingEncargo(true);
        setVerMásClienteEncargo(true);

        try {
            const response = await axios.get('/api/fetchInfoPedido', {
                params: { _id },
            });
            // Handle the response data
            if (response.data) {
                setInfoClienteMathingEncargo(response.data);
                let cliente = response.data;
                const allInmuebleIds = [
                    ...cliente.inmuebles_asociados_propietario,
                    ...cliente.inmuebles_asociados_inquilino
                ].map(inmueble => inmueble.id);
                if (allInmuebleIds.length > 0) {
                    try {
                        const response = await axios.post('/api/fetch_cliente_inmuebles', {
                            clientInmuebleIds: allInmuebleIds
                        });

                        if (response.status === 200) {
                            setInfoClienteMathingEncargo(prevState => ({
                                ...prevState,
                                inmueblesDetalle: response.data
                            }));
                        }
                    } catch (error) {
                        console.error('Error al obtener inmuebles:', error);
                    }
                }
            }
            setTimeout(() => {
                setLodingMoreInfoClienteMatchingEncargo(false);
            }, 100);
        } catch (error) {
            console.error('Error fetching client info:', error);
        }
    };


    const handlePrecioChange = (value) => {
        // Remove non-numeric characters to get a clean number
        const numericValue = value.replace(/\D/g, '');

        if (numericValue) {
            // Convert the cleaned string back to a number
            const number = parseInt(numericValue, 10);

            // Format the number with thousands separator (.)
            const formattedValue = number.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

            setPrecio(formattedValue);
        } else {
            // If there's no numeric value, set the price to 0 or handle it as needed
            setPrecio('');
        }
    };

    // Handler for input change
    const handleInputChange = (value) => {
        const formattedValue = formatNumber(value);
        setPrecio(formattedValue);
    };


    // Function to format number with thousands separator
    const formatNumber = (value) => {
        let numericValue = value.replace(/\./g, '').replace('€', '').trim(); // Remove dots and euro sign
        if (!isNaN(numericValue) && numericValue !== '') {
            return new Intl.NumberFormat('de-DE').format(numericValue); // Format with dot as thousand separator
        }
        return numericValue; // Return raw value if it's not a number
    };

    return (
        data.inmueble.noticiastate === true && (
            <CustomProvider locale={esES}>
                <Accordion defaultActiveKey={1} bordered style={{ margin: '0px', marginTop: '0px', width: '100%', borderRadius: '1rem' }}>
                    <Accordion.Panel style={{ backgroundColor: 'rgb(248 250 252)', padding: '0px' }} header={'Encargos'} eventKey={1}>

                        {encargoState === true && encargos.length > 0 ? (
                            <>
                                <Tabs defaultActiveKey="1" appearance="pills" style={{ alignItems: 'center', width: '100%' }} onSelect={(eventKey) => {
                                    if (eventKey === '2') {
                                        fetchMatchingEncargos();
                                    }
                                }}>
                                    <Tabs.Tab eventKey="1" title="Información">
                                        <div className="p-4">
                                            <div className="py-1 px-2 relative">
                                                <div className="py-2 my-3 flex flex-col items-center gap-2">
                                                    <div className="flex items-center gap-2 flex-col w-full">
                                                        <IoCalendarNumber className="text-gray-900 text-3xl" />
                                                        <p className="text-base text-gray-950 py-1 text-center">{formatDate(encargos[0].encargo_fecha)}</p>
                                                        <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-col w-full">
                                                        <GiSandsOfTime className="text-gray-900 text-4xl" />
                                                        <p className="text-base text-gray-950 py-0 text-center">Tiempo de exclusiva: <br></br> {formatDate(encargos[0].tiempo_exclusiva)}</p>
                                                        <div className='flex flex-col gap-2 items-center bg-slate-200 rounded-md p-4 w-full'>
                                                            <p className='text-center text-gray-950 font-semibold'>Tiempo restante:</p>
                                                            <p className="text-base text-gray-950 py-1 text-center font-semibold w-[100%]">{tiempoExclusivaCounter}</p>
                                                        </div>
                                                        <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-col w-full">
                                                        <BiSolidPurchaseTag className="text-gray-900 text-3xl" />
                                                        <p className="text-base text-gray-950 py-1 text-center">{encargos[0].tipo_encargo}</p>
                                                        <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-col w-full">
                                                        <FaUserTag className="text-gray-900 text-3xl" />
                                                        <p className="text-base text-gray-950 py-1 text-center">Cliente: <br /> {encargos[0].fullCliente.label}</p>
                                                        <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-col w-full">
                                                        <MdAttachMoney className="text-gray-900 text-3xl" />
                                                        <p className="text-base text-gray-950 py-1 text-center">Precio: {encargos[0].precio_1.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €</p>

                                                        {encargos[0].precio_2 ? null : <div className="border-b border-gray-300 w-4/6 -mt-1"></div>}
                                                    </div>
                                                    {encargos[0].precio_2 && encargos[0].precio_2 > 0 && (
                                                        <div className="flex items-center gap-2 flex-col w-full mt-2">
                                                            <div className='flex flex-row items-center justify-center gap-3 mb-3'>
                                                                <FaArrowTrendDown className='text-red-600 text-3xl' />
                                                                <p className="text-base text-red-600 py-1 text-center">{Math.floor(encargos[0].precio_2 - encargos[0].precio_1).toLocaleString('es-ES', { minimumFractionDigits: 0 })} €</p>
                                                            </div>
                                                            <div className='flex flex-row items-center justify-center text-gray-900 text-3xl' onClick={() => setIsBajadaModalOpen(true)}>
                                                                <MdAttachMoney className="text-3xl cursor-pointer" />
                                                                <MdKeyboardDoubleArrowDown className="text-3xl cursor-pointer  -ml-2" />
                                                            </div>
                                                            <p className="text-base text-gray-900 py-1 text-center">Precio reducido: {encargos[0].precio_2} €</p>
                                                            <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col gap-2 w-full">

                                                        <div className="flex items-center gap-2 flex-col w-full bg-orange-100 rounded-xl p-4 ">
                                                            <TbPigMoney className="text-gray-900 text-3xl" />
                                                            <p className="text-base text-gray-950 py-1 text-center">Comisión Vendedor</p>
                                                            {encargos[0].tipo_comision_encargo === 'Porcentaje' ? (
                                                                <div className="flex flex-row items-center gap-2 justify-center">
                                                                    <p className="text-base text-gray-950 py-1 text-center">{encargos[0].comision_encargo}%</p>
                                                                    <p className='-my-2'>|</p>
                                                                    {encargos[0].precio_2 && encargos[0].precio_2 > 0 ? (
                                                                        <p className="text-base text-gray-950 py-1 text-center m-0">{toThousands(((encargos[0].precio_2 * encargos[0].comision_encargo) / 100))} €</p>
                                                                    ) : (
                                                                        <p className="text-base text-gray-950 py-1 text-center m-0">{toThousands(((encargos[0].precio_1 * encargos[0].comision_encargo) / 100))} €</p>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-base text-gray-950 py-1 text-center">{(encargos[0].comision_encargo.toLocaleString('es-ES', { minimumFractionDigits: 0 }))} €</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-col w-full bg-blue-100 rounded-xl p-4 ">
                                                            <TbPigMoney className="text-gray-900 text-3xl" />
                                                            <p className="text-base text-gray-950 py-1 text-center">Comisión Pedido</p>
                                                            {encargos[0].comisionComprador === 'Porcentaje' ? (
                                                                <div className="flex flex-row items-center gap-2 justify-center">
                                                                    <p className="text-base text-gray-950 py-1 text-center">{encargos[0].comisionCompradorValue}%</p>
                                                                    <p className='-my-2'>|</p>
                                                                    {encargos[0].precio_2 && encargos[0].precio_2 > 0 ? (
                                                                        <p className="text-base text-gray-950 py-1 text-center m-0">{toThousands(((encargos[0].precio_2 * encargos[0].comisionCompradorValue) / 100))} €</p>
                                                                    ) : (
                                                                        <p className="text-base text-gray-950 py-1 text-center m-0">{toThousands(((encargos[0].precio_1 * encargos[0].comisionCompradorValue) / 100))} €</p>
                                                                    )}
                                                                </div>
                                                            ) : (

                                                                encargos[0].comisionCompradorValue ? (
                                                                    <p className="text-base text-gray-950 py-1 text-center">{encargos[0].comisionCompradorValue.toLocaleString('es-ES')} €</p>
                                                                ) : (
                                                                    <p className="text-base text-gray-950 py-1 text-center">N/A</p>
                                                                )

                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-col w-full mt-2 bg-zinc-200 rounded-xl p-3 border-4 border-gray-400">
                                                            <TbPigMoney className="text-gray-900 text-3xl" />
                                                            <p className="text-base text-gray-950 py-1 text-center">Comisión total:</p>
                                                            <p className="text-base text-gray-950 py-1 text-center m-0">
                                                                {(() => {
                                                                    const price = encargos[0].precio_2 && encargos[0].precio_2 > 0 ? encargos[0].precio_2 : encargos[0].precio_1;

                                                                    // Calculate comisionComprador
                                                                    const comisionCompradorValue = encargos[0].comisionComprador === 'Porcentaje'
                                                                        ? (price * encargos[0].comisionCompradorValue) / 100
                                                                        : encargos[0].comisionCompradorValue;

                                                                    // Calculate comision_encargo
                                                                    const comisionEncargoValue = encargos[0].tipo_comision_encargo === 'Porcentaje'
                                                                        ? (price * encargos[0].comision_encargo) / 100
                                                                        : encargos[0].comision_encargo;

                                                                    // Calculate total commission
                                                                    const totalComision = comisionCompradorValue + comisionEncargoValue;

                                                                    return (
                                                                        <span>{toThousands(totalComision)} €</span>
                                                                    );
                                                                })()}
                                                            </p>
                                                        </div>

                                                        <div className="border-b border-gray-300 w-4/6 mt-1 mx-auto"></div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-col w-full">

                                                        <FaUserTie className="text-gray-900 text-3xl" />
                                                        <p className="text-base text-gray-950 py-1 text-center">Asesor: {encargos[0].comercial_encargo.label}</p>
                                                    </div>
                                                    <div>
                                                        <FinalizarEncargo fetchTransacciones={fetchTransacciones} fetchClientesAsociados={fetchClientesAsociados} direccionInmueble={data.inmueble.direccion} inmuebleID={encargos[0].encargo_id} fetchMatchingEncargos={fetchMatchingEncargos} matchingClientesEncargos={matchingClientesEncargos} fetchInmuebleMoreInfo={fetchInmuebleMoreInfo} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} cliente={encargos[0].fullCliente.label} clienteID={encargos[0].fullCliente.value} asesorID={encargos[0].comercial_encargo.value} asesorNombre={encargos[0].comercial_encargo.label} encargos={encargos} tipoEncargo={encargos[0].tipo_encargo} precio={encargos[0].precio_1 || encargos[0].precio_2} encargoID={encargos[0].encargo_id} />
                                                    </div>
                                                    <div className="absolute top-0 right-0 flex flex-col gap-6">
                                                        <div className='flex flex-col items-center gap-4'>
                                                            <FiEdit className="text-2xl cursor-pointer text-blue-500" onClick={() => handleEditEncargo(encargos, asesorOptions, clienteOptions)} />
                                                            <div className='flex flex-row items-center justify-center text-red-600 text-3xl' onClick={() => setIsBajadaModalOpen(true)}>
                                                                <MdAttachMoney className="text-3xl cursor-pointer" />
                                                                <MdKeyboardDoubleArrowDown className="text-3xl cursor-pointer  -ml-2" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {encargoState === true && (
                                                <Modal open={isBajadaModalOpen} onClose={() => setIsBajadaModalOpen(false)} size="xs">
                                                    <Modal.Header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', marginTop: '10px' }}>
                                                        <Modal.Title style={{ fontSize: '1.5rem', textAlign: 'center' }}>Bajada de precio</Modal.Title>
                                                    </Modal.Header>
                                                    <Modal.Body style={{ padding: '20px' }}>
                                                        <div className='flex flex-col gap-4 items-center px-10'>
                                                            <div className='flex flex-col gap-2 items-center bg-slate-200 rounded-md p-4 w-full'>
                                                                <p>{encargos[0].precio_2 ? 'Precio Original' : 'Precio Actual'}:</p>
                                                                <p className='text-lg font-semibold'>{encargos[0].precio_1.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €</p>
                                                            </div>
                                                            {encargos[0].precio_2 ? (
                                                                <div className='flex flex-col gap-3 items-center bg-slate-200 rounded-md p-4 w-full'>
                                                                    <p>Precio rebajado:</p>
                                                                    <p className='text-lg font-semibold'>{encargos[0].precio_2.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €</p>
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col gap-3 items-center bg-slate-200 rounded-md p-4 w-full">
                                                                    <p>Nuevo precio:</p>
                                                                    <div style={{ position: 'relative', width: '100%' }}>
                                                                        <Input
                                                                            min={0}
                                                                            max={precio_1} // Ensure new price cannot exceed current price
                                                                            value={new Intl.NumberFormat('es-ES').format(newPrecio)}
                                                                            onChange={(value) => {
                                                                                const numericValue = parseInt(value.replace(/\D/g, ''), 10) || 0; // Ensure numeric value
                                                                                setNewPrecio(Math.min(numericValue, precio_1)); // Ensure new price cannot exceed precio_1
                                                                            }}
                                                                            placeholder="Introduce el nuevo precio"
                                                                            className="w-full"
                                                                        />
                                                                        <span style={{ position: 'absolute', right: '10px', top: '80%', transform: 'translateY(-80%)' }}>€</span>
                                                                    </div>
                                                                </div>

                                                            )}
                                                        </div>
                                                    </Modal.Body>
                                                    <Modal.Footer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                                                        {encargos[0].precio_2 ? (
                                                            <Button onClick={() => handleDeleteBajadaPrecio(encargos[0].encargo_id)} appearance="primary" style={{ backgroundColor: 'red' }}>Eliminar rebajada de precio</Button>
                                                        ) : (
                                                            <Button onClick={handleBajadaPrecio} appearance="primary">Aceptar</Button>
                                                        )}
                                                        <Button onClick={() => setIsBajadaModalOpen(false)} appearance="subtle" style={{ margin: '0px' }}>Cancelar</Button>
                                                    </Modal.Footer>
                                                </Modal>
                                            )}


                                        </div>
                                    </Tabs.Tab>
                                    <Tabs.Tab eventKey="2" title="Pedidos">

                                        <div className='w-full'>
                                            <Table height={300} data={matchingClientesEncargos}>
                                                <Table.Column align="center" flexGrow={1} >
                                                    <Table.HeaderCell>Nombre</Table.HeaderCell>
                                                    <Table.Cell>
                                                        {(rowData) => `${rowData.nombre} ${rowData.apellido}`}
                                                    </Table.Cell>
                                                </Table.Column>
                                                {screenWidth >= 640 && (
                                                    <>
                                                        <Table.Column flexGrow={1} align='center' className='column-telefono'>
                                                            <Table.HeaderCell>Teléfono</Table.HeaderCell>
                                                            <Table.Cell dataKey="telefono" />
                                                        </Table.Column>

                                                    </>
                                                )}
                                                {screenWidth >= 768 && (
                                                    <>
                                                        <Table.Column flexGrow={1} align='center' className='column-email'>
                                                            <Table.HeaderCell>Email</Table.HeaderCell>
                                                            <Table.Cell dataKey="email" />
                                                        </Table.Column>
                                                    </>
                                                )}
                                                <Table.Column flexGrow={1} align='center'>
                                                    <Table.HeaderCell>Acciones</Table.HeaderCell>
                                                    <Table.Cell>
                                                        {rowData => (
                                                            <div className="flex flex-row gap-4">
                                                                <Whisper placement="top" trigger="hover" speaker={<Tooltip>Ver más</Tooltip>}>
                                                                    <Icon icon="mdi:eye-outline" style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => handleOpen(rowData._id)} />
                                                                </Whisper>
                                                            </div>
                                                        )}
                                                    </Table.Cell>
                                                </Table.Column>
                                            </Table>

                                        </div>
                                        <Modal open={verMásClienteEncargo} onClose={() => setVerMásClienteEncargo(false)} size="md" overflow={false} backdrop={true} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0px 2px', marginBottom: '70px' }}>
                                            <Modal.Header>
                                                <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'semibold', textAlign: 'center' }}>Detalles del Cliente</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body style={{ padding: '0px 25px' }}>
                                                {lodingMoreInfoClienteMatchingEncargo ? (
                                                    <Skeleton count={10} height={30} />
                                                ) : infoClienteMathingEncargo ? (
                                                    <div className='flex flex-col gap-2'>
                                                        <div className='flex flex-col gap-2 px-6 py-6 bg-slate-200 rounded-md shadow-lg mb-4'>
                                                            <p><strong>Nombre:</strong> {infoClienteMathingEncargo.nombre}</p>
                                                            <p><strong>Apellido:</strong> {infoClienteMathingEncargo.apellido}</p>
                                                            <p><strong>DNI:</strong> {infoClienteMathingEncargo.dni}</p>
                                                            <p><strong>Teléfono:</strong> {infoClienteMathingEncargo.telefono}</p>
                                                            <p><strong>Email:</strong> {infoClienteMathingEncargo.email}</p>
                                                            {infoClienteMathingEncargo.interes && (
                                                                <p><strong>Interés:</strong> {infoClienteMathingEncargo.interes.charAt(0).toUpperCase() + infoClienteMathingEncargo.interes.slice(1)}</p>
                                                            )}

                                                            <div className="flex flex-row gap-2 mt-[20px]">
                                                                <p><strong>Tipo de Cliente:</strong></p>
                                                                <div>
                                                                    {infoClienteMathingEncargo.inmuebles_asociados_propietario && infoClienteMathingEncargo.inmuebles_asociados_propietario.length > 0 && (
                                                                        <Tag
                                                                            key="propietario"
                                                                            color="green"
                                                                            style={{ marginBottom: '5px', marginRight: '5px' }}
                                                                        >
                                                                            Propietario
                                                                        </Tag>
                                                                    )}
                                                                    {infoClienteMathingEncargo.inmuebles_asociados_inquilino && infoClienteMathingEncargo.inmuebles_asociados_inquilino.length > 0 && (
                                                                        <Tag
                                                                            key="inquilino"
                                                                            color="red"
                                                                            style={{ marginBottom: '5px', marginRight: '5px' }}
                                                                        >
                                                                            Inquilino
                                                                        </Tag>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {infoClienteMathingEncargo.informador && (
                                                                <div className="flex flex-row gap-2 mt-[10px]">
                                                                    <p><strong>Informador:</strong></p>
                                                                    <Tag color="cyan" style={{ marginBottom: '5px', marginRight: '5px' }}>
                                                                        Informador
                                                                    </Tag>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {infoClienteMathingEncargo.pedido && (
                                                            <div className="flex flex-row gap-2 mt-[10px]">
                                                                <Tag color="orange" style={{
                                                                    borderRadius: '10px',
                                                                    padding: '8px 0px',
                                                                    color: '#fff',
                                                                    textAlign: 'center',
                                                                    marginBottom: '10px',
                                                                    width: '100px',
                                                                    marginRight: 'auto',
                                                                    marginLeft: 'auto',
                                                                    fontSize: '14px',
                                                                }}>
                                                                    Pedido
                                                                </Tag>
                                                            </div>
                                                        )}
                                                        {infoClienteMathingEncargo.pedido && (
                                                            <div style={{ display: 'grid', placeItems: 'center' }} className='flex flex-col gap-2 px-4 py-2 pb-8 bg-slate-200 rounded-md shadow-lg mb-4'>
                                                                <h4 className='text-base my-2'>Información del pedido</h4>
                                                                <p className='text-sm'><strong>Interés:</strong> {infoClienteMathingEncargo.interes.charAt(0).toUpperCase() + infoClienteMathingEncargo.interes.slice(1)}</p>
                                                                <p className='text-sm'><strong>Rango de Precios:</strong> {infoClienteMathingEncargo.rango_precios.join(' - ')} €</p>
                                                            </div>
                                                        )}
                                                        {['propietario', 'inquilino'].map(tipo => (
                                                            infoClienteMathingEncargo[`inmuebles_asociados_${tipo}`] && infoClienteMathingEncargo[`inmuebles_asociados_${tipo}`].length > 0 && (
                                                                <div key={tipo} className='mb-14 mt-8'>
                                                                    <div
                                                                        style={{
                                                                            backgroundColor: tipo === 'propietario' ? '#28a745' :
                                                                                tipo === 'inquilino' ? '#ef4444' : '#ef4444',
                                                                            borderRadius: '10px',
                                                                            padding: '8px 0px',
                                                                            color: '#fff',
                                                                            textAlign: 'center',
                                                                            marginBottom: '10px',
                                                                            width: '100px',
                                                                            marginRight: 'auto',
                                                                            marginLeft: 'auto',
                                                                        }}

                                                                    >
                                                                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                                                    </div>

                                                                    <Table data={infoClienteMathingEncargo.inmueblesDetalle.filter(inmueble =>
                                                                        infoClienteMathingEncargo[`inmuebles_asociados_${tipo}`].some(assoc => assoc.id === inmueble.id)
                                                                    )} autoHeight={true}>
                                                                        <Column width={320} align="center">
                                                                            <HeaderCell>Dirección</HeaderCell>
                                                                            <Cell dataKey="direccion" />
                                                                        </Column>
                                                                        <Column width={200} align="center">
                                                                            <HeaderCell>Zona</HeaderCell>
                                                                            <Cell dataKey="zona" />
                                                                        </Column>
                                                                        <Column width={80} align="center">
                                                                            <HeaderCell>Noticias</HeaderCell>
                                                                            <Cell>
                                                                                {rowData => rowData.noticiastate ? 'Sí' : 'No'}
                                                                            </Cell>
                                                                        </Column>
                                                                        <Column width={80} align="center">
                                                                            <HeaderCell>Encargos</HeaderCell>
                                                                            <Cell>
                                                                                {rowData => rowData.encargostate ? 'Sí' : 'No'}
                                                                            </Cell>
                                                                        </Column>
                                                                        <Column width={100} align="center">
                                                                            <HeaderCell>Superficie</HeaderCell>
                                                                            <Cell>
                                                                                {rowData => (
                                                                                    <span>{rowData.superficie} m²</span>
                                                                                )}
                                                                            </Cell>
                                                                        </Column>
                                                                    </Table>
                                                                </div>
                                                            )
                                                        ))}


                                                    </div>
                                                ) : (
                                                    <p>No hay información disponible del cliente.</p>
                                                )}
                                                <Modal.Footer style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                                    <Button onClick={() => setVerMásClienteEncargo(false)} appearance="subtle">
                                                        Cerrar
                                                    </Button>
                                                </Modal.Footer>
                                            </Modal.Body>
                                        </Modal>

                                    </Tabs.Tab>

                                </Tabs>

                            </>
                        ) : (
                            <div className="flex justify-center items-center py-3">
                                <AiOutlinePlus className="text-4xl cursor-pointer text-blue-500" onClick={() => setIsPopupOpen(true)} />
                            </div>
                        )}
                        <Modal open={isPopupOpen} onClose={handlePopupClose} size='md' overflow={false} backdrop={true} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0px 2px', marginBottom: '70px' }}>
                            <Modal.Header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', marginTop: '10px' }}>
                                <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>{isEditing ? 'Editar Encargo' : 'Añadir Encargo'}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ padding: '10px 25px', fontSize: '1rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
                                <div className="flex flex-col gap-4 w-full">
                                    <div className={`flex ${screenWidth >= 600 ? 'flex-row' : 'flex-col'} gap-4 items-center w-full justify-center`}>
                                        <div className="mb-4 w-full">
                                            <label className="block text-sm font-medium mb-2" htmlFor="tipoEncargo">
                                                Tipo de Encargo
                                            </label>
                                            <SelectPicker
                                                id="tipoEncargo"
                                                data={[
                                                    { value: 'Venta', label: 'Venta' },
                                                    { value: 'Alquiler', label: 'Alquiler' }
                                                ]}
                                                value={tipoEncargo}
                                                onChange={(value) => setTipoEncargo(value || '')}
                                                placeholder="Selecciona el tipo de encargo"
                                                className='z-[900]'
                                                style={{ width: '100%' }}  // Adjust width if needed
                                                searchable={false}
                                            />
                                        </div>
                                        <div className="mb-4 w-full">
                                            <label className="block text-sm font-medium mb-2" htmlFor="precio">
                                                Precio
                                            </label>
                                            <div className="flex items-center w-full">
                                                <div style={{ position: 'relative', width: '100%' }}>
                                                    <Input
                                                        id="precio"
                                                        min={0}
                                                        value={precio.toLocaleString('es-ES')}
                                                        onChange={(value) => handleInputChange(value)}
                                                        placeholder="Introduce el precio"
                                                        className="w-full"
                                                    />
                                                    <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>€</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`flex ${screenWidth >= 600 ? 'flex-row' : 'flex-col'} gap-4 items-center w-full justify-center`}>
                                        <div className="mb-4 w-full">
                                            <label className="block text-sm font-medium mb-2" htmlFor="asesor">
                                                Asesor
                                            </label>
                                            <SelectPicker
                                                data={asesorOptions}
                                                value={isEditing ? selectedAsesor?.value : selectedAsesor?.value}
                                                onChange={handleSelectAsesor}
                                                placeholder="Asesor"
                                                className="basic-single z-[900]"
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div className="mb-4 w-full">
                                            <label className="block text-sm font-medium mb-2" htmlFor="cliente">
                                                Cliente
                                            </label>
                                            <SelectPicker
                                                id="cliente"
                                                data={clienteOptions}
                                                value={isEditing ? selectedClienteEncargo?.value : selectedClienteEncargo?.value} // Pass the selected value
                                                onChange={handleSelectCliente} // This should handle setting the selected value
                                                placeholder="Cliente"
                                                className="basic-single z-[800]"
                                                searchable={true}
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    </div>

                                    <div className={`flex ${screenWidth >= 600 ? 'flex-row mb-4' : 'flex-col'} gap-4 items-center`}>
                                        <div className='flex flex-col gap-3 items-center bg-orange-100 rounded-md p-4 w-full'>
                                            <p>Comisión del vendedor:</p>
                                            <div className="mb-4 w-full">
                                                <label className="block text-sm font-medium mb-2" htmlFor="tipoComision">
                                                    Tipo de Comisión
                                                </label>
                                                <SelectPicker
                                                    id="tipoComision"
                                                    data={[
                                                        { value: 'Porcentaje', label: 'Porcentaje' },
                                                        { value: 'Fijo', label: 'Fijo' }
                                                    ]}
                                                    value={tipoComision}
                                                    onChange={(value) => setTipoComision(value || '')}
                                                    placeholder="Tipo de comisión"
                                                    style={{ width: '100%' }}  // Adjust width if needed
                                                    searchable={false}
                                                />
                                            </div>
                                            <div className="mb-4 w-full">
                                                <label className="block text-sm font-medium mb-2" htmlFor="comision">
                                                    Comisión
                                                </label>
                                                <InputNumber
                                                    id="comision"
                                                    min={0}
                                                    value={comision}
                                                    onChange={setComision}
                                                    placeholder="Comisión"
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className='flex flex-col gap-3 items-center bg-blue-100 rounded-md p-4 w-full'>
                                            <p>Comisión del pedido:</p>
                                            <div className="mb-4 w-full">
                                                <label className="block text-sm font-medium mb-2" htmlFor="comisionComprador">
                                                    Tipo de Comisión
                                                </label>
                                                <SelectPicker
                                                    id="comisionComprador"
                                                    data={[
                                                        { value: 'Porcentaje', label: 'Porcentaje' },
                                                        { value: 'Fijo', label: 'Fijo' }
                                                    ]}
                                                    value={comisionComprador}
                                                    onChange={(value) => setComisionComprador(value || '')}
                                                    placeholder="Tipo de comisión"
                                                    style={{ width: '100%' }}  // Adjust width if needed
                                                    searchable={false}
                                                />
                                            </div>
                                            <div className="mb-4 w-full">
                                                <label className="block text-sm font-medium mb-2" htmlFor="comision">
                                                    Comisión
                                                </label>
                                                <InputNumber
                                                    id="comision"
                                                    min={0}
                                                    value={comisionCompradorValue}
                                                    onChange={setComisionCompradorValue}
                                                    placeholder="Comisión"
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`flex ${screenWidth >= 600 ? 'flex-row' : 'flex-col'} gap-4 items-center w-full justify-center`}>
                                        <div className="mb-4 w-full">
                                            <label className="block text-sm font-medium mb-2" htmlFor="fecha">
                                                Fecha
                                            </label>
                                            <DatePicker
                                                id="fecha"
                                                format="dd/MM/yyyy"
                                                value={fecha ? new Date(fecha) : new Date()}
                                                onChange={(value) => setFecha(formatDateTwo(value))}
                                                placeholder="Fecha"
                                                oneTap
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div className="mb-4 w-full">
                                            <label className="block text-sm font-medium mb-2" htmlFor="tiempoExclusiva">
                                                Tiempo de Exclusiva
                                            </label>
                                            <DatePicker
                                                id="tiempoExclusiva"
                                                format="dd/MM/yyyy"
                                                value={tiempoExclusiva ? new Date(tiempoExclusiva) : null}
                                                onChange={(value) => {
                                                    setTiempoExclusiva(value);
                                                }}
                                                placeholder="Fecha de exclusiva"
                                                oneTap
                                                placement='topStart'
                                                style={{ width: '100%' }}
                                                disabledDate={disablePastDates} // This will disable past dates
                                            />
                                        </div>
                                    </div>
                                    {tiempoExclusiva && (
                                        <div className='flex flex-col gap-2 items-center bg-slate-200 rounded-md p-4 w-full'>
                                            <p>Tiempo restante:</p>
                                            {!loadingTiempoExclusiva ? (
                                                <>
                                                    <p className='text-center font-semibold w-[60%]'>{tiempoExclusivaCounter}</p>
                                                </>
                                            ) : (
                                                <Skeleton width={220} height={70}>
                                                </Skeleton>
                                            )}

                                        </div>
                                    )}

                                </div>
                            </Modal.Body>
                            <Modal.Footer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }}>

                                <Button onClick={handleAddEncargo} appearance="primary">
                                    {isEditing ? 'Actualizar' : 'Añadir'}
                                </Button>
                                {isEditing && (
                                    <Button onClick={handleDeleteEncargo} color="red" appearance="primary" style={{ margin: '0px' }}>
                                        Eliminar
                                    </Button>
                                )}
                                <Button onClick={handlePopupClose} appearance="subtle" style={{ margin: '0px' }}>
                                    Cerrar
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Accordion.Panel >
                </Accordion >
            </CustomProvider >
        )
    );
};

export default EncargosDetails;
