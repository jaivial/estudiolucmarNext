import GeneralLayout from "../components/layouts/GeneralLayout.js";
import { useState, useEffect } from "react";
import axios from 'axios';
import { Button, Form, Modal, SelectPicker, Table, Tag, Panel, PanelGroup, Whisper, Tooltip } from 'rsuite';
import { Icon } from '@iconify/react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import 'rsuite/dist/rsuite.min.css';
import '../app/globals.css';
import LoadingScreen from "../components/LoadingScreen/LoadingScreen.js";
import { dniValidator } from '../lib/mongodb/dniValidator/dniValidator.js';
import { useToaster, Notification } from 'rsuite';


const { Column, HeaderCell, Cell } = Table;

export default function Clientes({ isAdmin }) {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [newCliente, setNewCliente] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        tipo_de_cliente: [],
        inmuebles_asociados_informador: [],
        inmuebles_asociados_propietario: [],
        inmuebles_asociados_copropietario: [],
        inmuebles_asociados_inquilino: [],
        telefono: '',
        inmueblesDetalle: []
    });
    const [inmuebles, setInmuebles] = useState([]);
    const [open, setOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editCliente, setEditCliente] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const toaster = useToaster();

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            const response = await axios.get('/api/fetch_clientes');
            setClientes(response.data);
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
            ...cliente.inmuebles_asociados_informador,
            ...cliente.inmuebles_asociados_propietario,
            ...cliente.inmuebles_asociados_copropietario,
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

    const handleRemoveInmueble = (type, id, mode = 'new') => {
        const updateFunc = mode === 'edit' ? setEditCliente : setNewCliente;
        const cliente = mode === 'edit' ? editCliente : newCliente;

        updateFunc({
            ...cliente,
            [`inmuebles_asociados_${type}`]: cliente[`inmuebles_asociados_${type}`].filter(item => item.id !== id)
        });
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
            console.log('editCliente', editCliente);
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
            inmuebles_asociados_informador: [],
            inmuebles_asociados_propietario: [],
            inmuebles_asociados_copropietario: [],
            inmuebles_asociados_inquilino: [],
            telefono: '',
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

    return (
        <GeneralLayout title="Gestión de Clientes" description="Panel de administración de clientes">
            {loading && <LoadingScreen />}
            <div className="h-full w-full flex flex-col items-center justify-start pt-20 overflow-y-scroll bg-gradient-to-t from-slate-400 via-slate-300 to-slate-200">
                <h1 className="text-3xl font-bold text-center font-sans w-80 mb-8">Gestión de Clientes</h1>

                <div className="p-4 mb-32 w-[90%]">
                    <PanelGroup accordion bordered>
                        <Panel header="Clientes" eventKey="1" className="bg-slate-50 rounded-lg shadow-xl">
                            <Table data={clientes} autoHeight>
                                <Column width={200} align="center">
                                    <HeaderCell>Nombre</HeaderCell>
                                    <Cell dataKey="nombre" />
                                </Column>

                                <Column width={200} align="center">
                                    <HeaderCell>Apellido</HeaderCell>
                                    <Cell dataKey="apellido" />
                                </Column>

                                <Column width={350} align="center">
                                    <HeaderCell>Tipo de Cliente</HeaderCell>
                                    <Cell>
                                        {rowData => (
                                            <div className="flex flex-row">
                                                {rowData.tipo_de_cliente.map(tipo => (
                                                    <Tag
                                                        key={tipo}
                                                        color={
                                                            tipo === 'propietario' ? 'green' :
                                                                tipo === 'copropietario' ? 'blue' :
                                                                    tipo === 'inquilino' ? 'orange' :
                                                                        'cyan'
                                                        }
                                                        style={{ marginBottom: '5px' }}
                                                    >
                                                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                                    </Tag>
                                                ))}
                                            </div>
                                        )}
                                    </Cell>
                                </Column>

                                <Column width={200} align="center">
                                    <HeaderCell>DNI</HeaderCell>
                                    <Cell dataKey="dni" />
                                </Column>

                                <Column width={200} align="center">
                                    <HeaderCell>Teléfono</HeaderCell>
                                    <Cell dataKey="telefono">
                                        {rowData => rowData.telefono || 'N/A'}
                                    </Cell>
                                </Column>

                                <Column width={200} align="center">
                                    <HeaderCell>Inmuebles Asociados</HeaderCell>
                                    <Cell>
                                        {rowData => rowData.inmuebles_asociados_informador.length +
                                            rowData.inmuebles_asociados_propietario.length +
                                            rowData.inmuebles_asociados_copropietario.length +
                                            rowData.inmuebles_asociados_inquilino.length}
                                    </Cell>
                                </Column>

                                <Column width={120} align="center" fixed="right">
                                    <HeaderCell>Acciones</HeaderCell>
                                    <Cell>
                                        {rowData => (
                                            <div className="flex flex-row gap-4">
                                                <Whisper placement="top" trigger="hover" speaker={<Tooltip>Ver</Tooltip>}>
                                                    <Icon icon="mdi:eye-outline" style={{ cursor: 'pointer', fontSize: '1.5rem' }} onClick={() => handleOpen(rowData)} />
                                                </Whisper>

                                                {isAdmin && (
                                                    <Whisper placement="top" trigger="hover" speaker={<Tooltip>Editar</Tooltip>}>
                                                        <Icon icon="mdi:pencil-outline" style={{ cursor: 'pointer', fontSize: '1.5rem', color: 'green' }} onClick={() => handleOpenEditModal(rowData)} />
                                                    </Whisper>
                                                )}

                                                <Whisper placement="top" trigger="hover" speaker={<Tooltip>Eliminar</Tooltip>}>
                                                    <Icon icon="mdi:trash-can-outline" style={{ cursor: 'pointer', fontSize: '1.5rem', color: 'red' }} onClick={() => handleDeleteCliente(rowData.client_id)} />
                                                </Whisper>
                                            </div>
                                        )}
                                    </Cell>
                                </Column>
                            </Table>
                        </Panel>

                        <Panel header="Agregar Nuevo Cliente" eventKey="2" className="bg-slate-50 rounded-lg shadow-xl">
                            <Form fluid>
                                <Form.Group>
                                    <Form.ControlLabel>Nombre</Form.ControlLabel>
                                    <Form.Control name="nombre" value={newCliente.nombre} onChange={value => setNewCliente({ ...newCliente, nombre: value })} />
                                </Form.Group>

                                <Form.Group>
                                    <Form.ControlLabel>Apellido</Form.ControlLabel>
                                    <Form.Control name="apellido" value={newCliente.apellido} onChange={value => setNewCliente({ ...newCliente, apellido: value })} />
                                </Form.Group>
                                <Form.Group>
                                    <Form.ControlLabel>Teléfono</Form.ControlLabel>
                                    <Form.Control name="telefono" value={newCliente.telefono} onChange={value => setNewCliente({ ...newCliente, telefono: value })} />
                                </Form.Group>

                                <Form.Group>
                                    <Form.ControlLabel>DNI</Form.ControlLabel>
                                    <Form.Control name="dni" value={newCliente.dni} onChange={value => setNewCliente({ ...newCliente, dni: value })} />
                                </Form.Group>

                                <Form.Group>
                                    <Form.ControlLabel>Tipo de Cliente</Form.ControlLabel>
                                    <SelectPicker
                                        data={[
                                            { label: 'Informador', value: 'informador' },
                                            { label: 'Propietario', value: 'propietario' },
                                            { label: 'Co-propietario', value: 'copropietario' },
                                            { label: 'Inquilino', value: 'inquilino' },
                                        ]}
                                        value={newCliente.tipo_de_cliente}
                                        onChange={value => handleSelectTipoDeCliente(value, 'new')}
                                        searchable={false}
                                        multiple
                                        block
                                    />
                                </Form.Group>

                                {newCliente.tipo_de_cliente.includes('informador') && (
                                    <Form.Group>
                                        <Form.ControlLabel>Inmuebles Asociados (Informador)</Form.ControlLabel>
                                        <div style={{ marginBottom: '10px' }}>
                                            {newCliente.inmuebles_asociados_informador.map(item => (
                                                <Tag
                                                    key={item.id}
                                                    closable
                                                    onClose={() => handleRemoveInmueble('informador', item.id)}
                                                    style={{ marginRight: '5px', marginBottom: '5px' }}
                                                >
                                                    {item.direccion}
                                                </Tag>
                                            ))}
                                        </div>
                                        <SelectPicker
                                            data={inmuebles.map(inmueble => ({ label: inmueble.direccion, value: inmueble.id }))}
                                            onSearch={handleSearchInmuebles}
                                            onChange={(value) => handleSelectInmueble('informador', value, 'new')}
                                            searchable
                                            block
                                            menuStyle={{ maxHeight: 200, overflowY: 'auto' }}
                                            placement="bottomEnd"
                                        />
                                    </Form.Group>
                                )}

                                {newCliente.tipo_de_cliente.includes('propietario') && (
                                    <Form.Group>
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
                                    </Form.Group>
                                )}

                                {newCliente.tipo_de_cliente.includes('copropietario') && (
                                    <Form.Group>
                                        <Form.ControlLabel>Inmuebles Asociados (Co-propietario)</Form.ControlLabel>
                                        <div style={{ marginBottom: '10px' }}>
                                            {newCliente.inmuebles_asociados_copropietario.map(item => (
                                                <Tag
                                                    key={item.id}
                                                    closable
                                                    onClose={() => handleRemoveInmueble('copropietario', item.id)}
                                                    style={{ marginRight: '5px', marginBottom: '5px' }}
                                                >
                                                    {item.direccion}
                                                </Tag>
                                            ))}
                                        </div>
                                        <SelectPicker
                                            data={inmuebles.map(inmueble => ({ label: inmueble.direccion, value: inmueble.id }))}
                                            onSearch={handleSearchInmuebles}
                                            onChange={(value) => handleSelectInmueble('copropietario', value, 'new')}
                                            searchable
                                            block
                                            menuStyle={{ maxHeight: 200, overflowY: 'auto' }}
                                            placement="bottomEnd"
                                        />
                                    </Form.Group>
                                )}

                                {newCliente.tipo_de_cliente.includes('inquilino') && (
                                    <Form.Group>
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
                                    </Form.Group>
                                )}

                                <Button appearance="primary" onClick={handleAddCliente} style={{ marginTop: '20px' }}>
                                    Agregar Cliente
                                </Button>
                            </Form>
                        </Panel>
                    </PanelGroup>
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

                            <div className="flex flex-row gap-2 mt-[10px]">
                                <p><strong>Tipo de Cliente:</strong></p>
                                <div>
                                    {selectedCliente.tipo_de_cliente.map(tipo => (
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

                            {['informador', 'propietario', 'copropietario', 'inquilino'].map(tipo => (
                                selectedCliente.tipo_de_cliente.includes(tipo) && (
                                    <div key={tipo} style={{ marginBottom: '20px' }}>
                                        <div
                                            style={{
                                                backgroundColor: tipo === 'propietario' ? '#28a745' :
                                                    tipo === 'copropietario' ? '#007bff' :
                                                        tipo === 'inquilino' ? '#fd7e14' :
                                                            '#17a2b8',
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
                        </Modal.Body>
                        <Modal.Footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <Button onClick={handleClose} appearance="subtle">Cerrar</Button>
                        </Modal.Footer>
                    </Modal>
                )}

                {editCliente && editModalOpen && (
                    <Modal open={editModalOpen} onClose={handleCloseEditModal} backdrop={true} size="lg" overflow={true}>
                        <Modal.Header>
                            <Modal.Title>Editar Cliente</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form fluid>
                                <Form.Group>
                                    <Form.ControlLabel>Nombre</Form.ControlLabel>
                                    <Form.Control name="nombre" value={editCliente.nombre} onChange={value => setEditCliente({ ...editCliente, nombre: value })} />
                                </Form.Group>
                                <Form.Group>
                                    <Form.ControlLabel>Apellido</Form.ControlLabel>
                                    <Form.Control name="apellido" value={editCliente.apellido} onChange={value => setEditCliente({ ...editCliente, apellido: value })} />
                                </Form.Group>
                                <Form.Group>
                                    <Form.ControlLabel>Teléfono</Form.ControlLabel>
                                    <Form.Control name="telefono" value={editCliente.telefono} onChange={value => setEditCliente({ ...editCliente, telefono: value })} />
                                </Form.Group>
                                <Form.Group>
                                    <Form.ControlLabel>DNI</Form.ControlLabel>
                                    <Form.Control name="dni" value={editCliente.dni} onChange={value => setEditCliente({ ...editCliente, dni: value })} />
                                </Form.Group>

                                <Form.Group>
                                    <Form.ControlLabel>Tipo de Cliente</Form.ControlLabel>
                                    <SelectPicker
                                        data={[
                                            { label: 'Informador', value: 'informador' },
                                            { label: 'Propietario', value: 'propietario' },
                                            { label: 'Co-propietario', value: 'copropietario' },
                                            { label: 'Inquilino', value: 'inquilino' },
                                        ]}
                                        value={editCliente.tipo_de_cliente}
                                        onChange={value => handleSelectTipoDeCliente(value, 'edit')}
                                        searchable={false}
                                        multiple
                                        block
                                    />
                                </Form.Group>

                                {editCliente.tipo_de_cliente.includes('informador') && (
                                    <Form.Group>
                                        <Form.ControlLabel>Inmuebles Asociados (Informador)</Form.ControlLabel>
                                        <div style={{ marginBottom: '10px' }}>
                                            {editCliente.inmuebles_asociados_informador.map(item => (
                                                <Tag key={item.id} closable onClose={() => handleRemoveInmueble('informador', item.id, 'edit')} style={{ marginRight: '5px', marginBottom: '5px' }}>
                                                    {item.direccion}
                                                </Tag>
                                            ))}
                                        </div>
                                        <SelectPicker
                                            data={inmuebles.map(inmueble => ({ label: inmueble.direccion, value: inmueble.id }))}
                                            onSearch={handleSearchInmuebles}
                                            onChange={(value) => handleSelectInmueble('informador', value, 'edit')}
                                            searchable
                                            block
                                            menuStyle={{ maxHeight: 200, overflowY: 'auto' }}
                                            placement="bottomEnd"
                                        />
                                    </Form.Group>
                                )}

                                {editCliente.tipo_de_cliente.includes('propietario') && (
                                    <Form.Group>
                                        <Form.ControlLabel>Inmuebles Asociados (Propietario)</Form.ControlLabel>
                                        <div style={{ marginBottom: '10px' }}>
                                            {editCliente.inmuebles_asociados_propietario.map(item => (
                                                <Tag key={item.id} closable onClose={() => handleRemoveInmueble('propietario', item.id, 'edit')} style={{ marginRight: '5px', marginBottom: '5px' }}>
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
                                            placement="bottomEnd"
                                        />
                                    </Form.Group>
                                )}

                                {editCliente.tipo_de_cliente.includes('copropietario') && (
                                    <Form.Group>
                                        <Form.ControlLabel>Inmuebles Asociados (Co-propietario)</Form.ControlLabel>
                                        <div style={{ marginBottom: '10px' }}>
                                            {editCliente.inmuebles_asociados_copropietario.map(item => (
                                                <Tag key={item.id} closable onClose={() => handleRemoveInmueble('copropietario', item.id, 'edit')} style={{ marginRight: '5px', marginBottom: '5px' }}>
                                                    {item.direccion}
                                                </Tag>
                                            ))}
                                        </div>
                                        <SelectPicker
                                            data={inmuebles.map(inmueble => ({ label: inmueble.direccion, value: inmueble.id }))}
                                            onSearch={handleSearchInmuebles}
                                            onChange={(value) => handleSelectInmueble('copropietario', value, 'edit')}
                                            searchable
                                            block
                                            menuStyle={{ maxHeight: 200, overflowY: 'auto' }}
                                            placement="bottomEnd"
                                        />
                                    </Form.Group>
                                )}

                                {editCliente.tipo_de_cliente.includes('inquilino') && (
                                    <Form.Group>
                                        <Form.ControlLabel>Inmuebles Asociados (Inquilino)</Form.ControlLabel>
                                        <div style={{ marginBottom: '10px' }}>
                                            {editCliente.inmuebles_asociados_inquilino.map(item => (
                                                <Tag key={item.id} closable onClose={() => handleRemoveInmueble('inquilino', item.id, 'edit')} style={{ marginRight: '5px', marginBottom: '5px' }}>
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
                                            placement="bottomEnd"
                                        />
                                    </Form.Group>
                                )}
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={handleUpdateCliente} appearance="primary">Actualizar</Button>
                            <Button onClick={handleCloseEditModal} appearance="subtle">Cancelar</Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </div>
        </GeneralLayout >
    );
}
