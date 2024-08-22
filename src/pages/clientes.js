import GeneralLayout from "../components/layouts/GeneralLayout.js";
import { useState, useEffect } from "react";
import axios from 'axios';
import { Button, Input, Form, Modal, SelectPicker, Table, Tag, Panel, PanelGroup, Notification, useToaster, Whisper, Tooltip, Placeholder } from 'rsuite';
import { Icon } from '@iconify/react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import 'rsuite/dist/rsuite.min.css';
import '../app/globals.css';
import LoadingScreen from "../components/LoadingScreen/LoadingScreen.js";
import { dniValidator } from '../lib/mongodb/dniValidator/dniValidator.js';

const { Column, HeaderCell, Cell } = Table;

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [newCliente, setNewCliente] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        tipo_de_cliente: [],  // Array to hold multiple client types
        inmuebles_asociados_informador: [],
        inmuebles_asociados_propietario: [],
        inmuebles_asociados_copropietario: [],
        inmuebles_asociados_inquilino: [],
        telefono: '',
    });
    const [inmuebles, setInmuebles] = useState([]);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const toaster = useToaster();

    useEffect(() => {
        fetchClientes();
        fetchInmuebles();
    }, []);

    useEffect(() => {
        console.log('clientes', clientes);
    }, [clientes]);

    const fetchClientes = async () => {
        try {
            const response = await axios.get('/api/fetch_clientes');
            setClientes(response.data); // Asigna los datos de los clientes al estado
        } catch (error) {
            console.error('Error al obtener clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInmuebles = async () => {
        try {
            const response = await axios.get('/api/fetch_inmuebles');
            setInmuebles(response.data);
        } catch (error) {
            console.error('Error al obtener inmuebles:', error);
        }
    };

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

    const handleRemoveInmueble = (type, id) => {
        setNewCliente({
            ...newCliente,
            [`inmuebles_asociados_${type}`]: newCliente[`inmuebles_asociados_${type}`].filter(item => item.id !== id)
        });
    };

    const handleSelectInmueble = (type, value) => {
        const selectedInmueble = inmuebles.find(inmueble => inmueble.id === value);
        if (selectedInmueble) {
            setNewCliente((prevState) => ({
                ...prevState,
                [`inmuebles_asociados_${type}`]: [
                    ...prevState[`inmuebles_asociados_${type}`],
                    { id: selectedInmueble.id, direccion: selectedInmueble.direccion }
                ]
            }));
        }
    };

    const handleSelectTipoDeCliente = (value) => {
        setNewCliente((prevState) => {
            const isSelected = prevState.tipo_de_cliente.includes(value);
            return {
                ...prevState,
                tipo_de_cliente: isSelected
                    ? prevState.tipo_de_cliente.filter(tipo => tipo !== value)  // Remove if already selected
                    : [...prevState.tipo_de_cliente, value]  // Add if not selected
            };
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
        console.log('clienteId', clienteId);
        console.log('typeof clienteId', typeof clienteId);
        try {
            const response = await axios.delete('/api/delete_cliente', { data: { id: clienteId } });
            if (response.status === 200) {
                showToast('Cliente eliminado.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');

                // Eliminar el cliente del array de clientes en el estado
                setClientes(prevClientes => prevClientes.filter(cliente => cliente.client_id !== clienteId));
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            showToast('Error al eliminar el cliente.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
        }
    };



    const handleUpdateCliente = async () => {
        if (newCliente.dni && !dniValidator(newCliente.dni)) {
            showToast('El DNI no es válido', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }

        try {
            const response = await axios.post('/api/update_cliente', selectedCliente);
            if (response.status === 200) {
                showToast('Cliente actualizado.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                fetchClientes();
                setShowModal(false);
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
                                                <Whisper
                                                    placement="top"
                                                    trigger="hover"
                                                    speaker={<Tooltip>Ver</Tooltip>}
                                                >
                                                    <Icon
                                                        icon="mdi:eye-outline"
                                                        style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                                                        onClick={() => {
                                                            setSelectedCliente(rowData);
                                                            handleOpen();
                                                        }}
                                                    />
                                                </Whisper>

                                                {' '}

                                                <Whisper
                                                    placement="top"
                                                    trigger="hover"
                                                    speaker={<Tooltip>Eliminar</Tooltip>}
                                                >
                                                    <Icon
                                                        icon="mdi:trash-can-outline"
                                                        style={{ cursor: 'pointer', fontSize: '1.5rem', color: 'red' }}
                                                        onClick={() => handleDeleteCliente(rowData.client_id)}

                                                    />
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
                                    <Form.Control
                                        name="telefono"
                                        value={newCliente.telefono}
                                        onChange={value => setNewCliente({ ...newCliente, telefono: value })}
                                    />
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
                                        onChange={handleSelectTipoDeCliente}
                                        searchable={false}
                                        multiple
                                        block
                                    />
                                </Form.Group>

                                {/* Dynamic sections for each client type */}
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
                                            onChange={(value) => handleSelectInmueble('informador', value)}
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
                                            onChange={(value) => handleSelectInmueble('propietario', value)}
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
                                            onChange={(value) => handleSelectInmueble('copropietario', value)}
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
                                            onChange={(value) => handleSelectInmueble('inquilino', value)}
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
                        <Modal.Header>
                            <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Información del Cliente</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ padding: '20px', fontSize: '1rem', lineHeight: '1.5' }}>
                            <p><strong>Nombre:</strong> {selectedCliente.nombre}</p>
                            <p><strong>Apellido:</strong> {selectedCliente.apellido}</p>
                            <p><strong>DNI:</strong> {selectedCliente.dni}</p>
                            <p><strong>Teléfono:</strong> {selectedCliente.telefono}</p>
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
                                        style={{ marginBottom: '5px' }}
                                    >
                                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                    </Tag>
                                ))}
                            </div>
                            <p><strong>Inmuebles Asociados:</strong></p>
                            {selectedCliente.inmuebles_asociados_informador.length > 0 && (
                                <>
                                    <p><strong>Informador:</strong></p>
                                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                                        {selectedCliente.inmuebles_asociados_informador.map(inmueble => (
                                            <li key={inmueble.id}>
                                                {inmueble.direccion}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {selectedCliente.inmuebles_asociados_propietario.length > 0 && (
                                <>
                                    <p><strong>Propietario:</strong></p>
                                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                                        {selectedCliente.inmuebles_asociados_propietario.map(inmueble => (
                                            <li key={inmueble.id}>
                                                {inmueble.direccion}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {selectedCliente.inmuebles_asociados_copropietario.length > 0 && (
                                <>
                                    <p><strong>Co-propietario:</strong></p>
                                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                                        {selectedCliente.inmuebles_asociados_copropietario.map(inmueble => (
                                            <li key={inmueble.id}>
                                                {inmueble.direccion}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {selectedCliente.inmuebles_asociados_inquilino.length > 0 && (
                                <>
                                    <p><strong>Inquilino:</strong></p>
                                    <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                                        {selectedCliente.inmuebles_asociados_inquilino.map(inmueble => (
                                            <li key={inmueble.id}>
                                                {inmueble.direccion}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </Modal.Body>
                        <Modal.Footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <Button onClick={handleUpdateCliente} appearance="primary" style={{ backgroundColor: '#007d31', borderColor: '#00603c' }}>Actualizar</Button>
                            <Button onClick={handleClose} appearance="subtle">Cerrar</Button>
                        </Modal.Footer>
                    </Modal>
                )}
            </div>
        </GeneralLayout >
    );
}

