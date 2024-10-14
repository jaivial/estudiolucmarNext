import React, { useState, useEffect, use } from 'react';
import { Accordion, Tag, Button, SelectPicker, Modal, IconButton, Radio, RadioGroup, Toggle, Form, Grid, TagPicker, InputNumber, Table, Whisper, Tooltip, AutoComplete, InputGroup, Panel } from 'rsuite';
import axios from 'axios';
import { Close } from '@rsuite/icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import { dniValidator } from '../../../lib/mongodb/dniValidator/dniValidator.js';
import { FaEye, FaTrash } from 'react-icons/fa'; // Import eye and trash icons
import { AiOutlineEdit, AiOutlineClose } from 'react-icons/ai';
import { Icon } from '@iconify/react';
import './clientesasociados.css';
const { Column, HeaderCell, Cell } = Table;
import SearchIcon from '@rsuite/icons/Search';

const ClientesAsociados = ({ inmuebleId, inmuebleDireccion, screenWidth, setFetchClientPhoneNumberRefreshKey, fetchClientesPhoneNumberRefreshKey, localizadoRefreshKey, setLocalizadoRefreshKey }) => {
    const [clientesAsociados, setClientesAsociados] = useState([]);
    const [clientesAsociadosInmueble, setClientesAsociadosInmueble] = useState([]);
    const [open, setOpen] = useState(false);
    const [allClientes, setAllClientes] = useState([]);
    const [pedido, setPedido] = useState(false);
    const [clientsToAssociate, setClientsToAssociate] = useState([]);
    const [clientsToAssociateInformador, setClientsToAssociateInformador] = useState();
    const [clientsToAssociateInteres, setClientsToAssociateInteres] = useState();
    const [clientsToAssociateRangoPrecios, setClientsToAssociateRangoPrecios] = useState([]);
    const [inquilino, setInquilino] = useState(false);
    const [propietario, setPropietario] = useState(false);
    const [anyadeCliente, setAnyadeCliente] = useState(false);
    const [editClienteAsociado, setEditClienteAsociado] = useState(null);
    const [editClienteAsociadoModalOpen, setEditClienteAsociadoModalOpen] = useState(false);
    const [viewMoreClienteAsociado, setViewMoreClienteAsociado] = useState(false);
    const [viewMoreClienteAsociadoModalOpen, setViewMoreClienteAsociadoModalOpen] = useState(false);

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
        interes: '',  // Default value
        rango_precios: [0, 1000000]  // Default price range as array
    });
    const [editCliente, setEditCliente] = useState({
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
        interes: '',  // Default value
        rango_precios: [0, 1000000]
    });



    const handleSearch = (value) => {
        const searchValue = value.toLowerCase();
        const filtered = clientesAsociadosInmueble.filter((cliente) =>
            `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(searchValue)
        );
        setFilteredClientes(filtered);
    };

    const [filteredClientes, setFilteredClientes] = useState(clientesAsociadosInmueble);

    useEffect(() => {
        console.log('editCliente', editCliente);
    }, [editCliente]);
    const [newComprador, setNewComprador] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        interes: 'comprar',  // Default value
        rango_precios: [0, 1000000]  // Default price range as array
    });

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
    const handlePedido = (checked) => {
        setNewCliente({
            ...newCliente,
            pedido: checked,
        });
    };

    const handleInformador = (checked) => {
        setNewCliente({
            ...newCliente,
            informador: checked,
        });
    };

    const handleInteresChange = (value) => {
        setNewComprador({
            ...newCliente,
            interes: value,
            rango_precios: value === 'comprar' ? [0, 1000000] : [0, 2500]  // Adjust range based on selection
        });
        setNewCliente({
            ...newCliente,
            interes: value,
            rango_precios: value === 'comprar' ? [0, 1000000] : [0, 2500]  // Adjust range based on selection
        });
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
            inmueblesDetalle: [],
            informador: false,
            pedido: false,
            email: '',
            interes: '',
            rango_precios: [0, 1000000]
        });
        setNewComprador({
            nombre: '',
            apellido: '',
            dni: '',
            email: '',
            telefono: '',
            interes: '',
            rango_precios: [0, 1000000]
        });
        setAnyadeCliente(false);
        setOpen(false);
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

        if (newCliente.telefono && newCliente.telefono.length !== 9) {
            showToast('El teléfono debe tener 9 caracteres', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        if (newCliente.email && !/^\S+@\S+\.\S+$/.test(newCliente.email)) {
            showToast('El email no es válido', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }


        try {
            const response = await axios.post('/api/add_cliente', newCliente);
            if (response.status === 201) {
                showToast('Cliente agregado.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                fetchClientes();
                setFetchClientPhoneNumberRefreshKey(setFetchClientPhoneNumberRefreshKey + 1);
                fetchClientesAsociados();
                resetForm();
            }
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            showToast('Error al agregar el cliente.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
        }

    };

    const fetchClientesAsociados = async () => {
        try {
            const response = await axios.get('/api/fetchClientesAsociados', {
                params: {
                    inmuebleId: inmuebleId,
                },
            });

            console.log('response.data.clientesTotales', response.data.clientesTotales);
            console.log('response.data.clientesTarget', response.data.clientesTarget);
            setClientesAsociados(response.data.clientesTotales);
            setClientesAsociadosInmueble(response.data.clientesTarget);
            setFilteredClientes(response.data.clientesTarget);
        } catch (error) {
            console.error('Error fetching clientes asociados del inmueble:', error);
        }
    };
    useEffect(() => {

        fetchClientesAsociados();
    }, [inmuebleId]);


    const fetchClientes = async () => {
        try {
            const response = await axios.get('/api/fetch_clientes');
            console.log('fetch clientes', response.data);
            setAllClientes(response.data);
        } catch (error) {
            console.error('Error fetching clientes:', error);
        }
    };

    const handleOpenAsociar = () => {
        setOpen(true);
        fetchClientes();
    };

    const handleClose = () => {
        setOpen(false);
        setClientsToAssociate([]);
        setClientsToAssociateInformador(false);
        setClientsToAssociateInteres('comprar');
        setClientsToAssociateRangoPrecios([0, 1000000]);
        setInquilino(false);
        setPropietario(false);
        setPedido(false);
    };

    const handleAsociarCliente = async () => {
        console.log(inmuebleId, inmuebleDireccion, pedido, clientsToAssociate._id, clientsToAssociateInformador, clientsToAssociateInteres, clientsToAssociateRangoPrecios, propietario, inquilino);
        try {
            const response = await axios.post('/api/asociar_cliente', {
                inmuebleId: inmuebleId,
                inmuebleDireccion: inmuebleDireccion,
                pedido: pedido,
                clientsToAssociate: clientsToAssociate._id,
                clientsToAssociateInformador: clientsToAssociateInformador,
                clientsToAssociateInteres: clientsToAssociateInteres,
                clientsToAssociateRangoPrecios: clientsToAssociateRangoPrecios,
                propietario: propietario,
                inquilino: inquilino,
            });
            console.log('response', response.data);
            if (response.data.status === 'success') {
                fetchClientesAsociados();
                showToast('Clientes asociados correctamente.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                setFetchClientPhoneNumberRefreshKey(setFetchClientPhoneNumberRefreshKey + 1);
                setLocalizadoRefreshKey(localizadoRefreshKey + 1);
                setOpen(false);
                handleClose();
            } else {
                showToast('Error al asociar clientes.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            }
        } catch (error) {
            console.error('Error adding clientes:', error);
            showToast('Error al asociar clientes.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    const handleAnyadeCliente = () => {
        setAnyadeCliente(true);
    };

    const handleVolverAtras = () => {
        setAnyadeCliente(false);
        setNewCliente({
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
            interes: '',
            rango_precios: [0, 1000000]
        });
        setNewComprador({
            nombre: '',
            apellido: '',
            dni: '',
            email: '',
            telefono: '',
            interes: '',
            rango_precios: [0, 1000000]
        });
    };
    useEffect(() => {
        if (clientsToAssociate.pedido) {
            setPedido(true);
        }
    }, [clientsToAssociate]);

    const handleRemoveCliente = async (clienteId) => {
        try {
            const response = await axios.post('/api/unassociate_client', { clienteId, inmuebleId });
            if (response.data.status === 'success') {
                showToast('Cliente eliminado con éxito', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                setFetchClientPhoneNumberRefreshKey(setFetchClientPhoneNumberRefreshKey + 1);
                setClientesAsociadosInmueble(clientesAsociadosInmueble.filter(cliente => cliente._id !== clienteId));
                setFilteredClientes(clientesAsociadosInmueble.filter(cliente => cliente._id !== clienteId));
                setLocalizadoRefreshKey(localizadoRefreshKey + 1);
            } else {
                showToast('Error al eliminar cliente', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            showToast('Error al eliminar cliente', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    const handleViewCliente = async (cliente) => {
        setViewMoreClienteAsociado(cliente);
        const allInmuebleIds = [
            ...cliente.inmuebles_asociados_propietario,
            ...cliente.inmuebles_asociados_inquilino
        ].map(inmueble => inmueble.id);
        try {
            const response = await axios.post('/api/fetch_cliente_inmuebles', {
                clientInmuebleIds: allInmuebleIds
            });

            if (response.status === 200) {
                console.log('response.data', response.data);
                setViewMoreClienteAsociado(prevState => ({
                    ...prevState,
                    inmueblesDetalle: response.data
                }));
            }
        } catch (error) {
            console.error('Error al obtener inmuebles:', error);
        }
        setViewMoreClienteAsociadoModalOpen(true);
    };


    const handleCloseViewMoreClienteAsociado = () => {
        setViewMoreClienteAsociado(null);
        setViewMoreClienteAsociadoModalOpen(false);
    };

    const handleEditClienteAsociado = (clienteId) => {
        setFetchClientPhoneNumberRefreshKey(setFetchClientPhoneNumberRefreshKey + 1);
        setEditCliente(clienteId);
        setEditClienteAsociadoModalOpen(true);
    };

    const closeModalClienteAsociado = () => {
        setEditClienteAsociado(null);
        setEditClienteAsociadoModalOpen(false);
    };

    const updateClienteAsociado = async () => {
        if (editCliente.nombre === "") {
            showToast('El campo "Nombre" es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }
        if (editCliente.apellido === "") {
            showToast('El campo "Apellido" es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }
        if (editCliente.telefono.length !== 9) {
            showToast('El teléfono debe tener 9 caracteres.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }
        if (editCliente.dni !== "" && !dniValidator(editCliente.dni)) {
            showToast('El DNI proporcionado no es válido.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(editCliente.email)) {
            showToast('El email proporcionado no es válido.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }
        try {
            const response = await axios.put('/api/updateClienteAsociado', editCliente, {
                params: { inmuebleId, inmuebleDireccion }
            });

            if (response.data.status === 'success') {
                showToast('Cliente actualizado con éxito', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                fetchClientesAsociados();
                setEditClienteAsociado(null);
                setFetchClientPhoneNumberRefreshKey(setFetchClientPhoneNumberRefreshKey + 1);
                setEditClienteAsociadoModalOpen(false);
                setLocalizadoRefreshKey(localizadoRefreshKey + 1);
            } else {
                showToast('Error al actualizar el cliente', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            }
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            showToast('Error al actualizar el cliente', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    useEffect(() => {
        console.log('newCliente', newCliente);
    }, [newCliente]);

    return (
        <Accordion defaultActiveKey={0} className={`w-full  ${screenWidth >= 640 ? 'm-0' : 'mt-[20px] ml-[16px] mr-[16px]'} border-1 border-gray-300 bg-slate-50 rounded-2xl shadow-lg`} style={{ borderRadius: '1rem' }}>
            <Accordion.Panel header="Clientes Asociados" eventKey={0} defaultExpanded={true} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Modal open={open} onClose={handleClose} style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '10px', padding: '0px' }} backdrop="static">
                    <Modal.Header>
                        <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'semibold', textAlign: 'center' }}>Asociar Cliente</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '15px 20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                        {!anyadeCliente && (
                            <SelectPicker
                                data={allClientes.map(cliente => ({ label: `${cliente.nombre} ${cliente.apellido}`, value: cliente }))}
                                onChange={(value) => {
                                    if (!value) {
                                        // When the selection is cleared, reset the states
                                        setClientsToAssociate([]);
                                        setClientsToAssociateInteres('');
                                        setClientsToAssociateRangoPrecios([]);
                                        setPedido(false);
                                        setInquilino(false);
                                        setPropietario(false);
                                    } else {
                                        // When items are selected, update the states accordingly
                                        setClientsToAssociate(value);
                                        setClientsToAssociateInteres(value.interes);
                                        setClientsToAssociateRangoPrecios(value.rango_precios);
                                        setInquilino(value.inmuebles_asociados_inquilino.some(inquilino => inquilino.id === inmuebleId));
                                        setPropietario(value.inmuebles_asociados_propietario.some(propietario => propietario.id === inmuebleId));
                                    }
                                }}
                                searchable={true}
                                style={{ width: '80%', margin: '0 auto' }}
                                placeholder="Selecciona un cliente"
                            />
                        )}
                        {clientsToAssociate.client_id && (
                            <>
                                <TagPicker
                                    data={[
                                        { label: 'Inquilino', value: 'inquilino', role: 'inquilino' },
                                        { label: 'Propietario', value: 'propietario', role: 'propietario' }
                                    ]}
                                    value={(inquilino ? ['inquilino'] : []).concat(propietario ? ['propietario'] : [])}
                                    onChange={(selectedValues) => {
                                        setInquilino(selectedValues.includes('inquilino'));
                                        setPropietario(selectedValues.includes('propietario'));
                                    }}
                                    placeholder="Selecciona roles"
                                    style={{ width: '80%', margin: '0 auto' }}
                                />

                                <Toggle size="md" checkedChildren="Informador" unCheckedChildren="No Informador" onChange={(checked) => setClientsToAssociateInformador(checked)} />
                                <Toggle size="md" checked={pedido} checkedChildren="Pedido" unCheckedChildren="No Pedido" onChange={(checked) => setPedido(checked)} />
                            </>
                        )}
                        {!clientsToAssociate.client_id && !anyadeCliente && (
                            <div className='flex flex-col gap-2 justify-center items-center mt-6'>
                                <p>¿El cliente no se ha creado todavía?</p>
                                <Button appearance='primary' onClick={handleAnyadeCliente}>Añadir Cliente</Button>
                            </div>
                        )}

                        {anyadeCliente && (
                            <div className='w-full flex flex-col gap-2 justify-center items-center mt-6'>
                                <Form fluid style={{ width: '100%' }}>
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
                                            <div className="w-full flex flex-row gap-32 justify-center items-start">
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
                                                    <div className="flex justify-center gap-4 mt-4">
                                                        <Form.Group controlId="precio_minimo">
                                                            <Form.ControlLabel>Precio Mínimo (€)</Form.ControlLabel>
                                                            <InputNumber
                                                                type="number"
                                                                min={0}
                                                                value={newCliente.rango_precios[0]}
                                                                onChange={value => {
                                                                    const maxPrice = newCliente.rango_precios[1];
                                                                    setNewCliente({
                                                                        ...newCliente,
                                                                        rango_precios: [parseInt(value, 10), maxPrice < value ? value : maxPrice]
                                                                    });
                                                                    setNewComprador({
                                                                        ...newComprador,
                                                                        rango_precios: [parseInt(value, 10), maxPrice < value ? value : maxPrice]
                                                                    });
                                                                }}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group controlId="precio_maximo">
                                                            <Form.ControlLabel>Precio Máximo (€)</Form.ControlLabel>
                                                            <InputNumber
                                                                type="number"
                                                                min={newCliente.rango_precios[0] || 0}
                                                                value={newCliente.rango_precios[1]}
                                                                max={newCliente.interes === 'comprar' ? 1000000 : 2500}
                                                                onChange={value => {
                                                                    const intValue = parseInt(value, 10);
                                                                    setNewCliente(prevState => ({
                                                                        ...prevState,
                                                                        rango_precios: [prevState.rango_precios[0], intValue]
                                                                    }));
                                                                    setNewComprador(prevState => ({
                                                                        ...prevState,
                                                                        rango_precios: [prevState.rango_precios[0], intValue]
                                                                    }));
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Form.Group>
                                            </div>
                                        </div>
                                    )}
                                    <Form.Group style={{ width: '100%' }}>
                                        <Form.ControlLabel>Nombre</Form.ControlLabel>
                                        <Form.Control name="nombre" value={newCliente.nombre} onChange={value => {
                                            setNewCliente({ ...newCliente, nombre: value });
                                            setNewComprador({ ...newComprador, nombre: value });
                                        }} />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.ControlLabel>Apellido</Form.ControlLabel>
                                        <Form.Control name="apellido" value={newCliente.apellido} onChange={value => {
                                            setNewCliente({ ...newCliente, apellido: value });
                                            setNewComprador({ ...newComprador, apellido: value });
                                        }} />
                                    </Form.Group>
                                    <Form.Group controlId="email">
                                        <Form.ControlLabel>Email</Form.ControlLabel>
                                        <Form.Control name="email" value={newCliente.email} onChange={value => {
                                            setNewCliente({ ...newCliente, email: value });
                                            setNewComprador({ ...newComprador, email: value });
                                        }} />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel>Teléfono</Form.ControlLabel>
                                        <Form.Control name="telefono" value={newCliente.telefono} onChange={value => {
                                            setNewCliente({ ...newCliente, telefono: value });
                                            setNewComprador({ ...newComprador, telefono: value });
                                        }} />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.ControlLabel>DNI</Form.ControlLabel>
                                        <Form.Control name="dni" value={newCliente.dni} onChange={value => {
                                            setNewCliente({ ...newCliente, dni: value });
                                            setNewComprador({ ...newComprador, dni: value });
                                        }}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel>Tipo de asociación con el inmueble actual</Form.ControlLabel>
                                        <TagPicker
                                            data={[
                                                { label: 'Inquilino', value: 'inquilino', role: 'inquilino' },
                                                { label: 'Propietario', value: 'propietario', role: 'propietario' }
                                            ]}
                                            value={(newCliente.inmuebles_asociados_inquilino && newCliente.inmuebles_asociados_inquilino.some(inquilino => inquilino.id === inmuebleId) ? ['inquilino'] : []).concat(newCliente.inmuebles_asociados_propietario && newCliente.inmuebles_asociados_propietario.some(propietario => propietario.id === inmuebleId) ? ['propietario'] : [])}
                                            onChange={(selectedValues) => {
                                                if (selectedValues.includes('inquilino')) {
                                                    if (!newCliente.inmuebles_asociados_inquilino.some(inquilino => inquilino.id === inmuebleId)) {
                                                        setNewCliente(prevState => ({
                                                            ...prevState,
                                                            inmuebles_asociados_inquilino: [...prevState.inmuebles_asociados_inquilino, { id: inmuebleId, direccion: inmuebleDireccion }]
                                                        }));
                                                    }
                                                } else {
                                                    setNewCliente(prevState => ({
                                                        ...prevState,
                                                        inmuebles_asociados_inquilino: prevState.inmuebles_asociados_inquilino.filter(inquilino => inquilino.id !== inmuebleId)
                                                    }));
                                                }
                                                if (selectedValues.includes('propietario')) {
                                                    if (!newCliente.inmuebles_asociados_propietario.some(propietario => propietario.id === inmuebleId)) {
                                                        setNewCliente(prevState => ({
                                                            ...prevState,
                                                            inmuebles_asociados_propietario: [...prevState.inmuebles_asociados_propietario, { id: inmuebleId, direccion: inmuebleDireccion }]
                                                        }));
                                                    }
                                                } else {
                                                    setNewCliente(prevState => ({
                                                        ...prevState,
                                                        inmuebles_asociados_propietario: prevState.inmuebles_asociados_propietario.filter(propietario => propietario.id !== inmuebleId)
                                                    }));
                                                }
                                            }}
                                            placeholder="Selecciona roles"
                                            style={{ width: '80%', margin: '0 auto' }}
                                        />
                                    </Form.Group>
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
                                            Asociar nuevo cliente
                                        </Button>
                                        <Button appearance="ghost" onClick={handleVolverAtras}>Volver atrás</Button>
                                    </div>

                                </Form>
                            </div>
                        )}

                        {pedido && (
                            // Placeholder for future form development
                            <Form>
                                <div className="w-full flex flex-col gap-2 justify-center items-center border border-gray-300 rounded-lg p-4 bg-gray-100">
                                    <Form.Group controlId="interes">
                                        <Form.ControlLabel style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', marginBottom: '10px' }}>Interés</Form.ControlLabel>
                                        <RadioGroup
                                            name="interes"
                                            inline
                                            onChange={value => setClientsToAssociateInteres(value)}
                                            value={clientsToAssociateInteres}
                                        >
                                            <Radio value="comprar">Comprar</Radio>
                                            <Radio value="alquilar">Alquilar</Radio>
                                        </RadioGroup>
                                    </Form.Group>

                                    <Form.Group controlId="rango_precios">
                                        <Form.ControlLabel style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>Rango de Precios</Form.ControlLabel>
                                        <div className="flex justify-center gap-4 mt-8 flex-row">
                                            <Form.Group controlId="precio_minimo">
                                                <Form.ControlLabel>Precio Mínimo (€)</Form.ControlLabel>
                                                <InputNumber
                                                    type="number"
                                                    min={0}
                                                    value={clientsToAssociateRangoPrecios[0]}
                                                    onChange={value => setClientsToAssociateRangoPrecios(prevRangoPrecios => [parseInt(value, 10), prevRangoPrecios[1]])}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Group>
                                            <Form.Group controlId="precio_maximo">
                                                <Form.ControlLabel>Precio Máximo (€)</Form.ControlLabel>
                                                <InputNumber
                                                    type="number"
                                                    min={clientsToAssociateRangoPrecios[0]}
                                                    max={clientsToAssociateInteres === 'comprar' ? 1000000 : 2500}
                                                    value={clientsToAssociateRangoPrecios[1]}
                                                    onChange={value => setClientsToAssociateRangoPrecios(prevRangoPrecios => [prevRangoPrecios[0], parseInt(value, 10)])}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Group>
                                        </div>
                                    </Form.Group>
                                </div>
                            </Form>
                        )}

                        <Modal.Footer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px', marginTop: '10px', marginBottom: '0px', alignItems: 'center' }}>
                            {clientsToAssociate.client_id && (
                                <Button appearance='primary' onClick={handleAsociarCliente} style={{ width: 'auto' }}>Asociar</Button>
                            )}

                            <Button onClick={handleClose} appearance="subtle">Cancelar</Button>
                        </Modal.Footer>
                    </Modal.Body>
                </Modal>
                <InputGroup style={{ width: '300px', margin: '0 auto 40px auto' }}>
                    <AutoComplete
                        placeholder="Buscar clientes asociados.."
                        data={clientesAsociadosInmueble.map(cliente => `${cliente.nombre} ${cliente.apellido}`)}
                        onChange={handleSearch}
                    />
                    <InputGroup.Button tabIndex={-1}>
                        <SearchIcon />
                    </InputGroup.Button>
                </InputGroup>
                {filteredClientes.length > 0 ? (
                    <ul className='flex flex-col gap-3 mt-4 w-full'>
                        {filteredClientes
                            .sort((a, b) => {
                                const aIsPropietario = a.inmuebles_asociados_propietario?.some(propietario => propietario.id === inmuebleId);
                                const bIsPropietario = b.inmuebles_asociados_propietario?.some(propietario => propietario.id === inmuebleId);
                                return bIsPropietario - aIsPropietario;
                            })
                            .map((cliente) => (
                                <>
                                    <li key={cliente._id} className="flex flex-row justify-stretch items-center">
                                        <div className="flex flex-row justify-evenly items-center w-full gap-1">
                                            <div className='flex flex-row pr-1 justify-center items-center gap-1'>
                                                <Icon icon="mdi:information" style={{ fontSize: '2rem' }} className={cliente.informador ? 'text-blue-500' : 'text-transparent'} />
                                            </div>
                                            <div className='w-36  text-center'>
                                                <p className="text-base sm:text-lg font-semibold w-full">{cliente.nombre} {cliente.apellido}</p>
                                            </div>
                                            <div className='w-20 px-2 text-center display-flex flex-col justify-center items-center'>
                                                <div className='flex flex-col justify-center items-center mx-0 sm:flex-row md:flex-col md:min-w-fit gap-2'>
                                                    {cliente.inmuebles_asociados_propietario?.some(propietario => propietario.id === inmuebleId) && (
                                                        <Tag color="green" style={{ margin: '0 auto' }}>Propietario</Tag>
                                                    )}
                                                    {cliente.inmuebles_asociados_inquilino?.some(inquilino => inquilino.id === inmuebleId) && (
                                                        <Tag color="orange" style={{ margin: '0 auto' }}>Inquilino</Tag>
                                                    )}
                                                </div>
                                            </div>
                                            {cliente.telefono && window.innerWidth >= 640 && (
                                                <div className='flex-2 display-flex flex-row justify-center items-center'>
                                                    <p>{cliente.telefono}</p>
                                                </div>
                                            )}
                                            <div className='w-[100px] text-center flex flex-row justify-center items-center gap-2 pl-2'>
                                                <button className='rounded-md text-xl' onClick={() => handleViewCliente(cliente)}>
                                                    <FaEye />
                                                </button>
                                                <button className='rounded-md text-xl' onClick={() => handleEditClienteAsociado(cliente)}>
                                                    <AiOutlineEdit />
                                                </button>
                                                <button onClick={() => handleRemoveCliente(cliente._id)} className='text-black text-xl'>
                                                    <AiOutlineClose />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                    <div className='h-[1px] w-full bg-gray-300 my-2'></div>
                                </>
                            ))}
                    </ul>
                ) : (
                    <p className='text-center'>No hay clientes asociados a este inmueble.</p>
                )}

                <div className='flex justify-center items-center w-full'>
                    <Button appearance='primary' style={{ marginBottom: '20px', marginTop: '20px' }} className="bg-blue-400" onClick={handleOpenAsociar}>Asociar Clientes</Button>
                </div>
                <Modal open={editClienteAsociadoModalOpen} onClose={closeModalClienteAsociado} backdrop={true} overflow={false} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0px', marginBottom: '70px' }} size="xs">
                    <Modal.Header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', marginTop: '10px' }}>
                        <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'semibold', textAlign: 'center' }}>Editar Cliente Asociado</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '15px 20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                        {editCliente && (
                            <Form fluid>
                                <Form.Group controlId="nombre">
                                    <Form.ControlLabel>Nombre</Form.ControlLabel>
                                    <Form.Control name="nombre" defaultValue={editCliente.nombre} onChange={value => setEditCliente(prevState => ({ ...prevState, nombre: value }))} />
                                </Form.Group>
                                <Form.Group controlId="apellido">
                                    <Form.ControlLabel>Apellido</Form.ControlLabel>
                                    <Form.Control name="apellido" defaultValue={editCliente.apellido} onChange={value => setEditCliente(prevState => ({ ...prevState, apellido: value }))} />
                                </Form.Group>
                                <Form.Group controlId="dni">
                                    <Form.ControlLabel>DNI</Form.ControlLabel>
                                    <Form.Control name="dni" defaultValue={editCliente.dni} onChange={value => setEditCliente(prevState => ({ ...prevState, dni: value }))} />
                                </Form.Group>
                                <Form.Group controlId="email">
                                    <Form.ControlLabel>Email</Form.ControlLabel>
                                    <Form.Control name="email" defaultValue={editCliente.email} onChange={value => setEditCliente(prevState => ({ ...prevState, email: value }))} />
                                </Form.Group>
                                <Form.Group controlId="telefono">
                                    <Form.ControlLabel>Teléfono</Form.ControlLabel>
                                    <Form.Control name="telefono" defaultValue={editCliente.telefono} onChange={value => setEditCliente(prevState => ({ ...prevState, telefono: value }))} />
                                </Form.Group>


                                <Form.Group>
                                    <Form.ControlLabel>Tipo de asociación con el inmueble actual</Form.ControlLabel>
                                    <TagPicker
                                        data={[
                                            { label: 'Inquilino', value: 'inquilino', role: 'inquilino' },
                                            { label: 'Propietario', value: 'propietario', role: 'propietario' }
                                        ]}
                                        value={(editCliente.inmuebles_asociados_inquilino && editCliente.inmuebles_asociados_inquilino.some(inquilino => inquilino.id === inmuebleId) ? ['inquilino'] : []).concat(editCliente.inmuebles_asociados_propietario && editCliente.inmuebles_asociados_propietario.some(propietario => propietario.id === inmuebleId) ? ['propietario'] : [])}
                                        onChange={(selectedValues) => {
                                            if (selectedValues.includes('inquilino')) {
                                                if (!editCliente.inmuebles_asociados_inquilino.some(inquilino => inquilino.id === inmuebleId)) {
                                                    setEditCliente(prevState => ({
                                                        ...prevState,
                                                        inmuebles_asociados_inquilino: [...prevState.inmuebles_asociados_inquilino, { id: inmuebleId, direccion: inmuebleDireccion }]
                                                    }));
                                                }
                                            } else {
                                                setEditCliente(prevState => ({
                                                    ...prevState,
                                                    inmuebles_asociados_inquilino: prevState.inmuebles_asociados_inquilino.filter(inquilino => inquilino.id !== inmuebleId)
                                                }));
                                            }
                                            if (selectedValues.includes('propietario')) {
                                                if (!editCliente.inmuebles_asociados_propietario.some(propietario => propietario.id === inmuebleId)) {
                                                    setEditCliente(prevState => ({
                                                        ...prevState,
                                                        inmuebles_asociados_propietario: [...prevState.inmuebles_asociados_propietario, { id: inmuebleId, direccion: inmuebleDireccion }]
                                                    }));
                                                }
                                            } else {
                                                setEditCliente(prevState => ({
                                                    ...prevState,
                                                    inmuebles_asociados_propietario: prevState.inmuebles_asociados_propietario.filter(propietario => propietario.id !== inmuebleId)
                                                }));
                                            }
                                        }}
                                        placeholder="Selecciona roles"
                                        style={{ width: '80%', margin: '0 auto' }}
                                    />
                                </Form.Group>
                                <Form.Group controlId="informador-toggle" className="w-full flex flex-col gap-4 justify-center items-center">
                                    <p>¿Es un informador?</p>
                                    <Toggle
                                        checkedChildren="Informador"
                                        unCheckedChildren="No Informador"
                                        checked={editCliente.informador}
                                        onChange={(checked) => setEditCliente({ ...editCliente, informador: checked })}
                                        size={'lg'}
                                    />
                                </Form.Group>
                                <Form.Group controlId="pedido-toggle" className="w-full flex flex-col gap-4 justify-center items-center">
                                    <p>¿Es un pedido?</p>
                                    <Toggle
                                        checkedChildren="Pedido"
                                        unCheckedChildren="No Pedido"
                                        checked={editCliente.pedido}
                                        onChange={(checked) => setEditCliente(prevState => ({ ...prevState, pedido: !prevState.pedido }))}
                                        size={'lg'}
                                    />
                                </Form.Group>

                                {editCliente.pedido && (
                                    <div className="w-full flex flex-col gap-4 justify-center items-center mt-10 bg-slate-200 rounded-md p-4 shadow-lg">
                                        <h4 className='text-lg font-semibold text-center'>Información del Pedido</h4>
                                        <div className="w-full flex flex-col justify-center items-center">
                                            <Form.Group controlId="interes">
                                                <Form.ControlLabel style={{ textAlign: 'center' }}>Interés</Form.ControlLabel>
                                                <RadioGroup
                                                    name="interes"
                                                    value={editCliente.interes}
                                                    onChange={value => setEditCliente(prevState => ({
                                                        ...prevState,
                                                        interes: value,
                                                        rango_precios: value === 'comprar' ? [0, 1000000] : [0, 2500]
                                                    }))}
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
                                                        <InputNumber
                                                            type="number"
                                                            min={0}
                                                            value={editCliente.rango_precios[0]}
                                                            onChange={value => {
                                                                const maxPrice = editCliente.rango_precios[1];
                                                                setEditCliente(prevState => ({
                                                                    ...prevState,
                                                                    rango_precios: [parseInt(value, 10), maxPrice < value ? parseInt(value, 10) : maxPrice]
                                                                }));
                                                            }}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group controlId="precio_maximo">
                                                        <Form.ControlLabel>Precio Máximo (€)</Form.ControlLabel>
                                                        <InputNumber
                                                            type="number"
                                                            min={editCliente.rango_precios[0] || 0}
                                                            value={editCliente.rango_precios[1]}
                                                            max={editCliente.interes === 'comprar' ? 1000000 : 2500}
                                                            onChange={value => {
                                                                const intValue = parseInt(value, 10);
                                                                setEditCliente(prevState => ({
                                                                    ...prevState,
                                                                    rango_precios: [prevState.rango_precios[0], intValue]
                                                                }));
                                                            }}
                                                        />
                                                    </Form.Group>
                                                </div>
                                            </Form.Group>
                                        </div>
                                    </div>
                                )}
                            </Form>
                        )}

                        <Modal.Footer style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px', marginBottom: '0px', alignItems: 'center' }}>
                            <Button onClick={updateClienteAsociado} appearance="primary">
                                Guardar
                            </Button>
                            <Button onClick={closeModalClienteAsociado} appearance="subtle" style={{ margin: '0px' }}>
                                Cancelar
                            </Button>
                        </Modal.Footer>
                    </Modal.Body>
                </Modal>
                <Modal open={viewMoreClienteAsociadoModalOpen} onClose={handleCloseViewMoreClienteAsociado} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0px', marginBottom: '70px' }} backdrop={true} overflow={false} size="xs">
                    <Modal.Header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', marginTop: '10px' }}>
                        <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'semibold', textAlign: 'center' }}>Detalles del Cliente Asociado</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '15px 0px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                        {viewMoreClienteAsociado && (
                            <div className='flex flex-col gap-2 w-[90%]'>
                                <div className='flex flex-col gap-2 px-4 py-2 bg-slate-200 rounded-md shadow-lg mb-4'>
                                    <p><strong>Nombre:</strong> {viewMoreClienteAsociado.nombre}</p>
                                    <p><strong>Apellido:</strong> {viewMoreClienteAsociado.apellido}</p>
                                    <p><strong>DNI:</strong> {viewMoreClienteAsociado.dni}</p>
                                    <p><strong>Teléfono:</strong> {viewMoreClienteAsociado.telefono}</p>
                                    {viewMoreClienteAsociado.pedido && (
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
                                            {viewMoreClienteAsociado.inmuebles_asociados_propietario && viewMoreClienteAsociado.inmuebles_asociados_propietario.length > 0 && (
                                                <Tag
                                                    key="propietario"
                                                    color="green"
                                                    style={{ marginBottom: '5px', marginRight: '5px' }}
                                                >
                                                    Propietario
                                                </Tag>
                                            )}
                                            {viewMoreClienteAsociado.inmuebles_asociados_inquilino && viewMoreClienteAsociado.inmuebles_asociados_inquilino.length > 0 && (
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
                                    {viewMoreClienteAsociado.informador && (
                                        <div className="flex flex-row gap-2 mt-[10px]">
                                            <p><strong>Informador:</strong></p>
                                            <Tag color="cyan" style={{ marginBottom: '5px', marginRight: '5px' }}>
                                                Informador
                                            </Tag>
                                        </div>
                                    )}
                                </div>


                                {(viewMoreClienteAsociado.inmuebles_asociados_propietario && viewMoreClienteAsociado.inmuebles_asociados_propietario.length > 0) || (viewMoreClienteAsociado.inmuebles_asociados_inquilino && viewMoreClienteAsociado.inmuebles_asociados_inquilino.length > 0) ? (
                                    <div>
                                        {['propietario', 'inquilino'].map(tipo => (
                                            viewMoreClienteAsociado[`inmuebles_asociados_${tipo}`] && viewMoreClienteAsociado[`inmuebles_asociados_${tipo}`].length > 0 && (
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

                                                    <Table autoHeight={true} data={viewMoreClienteAsociado.inmueblesDetalle.filter(inmueble =>
                                                        viewMoreClienteAsociado[`inmuebles_asociados_${tipo}`].some(assoc => assoc.id === inmueble.id)
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
                                                    </Table>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        )}
                        <Modal.Footer>
                            <Button onClick={handleCloseViewMoreClienteAsociado} appearance="subtle">
                                Cerrar
                            </Button>
                        </Modal.Footer>
                    </Modal.Body>
                </Modal>

            </Accordion.Panel>
        </Accordion >
    );
};

export default ClientesAsociados;
