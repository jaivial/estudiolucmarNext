import React, { useState, useEffect } from 'react';
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

// CustomSlider component to handle the slider with only three discrete positions
const CustomSlider = ({ value, onChange }) => {
    return (
        <Slider
            min={0}
            max={2} // Three discrete positions: 0, 1, 2
            step={1}
            value={value}
            onChange={onChange}
            className="relative flex items-center w-full h-6"
            trackClassName="absolute bg-blue-200 h-1 rounded"
            thumbClassName="relative block w-6 h-6 bg-blue-500 rounded-full cursor-pointer"
        />
    );
};

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

const EncargosDetails = ({ data, setOnAddEncargoRefreshKey, onAddEncargoRefreshKey }) => {
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
    const [clienteOptions, setClienteOptions] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [matchingCliente, setMatchingCliente] = useState([null]);
    const [nombreCliente, setNombreCliente] = useState('');

    const fetchEncargos = async () => {
        if (data.inmueble.encargoState === 0) {
            console.log('No hay encargos para mostrar');
            return;
        } else {
            try {
                const response = await axios.get('http://localhost:8000/backend/encargos/encargosfetch.php', {
                    params: { id: data.inmueble.id },
                });
                console.log('Encargos fetched:', response.data);
                if (response.data.id) {
                    const encargo = response.data;
                    if (encargo) {
                        setEncargos([encargo]);
                    } else {
                        console.error('No encargo data available');
                        setEncargos([]);
                    }
                } else {
                    console.error('Error fetching encargos:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching encargos:', error);
                setEncargos([]);
            }
        }
    };

    const fetchAsesores = async () => {
        try {
            const response = await axios.get('http://localhost:8000/backend/users/fetchusersdatabase.php');
            if (Array.isArray(response.data)) {
                setAsesorOptions(
                    response.data.map((user) => ({
                        value: `${user.name} ${user.apellido}`,
                        label: `${user.name} ${user.apellido}`,
                    })),
                );
            } else {
                console.error('Invalid data format for asesores');
            }
        } catch (error) {
            console.error('Error fetching asesores:', error);
        }
    };

    const fetchClientes = async () => {
        try {
            const response = await axios.get('http://localhost:8000/backend/clientes/seleccionaCliente.php');
            if (Array.isArray(response.data)) {
                setClienteOptions(
                    response.data.map((cliente) => ({
                        value: cliente.id,
                        label: cliente.nombrecompleto_cliente,
                    })),
                );
            } else {
                console.error('Invalid data format for clients');
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    useEffect(() => {
        fetchEncargos();
        fetchAsesores();
        fetchClientes();
    }, [data]);

    // Function to find the matching clienteOption
    const findNombreCliente = () => {
        if (!clienteOptions || !Array.isArray(clienteOptions)) {
            console.error('Invalid inputs');
            return '';
        }

        const matchingOption = clienteOptions.find((option) => option.id === encargos.encargo_id);
        setMatchingCliente(matchingOption);
        return matchingOption ? matchingOption.label : '';
    };

    useEffect(() => {
        const nombre = findNombreCliente();
        setNombreCliente(nombre);
        console.log('nombreCliente', nombre); // This will log the updated nombreCliente
    }, [encargos, clienteOptions]);

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

        const params = {
            encargo_id: isEditing ? encargos[0].encargo_id : data.inmueble.id,
            tipoEncargo: tipoEncargo,
            comercial: selectedAsesor?.value || '',
            cliente: selectedCliente?.value || '',
            precio: precio,
            tipoComision: tipoComision,
            comision: comision,
            fecha: fecha,
        };

        try {
            console.log('Sending params:', params);

            const endpoint = isEditing ? 'http://localhost:8000/backend/encargos/updateEncargo.php' : 'http://localhost:8000/backend/encargos/agregarEncargo.php';

            const response = await axios.get(endpoint, { params });
            console.log('response updated', response.data);

            if (response.data) {
                console.log('response.data', response.data);
                showToast(isEditing ? 'Encargo actualizado' : 'Encargo añadido', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                handlePopupClose();
                await fetchEncargos();
                setOnAddEncargoRefreshKey(onAddEncargoRefreshKey + 1);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error adding/updating encargo:', error);
        }
    };

    const handleEditEncargo = (encargo, asesorOptions, clienteOptions) => {
        setTipoEncargo(encargo.tipo_encargo);
        setSelectedAsesor({
            value: asesorOptions.value,
            label: asesorOptions.label,
        });
        setPrecio(encargo.precio_1 || '');
        setTipoComision(encargo.tipo_comision_encargo || '');
        setComision(encargo.comision_encargo || '');
        setFecha(encargo.encargo_fecha || '');
        setSelectedCliente({
            value: clienteOptions.value,
            label: clienteOptions.label,
        });
        setIsEditing(true);
        setCurrentEncargoId(encargo[0].encargo_id);
        setIsPopupOpen(true);
    };

    const handleDeleteEncargo = async () => {
        if (!isEditing || !currentEncargoId) {
            console.error('Encargo ID is missing or not in editing mode.');
            return;
        }

        try {
            const response = await axios.get('http://localhost:8000/backend/encargos/deleteEncargo.php', {
                params: {
                    id: encargos[0].encargo_id,
                },
            });
            console.log('response deleted', response.data);
            if (response.data.success) {
                alert('Encargo eliminado correctamente.');
                handlePopupClose();
                setIsEditing(false);
                setOnAddEncargoRefreshKey(onAddEncargoRefreshKey + 1);
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

    useEffect(() => {
        console.log('encargos', encargos);
    }, [encargos]);

    return (
        data.inmueble.noticiastate === 1 && (
            <div className="p-4">
                <div className="bg-white border border-gray-300 rounded-md">
                    <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between p-4 cursor-pointer bg-gray-100 rounded-t-md">
                        <h2 className="font-bold text-xl">Encargos</h2>
                        {isOpen ? <AiOutlineUp className="text-2xl" /> : <AiOutlineDown className="text-2xl" />}
                    </div>
                    {isOpen && (
                        <div className="py-1 px-2 relative">
                            {encargos.length > 0 ? (
                                <div className="py-2 my-3 flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-2 flex-col w-full">
                                        <IoCalendarNumber className="text-gray-900 text-3xl" />
                                        <p className="text-base text-gray-950 py-1 text-center">{formatDate(encargos[0].encargo_fecha)}</p>
                                        <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-col w-full">
                                        <BiSolidPurchaseTag className="text-gray-900 text-3xl" />
                                        <p className="text-base text-gray-950 py-1 text-center">{encargos[0].tipo_encargo}</p>
                                        <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-col w-full">
                                        <FaUserTag className="text-gray-900 text-3xl" />
                                        <p className="text-base text-gray-950 py-1 text-center">Cliente: {nombreCliente}</p>
                                        <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-col w-full">
                                        <MdAttachMoney className="text-gray-900 text-3xl" />
                                        <p className="text-base text-gray-950 py-1 text-center">Precio: {encargos[0].precio_1} €</p>
                                        <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                    </div>
                                    {encargos[0].tipo_comision_encargo === 'Porcentaje' ? (
                                        <div className="flex items-center gap-2 flex-col w-full">
                                            <TbPigMoney className="text-gray-900 text-3xl" />
                                            <p className="text-base text-gray-950 py-1 text-center"> Comisión</p>
                                            <div className="flex flex-row items-center gap-2">
                                                <p className="text-base text-gray-950 py-1 text-center">{encargos[0].comision_encargo}%</p>
                                                <p>|</p>
                                                <p className="text-base text-gray-950 py-1 text-center">{(encargos[0].precio_1 * encargos[0].comision_encargo) / 100} €</p>
                                            </div>
                                            <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 flex-col w-full">
                                            <TbPigMoney className="text-gray-900 text-3xl" />
                                            <p className="text-base text-gray-950 py-1 text-center">{encargos[0].precio_1} €</p>
                                            <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 flex-col w-full">
                                        <FaUserTie className="text-gray-900 text-3xl" />
                                        <p className="text-base text-gray-950 py-1 text-center">Asesor: {encargos[0].comercial_encargo}</p>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <FiEdit className="text-2xl cursor-pointer text-blue-500" onClick={() => handleEditEncargo(encargos, asesorOptions, clienteOptions)} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center items-center py-3">
                                    <AiOutlinePlus className="text-4xl cursor-pointer text-blue-500" onClick={() => setIsPopupOpen(true)} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isPopupOpen && (
                    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-8 rounded shadow-lg w-full max-w-md relative">
                            <button className="absolute top-4 right-4 text-gray-500" onClick={handlePopupClose}>
                                <AiOutlineClose size={20} />
                            </button>
                            <h2 className="text-2xl font-semibold mb-4">{isEditing ? 'Editar Encargo' : 'Añadir Encargo'}</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2" htmlFor="tipoEncargo">
                                    Tipo de Encargo
                                </label>
                                <Select
                                    id="tipoEncargo"
                                    options={[
                                        { value: 'Venta', label: 'Venta' },
                                        { value: 'Alquiler', label: 'Alquiler' },
                                        { value: 'Comercial', label: 'Comercial' },
                                    ]}
                                    value={tipoEncargo ? { value: tipoEncargo, label: tipoEncargo } : null}
                                    onChange={(option) => setTipoEncargo(option?.value || '')}
                                    placeholder="Selecciona el tipo de encargo"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2" htmlFor="asesor">
                                    Asesor
                                </label>
                                <Select id="asesor" options={asesorOptions} value={selectedAsesor} onChange={setSelectedAsesor} placeholder="Selecciona un asesor" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2" htmlFor="cliente">
                                    Cliente
                                </label>
                                <Select id="cliente" options={clienteOptions} value={selectedCliente} onChange={setSelectedCliente} placeholder="Selecciona un cliente" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2" htmlFor="precio">
                                    Precio
                                </label>
                                <input id="precio" type="number" className="border rounded p-2 w-full" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Introduce el precio" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2" htmlFor="tipoComision">
                                    Tipo de Comisión
                                </label>
                                <Select
                                    id="tipoComision"
                                    options={[
                                        { value: 'Porcentaje', label: 'Porcentaje' },
                                        { value: 'Fijo', label: 'Fijo' },
                                    ]}
                                    value={tipoComision.value}
                                    onChange={(option) => setTipoComision(option?.value || '')}
                                    placeholder="Selecciona el tipo de comisión"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2" htmlFor="comision">
                                    Comisión
                                </label>
                                <input id="comision" type="number" className="border rounded p-2 w-full" value={comision} onChange={(e) => setComision(e.target.value)} placeholder="Introduce la comisión" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2" htmlFor="fecha">
                                    Fecha
                                </label>
                                <input id="fecha" type="date" className="border rounded p-2 w-full" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={handleAddEncargo} className="bg-blue-500 text-white p-2 rounded">
                                    {isEditing ? 'Actualizar' : 'Añadir'}
                                </button>
                                {isEditing && (
                                    <button onClick={handleDeleteEncargo} className="bg-red-500 text-white p-2 rounded-md">
                                        Eliminar
                                    </button>
                                )}
                                <button onClick={handlePopupClose} className="bg-gray-500 text-white p-2 rounded">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    );
};

export default EncargosDetails;
