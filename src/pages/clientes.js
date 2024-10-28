import GeneralLayout from "../components/layouts/GeneralLayout.js";
import { useState, useEffect } from "react";
import axios from 'axios';
import { Button, Form, Modal, SelectPicker, Table, Tag, Panel, PanelGroup, Whisper, Tooltip, Tabs, Radio, RadioGroup, RangeSlider, InputPicker, Toggle, InputNumber, AutoComplete } from 'rsuite';
import { Icon } from '@iconify/react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import 'rsuite/dist/rsuite.min.css';
import '../app/globals.css';
import LoadingScreen from "../components/LoadingScreen/LoadingScreen.js";
import { dniValidator } from '../lib/mongodb/dniValidator/dniValidator.js';
import { useToaster, Notification } from 'rsuite';
import cookie from 'cookie';
import '../components/Clientes/clients.css';
import MoreInfo from '../components/MoreInfo/MoreInfo.js';
import { intlFormat } from "date-fns";
import { FaPlus } from 'react-icons/fa';

export async function getServerSideProps(context) {
    // Parse the cookies on the request
    const cookies = cookie.parse(context.req.headers.cookie || '');

    // Get the value of the 'admin' cookie
    const isAdmin = cookies.admin === 'true'; // assuming 'admin' cookie has value 'true' or 'false'

    // Pass the isAdmin value as a prop to the page component
    return {
        props: {
            isAdmin,
        },
    };
}

const { Column, HeaderCell, Cell } = Table;

