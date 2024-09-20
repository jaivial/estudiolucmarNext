import React, { useState, useEffect, use } from 'react';
import { Accordion, Tag, Button, SelectPicker, Modal, IconButton, Radio, RadioGroup, Toggle, Form, Grid, Checkbox, InputNumber } from 'rsuite';
import axios from 'axios';
import { Close } from '@rsuite/icons';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import { dniValidator } from '../../../lib/mongodb/dniValidator/dniValidator.js';

const ClientesAsociados = ({ inmuebleId, inmuebleDireccion }) => {
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

    useEffect(() => {
        const fetchClientesAsociados = async () => {
            try {
                const response = await axios.get('/api/fetchClientesAsociados', {
                    params: {
                        inmuebleId: inmuebleId,
                    },
                });
                setClientesAsociados(response.data.clientesTotales);
                setClientesAsociadosInmueble(response.data.clientesTarget);
            } catch (error) {
                console.error('Error fetching clientes asociados del inmueble:', error);
            }
        };

        fetchClientesAsociados();
    }, [inmuebleId]);


    const fetchClientes = async () => {
        try {
            const response = await axios.get('/api/fetch_clientes');
            console.log('response', response.data);
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
        try {
            const response = await axios.post('/api/asociar_cliente', {
                inmuebleId: inmuebleId,
                inmuebleDireccion: inmuebleDireccion,
                pedido: pedido,
                clientsToAssociate: clientsToAssociate,
                clientsToAssociateInformador: clientsToAssociateInformador,
                clientsToAssociateInteres: clientsToAssociateInteres,
                clientsToAssociateRangoPrecios: clientsToAssociateRangoPrecios,
                propietario: propietario,
                inquilino: inquilino,
            });
            console.log('response', response.data);
            if (response.data.status === 'success') {
                showToast('Clientes asociados correctamente.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                fetchClientes();
                setOpen(false);
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

    useEffect(() => {
        console.log('newCliente', newCliente);
    }, [newCliente]);

    useEffect(() => {
        console.log('newComprador', newComprador);
    }, [newComprador]);

    return (
        <Accordion defaultActiveKey={['0']} className='w-auto ml-[16px] mr-[16px] mt-[20px] border-1 border-gray-300 bg-gray-100 rounded-lg shadow-lg'>
            <Accordion.Panel header="Clientes Asociados" eventKey="0" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className='flex justify-center items-center w-full'>
                    <Button appearance='primary' className="bg-blue-400" onClick={handleOpenAsociar}>Asociar Clientes</Button>
                </div>
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
                                    }
                                }}
                                searchable={true}
                                multi={false}
                                style={{ width: '80%', margin: '0 auto' }}
                                placeholder="Selecciona un cliente"
                            />
                        )}
                        {clientsToAssociate.client_id && (
                            <>
                                <div>
                                    <Checkbox checked={inquilino} onChange={(checked) => setInquilino(checked)}>Inquilino</Checkbox>
                                    <Checkbox checked={propietario} onChange={(checked) => setPropietario(checked)}>Propietario</Checkbox>
                                </div>
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
                                        <Form.ControlLabel>Tipo de Cliente</Form.ControlLabel>
                                        <SelectPicker
                                            data={[
                                                { label: 'Propietario', value: 'propietario' },
                                                { label: 'Inquilino', value: 'inquilino' },
                                            ]}
                                            onChange={value => {
                                                setNewCliente(prevState => {
                                                    if (value) {
                                                        const isPropietario = value.includes('propietario');
                                                        const isInquilino = value.includes('inquilino');

                                                        const inmueblesAsociadosPropietario = isPropietario
                                                            ? [...prevState.inmuebles_asociados_propietario, { id: inmuebleId, direccion: inmuebleDireccion }]
                                                            : prevState.inmuebles_asociados_propietario.filter(inmueble => inmueble.id !== inmuebleId);

                                                        const inmueblesAsociadosInquilino = isInquilino
                                                            ? [...prevState.inmuebles_asociados_inquilino, { id: inmuebleId, direccion: inmuebleDireccion }]
                                                            : prevState.inmuebles_asociados_inquilino.filter(inmueble => inmueble.id !== inmuebleId);

                                                        return {
                                                            ...prevState,
                                                            tipo_de_cliente: value,
                                                            inmuebles_asociados_propietario: inmueblesAsociadosPropietario,
                                                            inmuebles_asociados_inquilino: inmueblesAsociadosInquilino
                                                        };
                                                    } else {
                                                        return {
                                                            ...prevState,
                                                            tipo_de_cliente: '',
                                                            inmuebles_asociados_propietario: [],
                                                            inmuebles_asociados_inquilino: []
                                                        };
                                                    }
                                                });
                                            }}
                                            searchable={false}
                                            multiple
                                            block
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
                {
                    clientesAsociadosInmueble.length > 0 ? (
                        <ul>
                            {clientesAsociadosInmueble.map((cliente) => (
                                <li key={cliente._id} className="flex flex-row justify-between items-center gap-2">
                                    <div className="flex flex-row justify-start items-center gap-2">
                                        <p className="text-lg font-semibold">{cliente.nombre} {cliente.apellido}</p>
                                        {/* <div>
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
                                    </div> */}
                                    </div>
                                    <IconButton icon={<Close />} onClick={() => handleRemoveCliente(cliente._id)} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No hay clientes asociados a este inmueble.</p>
                    )
                }
            </Accordion.Panel >
        </Accordion >
    );
};

export default ClientesAsociados;