export default function Clientes({ isAdmin }) {
    const [screenWidth, setScreenWidth] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Function to update state to current window inner width
            const handleResize = () => setScreenWidth(window.innerWidth);

            // Set initial screen width
            setScreenWidth(window.innerWidth);

            // Set up event listener for window resize to update screenWidth state
            window.addEventListener('resize', handleResize);

            // Clean up event listener when component unmounts to prevent memory leaks
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [newCliente, setNewCliente] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        tipo_de_cliente: [],
        inmuebles_asociados_propietario: [],
        inmuebles_asociados_inquilino: [],
        telefono: '',
        inmueblesDetalle: [],
        informador: false,
        pedido: false,
        email: '',
        direccionfuerazonainquilino: '',
        direccionfuerazonapropietario: '',
        interes: 'comprar',  // Default value
        rango_precios: [0, 1000000]  // Default price range as array
    });
    const [inmuebles, setInmuebles] = useState([]);
    const [open, setOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editCliente, setEditCliente] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const toaster = useToaster();
    const [activeTab, setActiveTab] = useState('clientes');
    const [compradores, setCompradores] = useState([]);
    const [newComprador, setNewComprador] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        interes: 'comprar',  // Default value
        rango_precios: [0, 1000000]  // Default price range as array
    });
    const [editComprador, setEditComprador] = useState({});
    const [editModalCompradorOpen, setEditModalCompradorOpen] = useState(false);
    const [inmueblesComprador, setInmueblesComprador] = useState([]);  // For storing inmuebles related to comprador
    const [selectedComprador, setSelectedComprador] = useState(null);
    const [inmueblesCompradorInfo, setInmueblesCompradorInfo] = useState([]);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [viewMore, setViewMore] = useState(false);
    const [moreInfoInmuebleId, setMoreInfoInmuebleId] = useState(null);
    const [viewMoreComprador, setViewMoreComprador] = useState(false);
    const [moreInfoCompradorId, setMoreInfoCompradorId] = useState(null);
    const [showAddNewClient, setShowAddNewClient] = useState(false);
    const [searchTermClients, setSearchTermClients] = useState('');
    const [filteredClientes, setFilteredClientes] = useState(clientes);

    const handleSearch = (value) => {
        setSearchTerm(value);

        // Split the input into individual words for more flexible searching
        const searchWords = value.toLowerCase().split(' ').filter(Boolean);

        // Filter the clientes based on each word matching either nombre or apellido
        const filtered = clientes.filter((cliente) =>
            searchWords.every((word) =>
                cliente.nombre.toLowerCase().includes(word) ||
                cliente.apellido.toLowerCase().includes(word)
            )
        );

        setFilteredClientes(filtered);
    };


    const handleOpenInfoComprador = async (comprador) => {
        setSelectedComprador(comprador);
        setInfoModalOpen(true);

        try {
            const response = await axios.get(`/api/fetchInmueblesComprador?comprador_id=${comprador._id}`);
            setInmueblesCompradorInfo(response.data);
        } catch (error) {
            console.error('Error fetching inmuebles for comprador:', error);
        }
    };

    const handleCloseInfoComprador = () => {
        setInfoModalOpen(false);
        setSelectedComprador(null);
        setInmueblesCompradorInfo([]);
    };


    useEffect(() => {
        fetchClientes();
    }, []);


    const handleDeleteComprador = async (comprador_id) => {
        if (!comprador_id) {
            console.error('No se ha proporcionado un ID de comprador');
            return;
        }

        try {
            const response = await axios.delete('/api/deleteComprador', { data: { comprador_id } });

            if (response.status === 200) {
                // Actualizar la lista de compradores en la interfaz
                setCompradores((prevCompradores) =>
                    prevCompradores.filter((comprador) => comprador._id !== comprador_id)
                );
                // Set 'pedido' to false for the cliente with the given comprador_id
                setClientes((prevClientes) =>
                    prevClientes.map((cliente) =>
                        cliente._id === comprador_id ? { ...cliente, pedido: false } : cliente
                    )
                );
                setFilteredClientes((prevClientes) =>
                    prevClientes.map((cliente) =>
                        cliente._id === comprador_id ? { ...cliente, pedido: false } : cliente
                    )
                );
                showToast('Pedido eliminado con éxito', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            } else {
                console.error('Error al eliminar el comprador:', response.data.message);
            }
        } catch (error) {
            console.error('Hubo un error al intentar eliminar el comprador:', error.response ? error.response.data : error.message);
        }
    };

    const handleUpdateComprador = () => {
        console.log('editComprador', editComprador);
        axios.post('/api/updateComprador', editComprador)
            .then(response => {
                // Handle successful update
                showToast('Pedido actualizado con éxito', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');

                // Update the compradores list with the updated comprador
                setCompradores(prevCompradores => prevCompradores.map(comprador =>
                    comprador._id === editComprador._id ? { ...comprador, ...editComprador } : comprador
                ));

                handleCloseEditModalComprador();
            })
            .catch(error => {
                console.error('Error updating comprador:', error.response ? error.response.data : error.message);
                showToast('Error al actualizar el comprador', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            });
    };


    const handleInteresChange = (value) => {
        setNewCliente({
            ...newCliente,
            interes: value,
            rango_precios: value === 'comprar' ? [0, 1000000] : [0, 2500]  // Adjust range based on selection
        });
    };
    const handleInteresChangeEdit = (value) => {
        setEditCliente({
            ...editCliente,
            interes: value,
            rango_precios: value === 'comprar' ? [0, 1000000] : [0, 2500]  // Adjust range based on selection
        });
    };

    const fetchClientes = async () => {
        try {
            const response = await axios.get('/api/fetch_clientes');
            setClientes(response.data);
            setFilteredClientes(response.data);
            const compradoresConPedido = response.data.filter(cliente => cliente.pedido);
            setCompradores(compradoresConPedido);
        } catch (error) {
            console.error('Error al obtener clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = async (cliente) => {
        setSelectedCliente(cliente);
        setOpen(true);

        const allInmuebleIds = [
            ...cliente.inmuebles_asociados_propietario,
            ...cliente.inmuebles_asociados_inquilino
        ].map(inmueble => inmueble.id);

        try {
            const response = await axios.post('/api/fetch_cliente_inmuebles', {
                clientInmuebleIds: allInmuebleIds
            });

            if (response.status === 200) {
                setSelectedCliente(prevState => ({
                    ...prevState,
                    inmueblesDetalle: response.data
                }));
            }
        } catch (error) {
            console.error('Error al obtener inmuebles:', error);
        }
    };

    const handleClose = () => setOpen(false);

    const handleOpenEditModal = (cliente) => {
        setEditCliente(cliente);
        setEditModalOpen(true);
    };

    const handleOpenEditModalComprador = async (comprador) => {
        setEditComprador(comprador);
        setEditModalCompradorOpen(true);
        try {
            const response = await axios.get(`/api/fetchInmueblesComprador?comprador_id=${comprador._id}`);
            setInmueblesComprador(response.data);
        } catch (error) {
            console.error('Error fetching inmuebles for comprador:', error);
        }
    };

    const handleCloseEditModalComprador = () => {
        setEditModalCompradorOpen(false);
        setEditComprador(null);
        setInmueblesComprador([]);
    };

    const handleCloseEditModal = () => setEditModalOpen(false);

    const handleSearchInmuebles = async (value) => {
        setSearchTerm(value);
        if (value) {
            try {
                const response = await axios.get('/api/fetch_inmuebles_agregar_cliente', {
                    params: { searchTerm: value }
                });
                setInmuebles(response.data);
            } catch (error) {
                console.error('Error al obtener inmuebles:', error);
            }
        } else {
            setInmuebles([]);
        }
    };

    const handleRemoveInmueble = (tipoCliente, inmuebleId, mode) => {
        const updatedCliente = { ...editCliente };

        // Remove the item from the relevant array
        updatedCliente[`inmuebles_asociados_${tipoCliente}`] = updatedCliente[`inmuebles_asociados_${tipoCliente}`].filter(item => item.id !== inmuebleId);

        // Check if the array is now empty
        if (updatedCliente[`inmuebles_asociados_${tipoCliente}`].length === 0) {
            // If empty, remove the tipoCliente from the tipo_de_cliente array
            updatedCliente.tipo_de_cliente = updatedCliente.tipo_de_cliente.filter(tipo => tipo !== tipoCliente);
        }

        // Update the state
        setEditCliente(updatedCliente);
    };

    const handleSelectInmueble = (type, value, mode = 'new') => {
        const selectedInmueble = inmuebles.find(inmueble => inmueble.id === value);
        if (selectedInmueble) {
            const updateFunc = mode === 'edit' ? setEditCliente : setNewCliente;
            const cliente = mode === 'edit' ? editCliente : newCliente;

            updateFunc({
                ...cliente,
                [`inmuebles_asociados_${type}`]: [
                    ...cliente[`inmuebles_asociados_${type}`],
                    { id: selectedInmueble.id, direccion: selectedInmueble.direccion }
                ]
            });
        }
    };
    const handleInformador = (checked) => {
        setNewCliente({
            ...newCliente,
            informador: checked,
        });
    };
    const handleInformadorEdit = (checked) => {
        setEditCliente({
            ...editCliente,
            informador: checked,
        });
    };
    const handlePedido = (checked) => {
        setNewCliente({
            ...newCliente,
            pedido: checked,
        });
    };
    const handlePedidoEdit = (checked) => {
        setEditCliente({
            ...editCliente,
            pedido: checked,
        });
    };
    const handleSelectTipoDeCliente = (value, mode = 'new') => {
        const updateFunc = mode === 'edit' ? setEditCliente : setNewCliente;
        const cliente = mode === 'edit' ? editCliente : newCliente;

        updateFunc({
            ...cliente,
            tipo_de_cliente: cliente.tipo_de_cliente.includes(value)
                ? cliente.tipo_de_cliente.filter(tipo => tipo !== value)
                : [...cliente.tipo_de_cliente, value]
        });
    };

    const handleAddCliente = async () => {
        if (!newCliente.nombre || !newCliente.apellido) {
            showToast('Nombre y Apellido son obligatorios', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }

        if (newCliente.dni && !dniValidator(newCliente.dni)) {
            showToast('El DNI no es válido', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }

        try {
            const response = await axios.post('/api/add_cliente', newCliente);
            if (response.status === 201) {
                showToast('Cliente agregado.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                fetchClientes();
                resetForm();
            }
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            showToast('Error al agregar el cliente.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
        }
    };

    const handleDeleteCliente = async (clienteId) => {
        try {
            const response = await axios.delete('/api/delete_cliente', { data: { id: clienteId } });
            if (response.status === 200) {
                showToast('Cliente eliminado.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                setClientes(prevClientes => prevClientes.filter(cliente => cliente.client_id !== clienteId));
                setFilteredClientes(prevClientes => prevClientes.filter(cliente => cliente.client_id !== clienteId));
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            showToast('Error al eliminar el cliente.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
        }
    };

    const handleUpdateCliente = async () => {
        if (editCliente.dni && !dniValidator(editCliente.dni)) {
            showToast('El DNI no es válido', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }

        try {
            const response = await axios.post('/api/update_cliente', editCliente);
            if (response.status === 200) {
                showToast('Cliente actualizado.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                fetchClientes();
                setEditModalOpen(false);
            }
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            showToast('Error al actualizar el cliente.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
        }
    };

    const resetForm = () => {
        setNewCliente({
            nombre: '',
            apellido: '',
            dni: '',
            tipo_de_cliente: [],
            inmuebles_asociados_propietario: [],
            inmuebles_asociados_inquilino: [],
            telefono: '',
            informador: false,
            pedido: false,
            email: '',
            direccionfuerazonainquilino: '',
        });
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
        }).showToast();
    };

    const handleViewMore = (cliente) => {
        setViewMore(true);
        setMoreInfoInmuebleId(cliente.id);
    };

    const handleCloseMoreInfo = () => setViewMore(false);

    const handleViewMoreComprador = (comprador) => {
        setViewMoreComprador(true);
        setMoreInfoCompradorId(comprador);
    };
    const handleCloseMoreInfoComprador = () => setViewMoreComprador(false);

    const handleShowAddClient = async () => {
        if (showAddNewClient === true) {
            setNewCliente({
                ...newCliente,
                nombre: '',
                apellido: '',
                dni: '',
                tipo_de_cliente: [],
                inmuebles_asociados_propietario: [],
                inmuebles_asociados_inquilino: [],
                telefono: '',
                inmueblesDetalle: [],
                informador: false,
                pedido: false,
                email: '',
                direccionfuerazonainquilino: '',
                direccionfuerazonapropietario: '',
                interes: 'comprar',  // Default value
                rango_precios: [0, 1000000],  // Default price range as array
            });
        }

        setShowAddNewClient(!showAddNewClient);
    };
    return (
        <GeneralLayout title="Gestión de Clientes" description="Panel de administración de clientes">
            {loading && <LoadingScreen />}
            {viewMore && <MoreInfo id={moreInfoInmuebleId} showModal={viewMore} setViewMore={setViewMore} onClose={handleCloseMoreInfo} />}
            {viewMoreComprador && <MoreInfo id={moreInfoCompradorId} showModal={viewMoreComprador} setViewMore={setViewMoreComprador} onClose={handleCloseMoreInfoComprador} />}
            <div className="h-full w-full flex flex-col items-center justify-start pt-20 overflow-y-scroll bg-gradient-to-t from-slate-400 via-slate-300 to-slate-200 pb-16">
                <div className="w-full flex flex-col items-center">
                    <h1 className="text-3xl font-bold text-center font-sans w-80 mb-8">Gestión de Clientes</h1>
                    <div className="w-full max-w-full flex justify-center">
                        <Tabs
                            activeKey={activeTab}
                            onSelect={(key) => setActiveTab(key)}
                            appearance="pills"
                            className="w-full items-center" // Ensure full width for the tabs
                        >

                            <Tabs.Tab eventKey="clientes" title="Clientes" className="w-full">
                                <div className="w-full flex flex-col items-center">
                                    <div
                                        className="bg-blue-200 flex items-center justify-center cursor-pointer p-3 rounded-2xl border border-blue-400 hover:bg-blue-300 hover:border-blue-500 group"
                                        onClick={handleShowAddClient}
                                    >
                                        <Icon icon="bi:person-add" className="text-blue-600 text-4xl transition-colors duration-300 group-hover:text-blue-800" />
                                    </div>

                                    <div className="flex items-center w-full max-w-sm mt-4 border border-gray-300 rounded-lg relative">
                                        <AutoComplete
                                            placeholder="Buscar cliente..."
                                            value={searchTerm}
                                            onChange={handleSearch}
                                            data={clientes.map((cliente) => `${cliente.nombre} ${cliente.apellido}`)}
                                            className="w-full border-none"
                                        />
                                        <Icon icon="mdi:magnify" className="text-gray-500 text-2xl mr-2 absolute right-0" />
                                    </div>

                                    <div className={`p-4 w-full flex flex-row ${showAddNewClient ? screenWidth >= 990 ? 'gap-6' : 'gap-0' : 'gap-0'}`}>
                                        <div className={`${(showAddNewClient && screenWidth >= 990) ? 'w-3/4' : 'w-full'} ${(showAddNewClient && screenWidth < 990) ? 'w-0 opacity-0' : 'w-full'} transition-all duration-1000 ease-in-out`}>
                                            <PanelGroup bordered defaultActiveKey="1" style={{ marginBottom: '20px', borderRadius: '1.2rem' }}>
                                                <Panel header="Clientes" eventKey="1" className="bg-slate-50 rounded-lg shadow-xl">
                                                    <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
                                                        <table className="min-w-full bg-white border-collapse border border-slate-200 relative">
                                                            <thead className="bg-gray-100">
                                                                <tr>
                                                                    <th className="px-0 py-2 border w-fit">Info</th>
                                                                    <th className="px-4 py-2 border">Nombre</th>
                                                                    <th className="px-4 py-2 border min-w-fit">Tipo de Cliente</th>
                                                                    <th className="px-4 py-2 border">DNI</th>
                                                                    <th className="px-4 py-2 border">Teléfono</th>
                                                                    <th className="px-4 py-2 border">Email</th>
                                                                    <th className="px-4 py-2 border">Inmuebles Asociados</th>
                                                                    <th className="px-4 py-2 border m-0 bg-white sticky right-0 z-10 rounded-tl-2xl">Acciones</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {filteredClientes.map((cliente, index) => (
                                                                    <tr
                                                                        key={cliente.id}
                                                                        className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-slate-200'}`}
                                                                    >

                                                                        <td className="px-0 py-2 text-center flex flex-row items-start justify-start mx-auto w-[50px]">
                                                                            {cliente.informador && (
                                                                                <Icon icon="mdi:information" className="text-blue-500 text-2xl" />
                                                                            )}
                                                                            {cliente.pedido && (
                                                                                <Icon icon="mdi:parking" className="text-orange-500 text-2xl" />
                                                                            )}
                                                                        </td>
                                                                        <td className="px-4 py-2 text-center min-w-fit text-nowrap">{cliente.nombre} {cliente.apellido}</td>
                                                                        <td className="px-4 py-2 text-center w-[220px]">
                                                                            <div className="flex flex-row justify-center gap-3">
                                                                                {cliente.inmuebles_asociados_propietario?.length > 0 && (
                                                                                    <span className="text-green-700 bg-green-100 px-2 py-1 rounded">
                                                                                        Propietario
                                                                                    </span>
                                                                                )}
                                                                                {cliente.inmuebles_asociados_inquilino?.length > 0 && (
                                                                                    <span className="text-red-700 bg-red-100 px-2 py-1 rounded">
                                                                                        Inquilino
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-4 py-2 text-center">{cliente.dni}</td>
                                                                        <td className="px-4 py-2 text-center">{cliente.telefono || 'N/A'}</td>
                                                                        <td className="px-4 py-2 text-center">{cliente.email || 'N/A'}</td>
                                                                        <td className="px-4 py-2 text-center">
                                                                            {cliente.inmuebles_asociados_propietario?.length +
                                                                                cliente.inmuebles_asociados_inquilino?.length +
                                                                                (cliente.direccionfuerazonapropietario ? 1 : 0) +
                                                                                (cliente.direccionfuerazonainquilino ? 1 : 0)}
                                                                        </td>
                                                                        <td className="px-1 py-2 border m-0 bg-white sticky right-0 z-10">
                                                                            <div className="flex gap-2 justify-center">
                                                                                <button
                                                                                    className="text-slate-700 hover:text-blue-800"
                                                                                    onClick={() => handleOpen(cliente)}
                                                                                    title="Ver"
                                                                                >
                                                                                    <Icon icon="mdi:eye-outline" className="text-2xl" />
                                                                                </button>
                                                                                <button
                                                                                    className="text-slate-700 hover:text-green-800"
                                                                                    onClick={() => handleOpenEditModal(cliente)}
                                                                                    title="Editar"
                                                                                >
                                                                                    <Icon icon="mdi:pencil-outline" className="text-2xl" />
                                                                                </button>
                                                                                <button
                                                                                    className="text-slate-700 hover:text-red-800"
                                                                                    onClick={() => handleDeleteCliente(cliente.client_id)}
                                                                                    title="Eliminar"
                                                                                >
                                                                                    <Icon icon="mdi:trash-can-outline" className="text-2xl" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </Panel>

                                            </PanelGroup>
                                        </div>
                                        <div
                                            className={`${showAddNewClient
                                                ? screenWidth >= 990
                                                    ? 'w-1/4 opacity-100'
                                                    : 'w-full opacity-100'
                                                : 'w-0 opacity-0'
                                                } transition-all duration-500 ease-in-out`}
                                        >                                            <PanelGroup bordered defaultActiveKey="2" style={{ borderRadius: '1.2rem' }}>
                                                <Panel header="Agregar Nuevo Cliente" eventKey="2" className="bg-slate-50 rounded-2xl">
                                                    <Form fluid className="w-[80%] mx-auto">
                                                        <Form.Group controlId="pedido-toggle" className="w-full flex flex-col gap-4 justify-center items-center">
                                                            <p>¿Es un pedido?</p>
                                                            <Toggle
                                                                checkedChildren="Pedido"
                                                                unCheckedChildren="No Pedido"
                                                                checked={newCliente.pedido}
                                                                onChange={(checked) => handlePedido(checked)}
                                                                size={'lg'}
                                                            />
                                                        </Form.Group>
                                                        {newCliente.pedido && (
                                                            <div className="w-full flex flex-col gap-4 justify-center items-center mt-10">
                                                                <div className="w-full flex flex-row gap-32 justify-center items-center">
                                                                    <Form.Group controlId="interes">
                                                                        <Form.ControlLabel style={{ textAlign: 'center' }}>Interés</Form.ControlLabel>
                                                                        <RadioGroup
                                                                            name="interes"
                                                                            value={newCliente.interes}
                                                                            onChange={handleInteresChange}
                                                                        >
                                                                            <Radio value="comprar">Comprar</Radio>
                                                                            <Radio value="alquilar">Alquilar</Radio>
                                                                        </RadioGroup>
                                                                    </Form.Group>

                                                                    <Form.Group controlId="rango_precios">
                                                                        <Form.ControlLabel style={{ textAlign: 'center' }}>Rango de Precios</Form.ControlLabel>
                                                                        <div className="flex justify-center flex-col gap-1 mt-4">
                                                                            <Form.Group controlId="precio_minimo">
                                                                                <Form.ControlLabel>Precio Mínimo (€)</Form.ControlLabel>
                                                                                <Form.Control
                                                                                    type="number"
                                                                                    min={0}
                                                                                    value={newCliente.rango_precios[0]}
                                                                                    onChange={(value) =>
                                                                                        setNewCliente({
                                                                                            ...newCliente,
                                                                                            rango_precios: [parseInt(value, 10), newCliente.rango_precios[1]],
                                                                                        })
                                                                                    }
                                                                                />
                                                                            </Form.Group>
                                                                            <Form.Group controlId="precio_maximo">
                                                                                <Form.ControlLabel>Precio Máximo (€)</Form.ControlLabel>
                                                                                <Form.Control
                                                                                    type="number"
                                                                                    min={newCliente.rango_precios[0]}
                                                                                    max={newCliente.interes === 'comprar' ? 1000000 : 2500}
                                                                                    value={newCliente.rango_precios[1]}
                                                                                    onChange={(value) =>
                                                                                        setNewCliente({
                                                                                            ...newCliente,
                                                                                            rango_precios: [newCliente.rango_precios[0], parseInt(value, 10)],
                                                                                        })
                                                                                    }
                                                                                />
                                                                            </Form.Group>
                                                                        </div>
                                                                    </Form.Group>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <Form.Group>
                                                            <Form.ControlLabel>Nombre</Form.ControlLabel>
                                                            <Form.Control name="nombre" value={newCliente.nombre} onChange={value => {
                                                                setNewCliente({ ...newCliente, nombre: value });
                                                            }} />
                                                        </Form.Group>

                                                        <Form.Group>
                                                            <Form.ControlLabel>Apellido</Form.ControlLabel>
                                                            <Form.Control name="apellido" value={newCliente.apellido} onChange={value => {
                                                                setNewCliente({ ...newCliente, apellido: value });
                                                            }} />
                                                        </Form.Group>
                                                        <Form.Group controlId="email">
                                                            <Form.ControlLabel>Email</Form.ControlLabel>
                                                            <Form.Control name="email" value={newCliente.email} onChange={value => {
                                                                setNewCliente({ ...newCliente, email: value });
                                                            }} />
                                                        </Form.Group>
                                                        <Form.Group>
                                                            <Form.ControlLabel>Teléfono</Form.ControlLabel>
                                                            <Form.Control name="telefono" value={newCliente.telefono} onChange={value => {
                                                                setNewCliente({ ...newCliente, telefono: value });
                                                            }} />
                                                        </Form.Group>

                                                        <Form.Group>
                                                            <Form.ControlLabel>DNI</Form.ControlLabel>
                                                            <Form.Control name="dni" value={newCliente.dni} onChange={value => {
                                                                setNewCliente({ ...newCliente, dni: value });
                                                            }}
                                                            />
                                                        </Form.Group>



                                                        <Form.Group>
                                                            <Form.ControlLabel>Tipo de Cliente</Form.ControlLabel>
                                                            <SelectPicker
                                                                data={[
                                                                    { label: 'Propietario', value: 'propietario' },
                                                                    { label: 'Inquilino', value: 'inquilino' },
                                                                ]}
                                                                value={newCliente.tipo_de_cliente}
                                                                onChange={value => handleSelectTipoDeCliente(value, 'new')}
                                                                searchable={false}
                                                                multiple
                                                                block
                                                            />
                                                        </Form.Group>

                                                        {newCliente.tipo_de_cliente.includes('propietario') && (
                                                            <Form.Group className="bg-slate-200 p-4 rounded-md">
                                                                <Form.ControlLabel>Inmuebles Asociados (Propietario)</Form.ControlLabel>
                                                                <div style={{ marginBottom: '10px' }}>
                                                                    {newCliente.inmuebles_asociados_propietario.map(item => (
                                                                        <Tag
                                                                            key={item.id}
                                                                            closable
                                                                            onClose={() => handleRemoveInmueble('propietario', item.id)}
                                                                            style={{ marginRight: '5px', marginBottom: '5px' }}
                                                                        >
                                                                            {item.direccion}
                                                                        </Tag>
                                                                    ))}
                                                                </div>
                                                                <SelectPicker
                                                                    data={inmuebles.map(inmueble => ({ label: inmueble.direccion, value: inmueble.id }))}
                                                                    onSearch={handleSearchInmuebles}
                                                                    onChange={(value) => handleSelectInmueble('propietario', value, 'new')}
                                                                    searchable
                                                                    block
                                                                    menuStyle={{ maxHeight: 200, overflowY: 'auto' }}
                                                                    placement="bottomEnd"
                                                                />
                                                                <div className="mt-3 flex flex-col gap-2">
                                                                    <p>¿El inmueble está fuera de zona?</p>
                                                                    <Form.Control
                                                                        name="direccionfuerazonapropietario"
                                                                        type="text"
                                                                        placeholder="Introduce una dirección"
                                                                        value={newCliente.direccionfuerazonapropietario}
                                                                        onChange={value => setNewCliente(prevState => ({ ...newCliente, direccionfuerazonapropietario: value }))}
                                                                        className="w-full"
                                                                    />
                                                                </div>
                                                            </Form.Group>
                                                        )}

                                                        {newCliente.tipo_de_cliente.includes('inquilino') && (
                                                            <Form.Group className="bg-slate-200 p-4 rounded-md">
                                                                <Form.ControlLabel>Inmuebles Asociados (Inquilino)</Form.ControlLabel>
                                                                <div style={{ marginBottom: '10px' }}>
                                                                    {newCliente.inmuebles_asociados_inquilino.map(item => (
                                                                        <Tag
                                                                            key={item.id}
                                                                            closable
                                                                            onClose={() => handleRemoveInmueble('inquilino', item.id)}
                                                                            style={{ marginRight: '5px', marginBottom: '5px' }}
                                                                        >
                                                                            {item.direccion}
                                                                        </Tag>
                                                                    ))}
                                                                </div>
                                                                <SelectPicker
                                                                    data={inmuebles.map(inmueble => ({ label: inmueble.direccion, value: inmueble.id }))}
                                                                    onSearch={handleSearchInmuebles}
                                                                    onChange={(value) => handleSelectInmueble('inquilino', value, 'new')}
                                                                    searchable
                                                                    block
                                                                    menuStyle={{ maxHeight: 200, overflowY: 'auto' }}
                                                                    placement="bottomEnd"
                                                                />
                                                                <div className="mt-3 flex flex-col gap-2">
                                                                    <p>¿El inmueble está fuera de zona?</p>
                                                                    <Form.Control
                                                                        name="direccionfuerazonainquilino"
                                                                        type="text"
                                                                        placeholder="Introduce una dirección"
                                                                        value={newCliente.direccionfuerazonainquilino}
                                                                        onChange={value => setNewCliente(prevState => ({ ...newCliente, direccionfuerazonainquilino: value }))}
                                                                        className="w-full"
                                                                    />
                                                                </div>
                                                            </Form.Group>
                                                        )}


                                                        <Form.Group controlId="informador-toggle" className="w-full flex flex-col gap-4 justify-center items-center">
                                                            <p>¿Es un informador?</p>
                                                            <Toggle
                                                                checkedChildren="Informador"
                                                                unCheckedChildren="No Informador"
                                                                defaultChecked={newCliente.informador}
                                                                onChange={(checked) => handleInformador(checked)}
                                                                size={'lg'}
                                                            />
                                                        </Form.Group>

                                                        <div className="flex flex-col gap-4 justify-center items-center my-10">
                                                            <Button appearance="primary" onClick={handleAddCliente} style={{ marginTop: '20px' }}>
                                                                Agregar Cliente
                                                            </Button>
                                                        </div>

                                                    </Form>
                                                </Panel>
                                            </PanelGroup>
                                        </div>
                                    </div>
                                </div>
                            </Tabs.Tab>
                            <Tabs.Tab eventKey="compradores" title="Pedidos">
                                <div className="p-4 w-full">
                                    <PanelGroup accordion bordered>
                                        {/* Panel para visualizar la tabla de compradores */}
                                        <Panel header="Pedidos" eventKey="1" className="bg-slate-50 rounded-lg shadow-xl">
                                            <Table data={compradores} autoHeight>
                                                <Column width={200} align="center">
                                                    <HeaderCell>Nombre</HeaderCell>
                                                    <Cell dataKey="nombre" />
                                                </Column>

                                                <Column width={200} align="center">
                                                    <HeaderCell>Apellido</HeaderCell>
                                                    <Cell dataKey="apellido" />
                                                </Column>
                                                <Column width={200} align="center">
                                                    <HeaderCell>Teléfono</HeaderCell>
                                                    <Cell dataKey="telefono" />
                                                </Column>

                                                <Column width={200} align="center">
                                                    <HeaderCell>Email</HeaderCell>
                                                    <Cell dataKey="email" />
                                                </Column>

                                                <Column width={200} align="center">
                                                    <HeaderCell>DNI</HeaderCell>
                                                    <Cell dataKey="dni" />
                                                </Column>

                                                <Column width={200} align="center">
                                                    <HeaderCell>Interés</HeaderCell>
                                                    <Cell>
                                                        {rowData => rowData.interes === 'comprar' ? 'Comprar' : 'Alquilar'}
                                                    </Cell>
                                                </Column>

                                                <Column width={200} align="center">
                                                    <HeaderCell>Rango de Precios</HeaderCell>
                                                    <Cell>
                                                        {rowData => `${rowData.rango_precios[0].toLocaleString('es-ES')}€ - ${rowData.rango_precios[1].toLocaleString('es-ES')}€`}
                                                    </Cell>
                                                </Column>

                                                <Column width={120} align="center" fixed="right">
                                                    <HeaderCell>Acciones</HeaderCell>
                                                    <Cell>
                                                        {rowData => (
                                                            <div className="flex flex-row gap-4">
                                                                {/* Whisper for viewing the buyer's information */}
                                                                <Whisper placement="top" trigger="hover" speaker={<Tooltip>Ver</Tooltip>}>
                                                                    <Icon icon="mdi:eye-outline" style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => handleOpenInfoComprador(rowData)} />
                                                                </Whisper>

                                                                {isAdmin && (
                                                                    <>
                                                                        <Whisper placement="top" trigger="hover" speaker={<Tooltip>Editar</Tooltip>}>
                                                                            <Icon icon="mdi:pencil-outline" style={{ cursor: 'pointer', fontSize: '1.5rem', color: 'green' }} onClick={() => handleOpenEditModalComprador(rowData)} />
                                                                        </Whisper>

                                                                        <Whisper placement="top" trigger="hover" speaker={<Tooltip>Eliminar</Tooltip>}>
                                                                            <Icon icon="mdi:trash-can-outline" style={{ cursor: 'pointer', fontSize: '1.5rem', color: 'red' }} onClick={() => handleDeleteComprador(rowData._id)} />
                                                                        </Whisper>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Cell>
                                                </Column>

                                            </Table>
                                        </Panel>



                                    </PanelGroup>
                                </div>
                            </Tabs.Tab>
                        </Tabs>
                    </div>
                </div>
                {selectedCliente && open && (
                    <Modal open={open} onClose={handleClose} backdrop={true} size="lg" overflow={true}>
                        <Modal.Header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', marginTop: '10px' }}>
                            <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>Información del Cliente</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ padding: '20px', fontSize: '1rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <p><strong>Nombre:</strong> {selectedCliente.nombre}</p>
                            <p><strong>Apellido:</strong> {selectedCliente.apellido}</p>
                            <p><strong>DNI:</strong> {selectedCliente.dni}</p>
                            <p><strong>Teléfono:</strong> {selectedCliente.telefono}</p>

                            {selectedCliente.pedido && (
                                <div className="flex flex-row gap-2 mt-[10px]">
                                    <p><strong>Pedido:</strong></p>
                                    <Tag color="orange" style={{ marginBottom: '5px', marginRight: '5px' }}>
                                        Pedido
                                    </Tag>
                                </div>
                            )}

                            <div className="flex flex-row gap-2 mt-[10px]">
                                <p><strong>Tipo de Cliente:</strong></p>
                                <div>
                                    {(selectedCliente.inmuebles_asociados_propietario && selectedCliente.inmuebles_asociados_propietario.length > 0) || selectedCliente.direccionfuerazonapropietario && (
                                        <Tag
                                            key="propietario"
                                            color="green"
                                            style={{ marginBottom: '5px', marginRight: '5px' }}
                                        >
                                            Propietario
                                        </Tag>
                                    )}
                                    {(selectedCliente.inmuebles_asociados_inquilino && selectedCliente.inmuebles_asociados_inquilino.length > 0) || selectedCliente.direccionfuerazonainquilino && (
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
                            {selectedCliente.informador && (
                                <div className="flex flex-row gap-2 mt-[10px]">
                                    <p><strong>Informador:</strong></p>
                                    <Tag color="cyan" style={{ marginBottom: '5px', marginRight: '5px' }}>
                                        Informador
                                    </Tag>
                                </div>
                            )}
                            {(selectedCliente.inmuebles_asociados_propietario && selectedCliente.inmuebles_asociados_propietario.length > 0) || (selectedCliente.inmuebles_asociados_inquilino && selectedCliente.inmuebles_asociados_inquilino.length > 0) || selectedCliente.direccionfuerazonainquilino || selectedCliente.direccionfuerazonapropietario ? (
                                <div>
                                    {['propietario', 'inquilino'].map(tipo => (
                                        selectedCliente[`inmuebles_asociados_${tipo}`] && selectedCliente[`inmuebles_asociados_${tipo}`].length > 0 && (
                                            <div key={tipo} style={{ marginBottom: '20px' }}>
                                                <div
                                                    style={{
                                                        backgroundColor: tipo === 'propietario' ? '#28a745' :
                                                            tipo === 'inquilino' ? '#3490dc' : '#3490dc',
                                                        borderRadius: '10px',
                                                        padding: '10px',
                                                        color: '#fff',
                                                        textAlign: 'center',
                                                        marginBottom: '20px',
                                                        width: '200px',
                                                        marginRight: 'auto',
                                                        marginLeft: 'auto',
                                                    }}
                                                >
                                                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                                </div>



                                                <Table data={selectedCliente.inmueblesDetalle.filter(inmueble =>
                                                    selectedCliente[`inmuebles_asociados_${tipo}`].some(assoc => assoc.id === inmueble.id)
                                                )}>
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

                                                    <Column width={100} align="center">
                                                        <HeaderCell>Acciones</HeaderCell>
                                                        <Cell>
                                                            {rowData => (
                                                                <Whisper placement="top" trigger="hover" speaker={<Tooltip>Ver más</Tooltip>}>
                                                                    <Icon icon="mdi:eye-outline" style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => handleViewMore(rowData)} />
                                                                </Whisper>
                                                            )}
                                                        </Cell>
                                                    </Column>
                                                </Table>
                                            </div>
                                        )

                                    ))}
                                    {selectedCliente.direccionfuerazonainquilino || selectedCliente.direccionfuerazonapropietario ? (
                                        <div className="bg-slate-200 rounded-md p-3 flex flex-col gap-4 w-full items-center">
                                            {selectedCliente.direccionfuerazonainquilino && (
                                                <div className="flex flex-col items-center justify-center gap-2 py-2">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <p><strong>Dirección fuera de zona:</strong></p>
                                                        <Tag
                                                            key="inquilino"
                                                            color="red"
                                                            style={{ marginBottom: '5px', marginRight: '5px' }}
                                                        >
                                                            Inquilino
                                                        </Tag>
                                                    </div>
                                                    <p>{selectedCliente.direccionfuerazonainquilino}</p>
                                                </div>
                                            )}
                                            {selectedCliente.direccionfuerazonapropietario && (
                                                <div className="flex flex-col items-center justify-center gap-2 py-2">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <p><strong>Dirección fuera de zona:</strong></p>
                                                        <Tag
                                                            key="propietario"
                                                            color="green"
                                                            style={{ marginBottom: '5px', marginRight: '5px' }}
                                                        >
                                                            Propietario
                                                        </Tag>
                                                    </div>
                                                    <p>{selectedCliente.direccionfuerazonapropietario}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : null}

                                </div>
                            ) : null}
                        </Modal.Body>
                        <Modal.Footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <Button onClick={handleClose} appearance="subtle">Cerrar</Button>
                        </Modal.Footer>
                    </Modal >
                )
                }

                {
                    editCliente && editModalOpen && (
                        <Modal open={editModalOpen} onClose={handleCloseEditModal} backdrop={true} size="lg" overflow={true}>
                            <Modal.Header>
                                <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>Editar Cliente</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ padding: '35px', fontSize: '1rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Form fluid>
                                    <Form.Group>
                                        <Form.ControlLabel>Nombre</Form.ControlLabel>
                                        <Form.Control name="nombre" value={editCliente.nombre} onChange={value => {
                                            setEditCliente({ ...editCliente, nombre: value });
                                        }} />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.ControlLabel>Apellido</Form.ControlLabel>
                                        <Form.Control name="apellido" value={editCliente.apellido} onChange={value => {
                                            setEditCliente({ ...editCliente, apellido: value });
                                        }} />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.ControlLabel>DNI</Form.ControlLabel>
                                        <Form.Control name="dni" value={editCliente.dni} onChange={value => {
                                            setEditCliente({ ...editCliente, dni: value });
                                        }} />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.ControlLabel>Teléfono</Form.ControlLabel>
                                        <Form.Control name="telefono" value={editCliente.telefono} onChange={value => {
                                            setEditCliente({ ...editCliente, telefono: value });
                                        }} />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.ControlLabel>Email</Form.ControlLabel>
                                        <Form.Control name="email" value={editCliente.email} onChange={value => {
                                            setEditCliente({ ...editCliente, email: value });
                                        }} />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.ControlLabel>Tipo de Cliente</Form.ControlLabel>
                                        <SelectPicker
                                            data={[
                                                { label: 'Propietario', value: 'propietario' },
                                                { label: 'Inquilino', value: 'inquilino' },
                                            ]}
                                            value={editCliente.tipo_de_cliente}
                                            onChange={value => handleSelectTipoDeCliente(value, 'edit')}
                                            searchable={false}
                                            multiple
                                            block
                                        />
                                    </Form.Group>


                                    {editCliente.tipo_de_cliente.includes('propietario') && (
                                        <Form.Group className="bg-slate-200 p-4 rounded-md">
                                            <Form.ControlLabel>Inmuebles Asociados (Propietario)</Form.ControlLabel>
                                            <div style={{ marginBottom: '10px' }}>
                                                {editCliente.inmuebles_asociados_propietario.map(item => (
                                                    <Tag
                                                        key={item.id}
                                                        closable
                                                        onClose={() => handleRemoveInmueble('propietario', item.id, 'edit')}
                                                        style={{ marginRight: '5px', marginBottom: '5px' }}
                                                    >
                                                        {item.direccion}
                                                    </Tag>
                                                ))}
                                            </div>
                                            <SelectPicker
                                                data={inmuebles.map(inmueble => ({ label: inmueble.direccion, value: inmueble.id }))}
                                                onSearch={handleSearchInmuebles}
                                                onChange={(value) => handleSelectInmueble('propietario', value, 'edit')}
                                                searchable
                                                block
                                                menuStyle={{ maxHeight: 200, overflowY: 'auto' }}
                                                placement="topStart"
                                            />

                                            <div className="mt-3 flex flex-col gap-2">
                                                <p>¿El inmueble está fuera de zona?</p>
                                                <Form.Control
                                                    name="direccionfuerazonapropietarioedit"
                                                    type="text"
                                                    placeholder="Introduce una dirección"
                                                    value={editCliente.direccionfuerazonapropietario ? editCliente.direccionfuerazonapropietario : ''}
                                                    onChange={value => setEditCliente(prevState => ({ ...editCliente, direccionfuerazonapropietario: value }))}
                                                    className="w-full"
                                                />
                                            </div>


                                        </Form.Group>
                                    )}

                                    {editCliente.tipo_de_cliente.includes('inquilino') && (
                                        <Form.Group className="bg-slate-200 p-4 rounded-md">
                                            <Form.ControlLabel>Inmuebles Asociados (Inquilino)</Form.ControlLabel>
                                            <div style={{ marginBottom: '10px' }}>
                                                {editCliente.inmuebles_asociados_inquilino.map(item => (
                                                    <Tag
                                                        key={item.id}
                                                        closable
                                                        onClose={() => handleRemoveInmueble('inquilino', item.id, 'edit')}
                                                        style={{ marginRight: '5px', marginBottom: '5px' }}
                                                    >
                                                        {item.direccion}
                                                    </Tag>
                                                ))}
                                            </div>
                                            <SelectPicker
                                                data={inmuebles.map(inmueble => ({ label: inmueble.direccion, value: inmueble.id }))}
                                                onSearch={handleSearchInmuebles}
                                                onChange={(value) => handleSelectInmueble('inquilino', value, 'edit')}
                                                searchable
                                                block
                                                menuStyle={{ maxHeight: 200, overflowY: 'auto' }}
                                                placement="topStart"
                                            />

                                            <div className="mt-3 flex flex-col gap-2">
                                                <p>¿El inmueble está fuera de zona?</p>
                                                <Form.Control
                                                    name="direccionfuerazonainquilinoedit"
                                                    type="text"
                                                    placeholder="Introduce una dirección"
                                                    value={editCliente.direccionfuerazonainquilino ? editCliente.direccionfuerazonainquilino : ''}
                                                    onChange={value => setEditCliente(prevState => ({ ...editCliente, direccionfuerazonainquilino: value }))}
                                                    className="w-full"
                                                />
                                            </div>

                                        </Form.Group>
                                    )}
                                    <Form.Group controlId="informador-toggle" className="w-full flex flex-col gap-4 justify-center items-center">
                                        <p>¿Es un informador?</p>
                                        <Toggle
                                            checkedChildren="Informador"
                                            unCheckedChildren="No Informador"
                                            defaultChecked={editCliente.informador}
                                            onChange={(checked) => handleInformadorEdit(checked)}
                                            size={'lg'}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="pedido-toggle" className="w-full flex flex-col gap-4 justify-center items-center">
                                        <p>¿Es un pedido?</p>
                                        <Toggle
                                            checkedChildren="Pedido"
                                            unCheckedChildren="No Pedido"
                                            defaultChecked={editCliente.pedido}
                                            onChange={(checked) => handlePedidoEdit(checked)}
                                            size={'lg'}
                                        />
                                    </Form.Group>
                                    {editCliente.pedido && (
                                        <div className="w-full flex flex-col gap-4 justify-center items-center mt-10">
                                            <div className="w-full flex flex-row gap-32 justify-center items-start">
                                                <Form.Group controlId="interes">
                                                    <Form.ControlLabel style={{ textAlign: 'center' }}>Interés</Form.ControlLabel>
                                                    <RadioGroup
                                                        name="interes"
                                                        value={editCliente.interes}
                                                        onChange={handleInteresChangeEdit}
                                                    >
                                                        <Radio value="comprar">Comprar</Radio>
                                                        <Radio value="alquilar">Alquilar</Radio>
                                                    </RadioGroup>
                                                </Form.Group>

                                                <Form.Group controlId="rango_precios">
                                                    <Form.ControlLabel style={{ textAlign: 'center' }}>Rango de Precios</Form.ControlLabel>
                                                    <div className="flex justify-center gap-4 mt-4">
                                                        <Form.Group controlId="precio_minimo">
                                                            <Form.ControlLabel>Precio Mínimo (€)</Form.ControlLabel>
                                                            <Form.Control
                                                                type="number"
                                                                min={0}
                                                                value={editCliente.rango_precios[0]}
                                                                onChange={value => setEditCliente({ ...editCliente, rango_precios: [parseInt(value, 10), editCliente.rango_precios[1]] })}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group controlId="precio_maximo">
                                                            <Form.ControlLabel>Precio Máximo (€)</Form.ControlLabel>
                                                            <Form.Control
                                                                type="number"
                                                                min={editCliente.rango_precios[0]}
                                                                max={editCliente.interes === 'comprar' ? 1000000 : 2500}
                                                                value={editCliente.rango_precios[1]}
                                                                onChange={value => setEditCliente({ ...editCliente, rango_precios: [editCliente.rango_precios[0], parseInt(value, 10)] })}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Form.Group>
                                            </div>
                                        </div>
                                    )}
                                </Form>
                            </Modal.Body>

                            <Modal.Footer style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <Button onClick={handleUpdateCliente} appearance="primary">Actualizar</Button>
                                <Button onClick={handleCloseEditModal} appearance="subtle">Cancelar</Button>
                            </Modal.Footer>
                        </Modal>
                    )
                }
                {/* Modal for editing Comprador */}
                {
                    editModalCompradorOpen && (
                        <Modal open={editModalCompradorOpen} onClose={handleCloseEditModalComprador} size="lg">
                            <Modal.Header>
                                <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>Editar Pedido</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ padding: '35px', fontSize: '1rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Form fluid>
                                    <Form.Group style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '30px', marginTop: '0px', marginRight: '0px', gap: '5px' }}>
                                        <Form.ControlLabel
                                            style={{ fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center' }}
                                        >Interés</Form.ControlLabel>
                                        <RadioGroup
                                            name="interes"
                                            value={editComprador.interes}
                                            onChange={value => setEditComprador({
                                                ...editComprador,
                                                interes: value,
                                                rango_precios: value === 'comprar' ? [0, 1000000] : [0, 2500]
                                            })}
                                            style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '25px' }}
                                        >
                                            <Radio value="comprar">Comprar</Radio>
                                            <Radio value="alquilar">Alquilar</Radio>
                                        </RadioGroup>
                                    </Form.Group>
                                    <Form.Group style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '10px', marginTop: '0px', marginRight: '0px', gap: '5px' }}>
                                        <Form.ControlLabel style={{ fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center' }}>Rango de Precios</Form.ControlLabel>
                                        {/* Display selected price range */}
                                        <div style={{ marginBottom: '20px', width: '100%', textAlign: 'center', marginTop: '20px' }}>
                                            {`${(editComprador.rango_precios.min || 0).toLocaleString('es-ES')}€ - ${(editComprador.rango_precios.max || (editComprador.interes === 'comprar' ? 600000 : 2500)).toLocaleString('es-ES')}€`}
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-around', width: '90%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '25px', marginBottom: '20px' }}>
                                            <InputPicker
                                                label="Mínimo"
                                                value={editComprador.rango_precios.min || 0}
                                                onChange={value => {
                                                    const minValue = value || 0;
                                                    setEditComprador({
                                                        ...editComprador,
                                                        rango_precios: {
                                                            ...editComprador.rango_precios,
                                                            min: minValue,
                                                            max: Math.max(minValue, editComprador.rango_precios.max || (editComprador.interes === 'comprar' ? 600000 : 2500))
                                                        }
                                                    });
                                                }}
                                                data={Array.from({ length: (editComprador.interes === 'comprar' ? 601 : 51) }, (_, i) => ({
                                                    label: (i * (editComprador.interes === 'comprar' ? 1000 : 50)).toString(),
                                                    value: i * (editComprador.interes === 'comprar' ? 1000 : 50)
                                                }))}
                                            />

                                            <InputPicker
                                                label="Máximo"
                                                value={editComprador.rango_precios.max || (editComprador.interes === 'comprar' ? 600000 : 2500)}
                                                onChange={value => {
                                                    const maxValue = value || (editComprador.interes === 'comprar' ? 600000 : 2500);
                                                    setEditComprador({
                                                        ...editComprador,
                                                        rango_precios: {
                                                            ...editComprador.rango_precios,
                                                            max: maxValue,
                                                            min: Math.min(editComprador.rango_precios.min || 0, maxValue)
                                                        }
                                                    });
                                                }}
                                                data={Array.from({ length: (editComprador.interes === 'comprar' ? 601 : 51) }, (_, i) => ({
                                                    label: (i * (editComprador.interes === 'comprar' ? 1000 : 50)).toString(),
                                                    value: i * (editComprador.interes === 'comprar' ? 1000 : 50)
                                                }))}
                                            />
                                        </div>
                                    </Form.Group>

                                </Form>
                                <Modal.Footer style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '-10px' }}>
                                    <Button onClick={handleUpdateComprador} appearance="primary">Actualizar</Button>
                                    <Button onClick={handleCloseEditModalComprador} appearance="subtle">Cerrar</Button>
                                </Modal.Footer>
                            </Modal.Body>
                        </Modal>
                    )
                }

                {
                    infoModalOpen && (
                        <Modal open={infoModalOpen} onClose={handleCloseInfoComprador} size="lg">
                            <Modal.Header>
                                <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>Información del Pedido</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ padding: '35px', fontSize: '1rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {selectedComprador && (
                                    <div>
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="flex flex-col items-start justify-center gap-4 ml-2">
                                                <p><strong>Nombre:</strong> {selectedComprador.nombre}</p>
                                                <p><strong>Apellido:</strong> {selectedComprador.apellido}</p>
                                                <p><strong>Email:</strong> {selectedComprador.email}</p>
                                                <p><strong>DNI:</strong> {selectedComprador.dni}</p>
                                                <p><strong>Teléfono:</strong> {selectedComprador.telefono}</p>
                                                <p><strong>Interés:</strong> {selectedComprador.interes === 'comprar' ? 'Comprar' : 'Alquilar'}</p>
                                                <p><strong>Rango de Precios:</strong> {`${selectedComprador.rango_precios[0].toLocaleString()}€ - ${selectedComprador.rango_precios[1].toLocaleString()}€`}</p>
                                            </div>
                                        </div>
                                        <Table data={inmueblesCompradorInfo} autoHeight style={{ marginTop: '20px', width: '100%' }}>
                                            <Column width={320} align="center">
                                                <HeaderCell>Dirección</HeaderCell>
                                                <Cell dataKey="direccion" />
                                            </Column>
                                            <Column width={150} align="center">
                                                <HeaderCell>Superficie</HeaderCell>
                                                <Cell>
                                                    {rowData => (
                                                        <span>{rowData.superficie} m²</span>
                                                    )}
                                                </Cell>
                                            </Column>

                                            <Column width={150} align="center">
                                                <HeaderCell>Precio 1</HeaderCell>
                                                <Cell dataKey="precio">
                                                    {rowData => (rowData.precio !== undefined ? `${rowData.precio} €` : '')}
                                                </Cell>
                                            </Column>
                                            <Column width={150} align="center">
                                                <HeaderCell>Precio 2</HeaderCell>
                                                <Cell dataKey="precio2">
                                                    {rowData => (rowData.precio2 !== undefined ? `${rowData.precio2} €` : '')}
                                                </Cell>
                                            </Column>

                                            <Column width={100} align="center">
                                                <HeaderCell>Acciones</HeaderCell>
                                                <Cell>
                                                    {rowData => (
                                                        <Whisper placement="top" trigger="hover" speaker={<Tooltip>Ver más</Tooltip>}>
                                                            <Icon icon="mdi:eye-outline" style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => handleViewMoreComprador(rowData.id)} />
                                                        </Whisper>
                                                    )}
                                                </Cell>
                                            </Column>
                                        </Table>
                                    </div>
                                )}
                            </Modal.Body>
                            <Modal.Footer style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <Button onClick={handleCloseInfoComprador} appearance="subtle">Cerrar</Button>
                            </Modal.Footer>
                        </Modal>
                    )
                }

            </div >

        </GeneralLayout >
    );
}
