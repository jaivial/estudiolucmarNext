import React, { useState, useEffect, use } from 'react';
import { Modal, Toggle, SelectPicker, Input, Panel, Form, Button, TagPicker, Tag } from 'rsuite';
import 'rsuite/dist/rsuite.min.css'; // Import the rsuite CSS
import axios from 'axios';
import { AiOutlinePlus, AiOutlineDelete } from 'react-icons/ai';
import { Icon } from '@iconify/react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import { dniValidator } from '../../../lib/mongodb/dniValidator/dniValidator.js';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


const PhoneModal = ({ isOpen, setPhoneModalOpen, localizado, setLocalizado, inmuebleId, direccion, admin, nombreReturn, setNombreReturn, apellidoReturn, setApellidoReturn, inmuebles_asociados_inquilino, inmuebles_asociados_propietario, setInmueblesAsociadosInquilino, setInmueblesAsociadosPropietario, inmuebles_asociados_informador, setInmueblesAsociadosInformador, localizadoRefreshKey, setLocalizadoRefreshKey }) => {
    const [isLocalizado, setIsLocalizado] = useState(localizado);
    const [asesores, setAsesores] = useState([]);
    const [selectedAsesor, setSelectedAsesor] = useState(null);
    const [showNewClientForm, setShowNewClientForm] = useState(false); // State for the accordion
    const [isCreatingNewClient, setIsCreatingNewClient] = useState(false); // State for the button
    const [tipoDeCliente, setTipoDeCliente] = useState([]); // Changed to an array
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [dni, setDni] = useState('');
    const [localizadoModal, setLocalizadoModal] = useState(localizado); // New state for the modal
    const [clientData, setClientData] = useState([]);
    const [loadingLocalizado, setLoadingLocalizado] = useState(false);



    const fetchLocalizadoPhone = async (inmuebleId) => {
        try {
            const response = await axios.get('/api/fetchLocalizadoPhone', {
                params: {
                    inmuebleId: inmuebleId,
                },
            });
            console.log('response', response.data);
            setClientData(response.data.clientData);
            setNombreReturn(response.data.clientData.nombre);
            setApellidoReturn(response.data.clientData.apellido);
            let inmueblesAsociadosInquilinoToAdd = response.data.clientData.inmuebles_asociados_inquilino;
            let inmueblesAsociadosPropietarioToAdd = response.data.clientData.inmuebles_asociados_propietario;
            let inmueblesAsociadosInformadorToAdd = [];
            if (response.data.clientData.inmuebles_asociados_informador) {
                inmueblesAsociadosInformadorToAdd = response.data.clientData.inmuebles_asociados_informador;
            }
            if (inmueblesAsociadosInformadorToAdd) {
                setInmueblesAsociadosInformador(inmueblesAsociadosInformadorToAdd);
            }
            if (inmueblesAsociadosInquilinoToAdd) {
                setInmueblesAsociadosInquilino(inmueblesAsociadosInquilinoToAdd);
            }
            if (inmueblesAsociadosPropietarioToAdd) {
                setInmueblesAsociadosPropietario(inmueblesAsociadosPropietarioToAdd);
            }

        } catch (error) {
            console.error('Error al obtener el teléfono localizado:', error);
            showToast('Error al obtener el teléfono localizado.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
        }
    };

    useEffect(() => {
        console.log('localizado', localizado);
        console.log('inmuebleId', inmuebleId);
        if (localizado) {
            fetchLocalizadoPhone(inmuebleId);
        }
    }, [inmuebleId]);

    useEffect(() => {
        fetchLocalizadoPhone(inmuebleId);
    }, [localizadoRefreshKey]);

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


    const handleClose = () => {
        setNombre('');
        setApellido('');
        setTelefono('');
        setDni('');
        setTipoDeCliente([]);
        setSelectedAsesor(null);
        setIsCreatingNewClient(false);
        setPhoneModalOpen(false);
    };

    const handleToggleChange = (value) => {
        setIsLocalizado(value);
        setIsCreatingNewClient(false);
    };
    const fetchAsesores = async () => {
        try {
            const response = await axios.get('/api/fetch_clientes_localizado'); // Replace with your actual API endpoint
            console.log('response', response.data);
            setAsesores(response.data.clientes); // Assuming the API response has an 'asesores' array
        } catch (error) {
            console.error('Error fetching asesores:', error);
        }
    };

    useEffect(() => { // Fetch asesores when isLocalizado changes
        fetchAsesores();
    }, []);



    const handleNewClientClick = () => {
        setIsCreatingNewClient(!isCreatingNewClient);
    };


    const handleCreateNewClient = async () => {
        if (!nombre) {
            showToast('Nombre es obligatorio', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        if (!apellido) {
            showToast('Apellido es obligatorio', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        if (!telefono) {
            showToast('Teléfono es obligatorio', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        if (telefono.length < 9 || telefono.length > 9) {
            showToast('El teléfono debe tener 9 dígitos', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        if (!/^\d+$/.test(telefono)) {
            showToast('El teléfono debe contener solo números', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        if (tipoDeCliente.length === 0) {
            showToast('Tipo de Cliente es obligatorio', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        if (dni && !dniValidator(dni)) {
            showToast('El DNI no es válido', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }


        try {
            const response = await axios.post('/api/createClientLocalizado', {
                nombre,
                apellido,
                telefono,
                dni,
                tipoDeCliente,
                inmuebleId,
                direccion
            });

            if (response.status === 201) {
                showToast('Cliente creado.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                fetchAsesores();
                handleClose();
                // Additional actions after successful client creation
            } else {
                showToast('Error al crear el cliente.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            }
        } catch (error) {
            console.error('Error al crear cliente:', error);
            showToast('Error al crear el cliente.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
        }
    };



    const handleAddLocalizado = async () => {
        setLoadingLocalizado(true);
        try {
            const response = await axios.post('/api/addLocalizadoPhone', {
                inmuebleId,
                telefono: selectedAsesor.telefono,
                client_id: selectedAsesor.client_id
            });


            if (response.status === 200) {
                showToast('Localizado correctamente.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                fetchLocalizadoPhone(inmuebleId);
                setLocalizado(true);
                setLocalizadoModal(true); // Set the modal state to true
                setLoadingLocalizado(false);
            }
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            showToast('Error al agregar el cliente.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
        }
    };

    const deleteLocalizado = async () => {
        try {
            const response = await axios.delete('/api/deleteLocalizado', {
                params: {
                    inmuebleId: inmuebleId,
                },
            });
            if (response.status === 200) {
                showToast('Localizado eliminado correctamente.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                setLocalizado(false);
                setLocalizadoModal(false);
                setSelectedAsesor(null);
                setIsLocalizado(false);
            } else {
                showToast('Error al eliminar el localizado.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            }
        } catch (error) {
            console.error('Error al eliminar el localizado:', error);
            showToast('Error al eliminar el localizado.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
        }
    };

    return (
        <Modal open={isOpen} onClose={handleClose} overflow={true} size="sm" backdrop style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0px 2px' }}>
            <Modal.Header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', marginTop: '10px' }}>
                <Modal.Title style={{ fontSize: '1.3rem', textAlign: 'center' }}>Localizado</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '20px', fontSize: '1rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%', marginBottom: '2px' }}>
                {!localizadoModal && (
                    <>
                        <p>¿Está localizado?</p>
                        <Toggle
                            checked={isLocalizado}
                            onChange={handleToggleChange}
                            checkedChildren="Sí"
                            unCheckedChildren="No"
                        />
                    </>
                )}
                {localizadoModal ? ( // Check if the modal state is true
                    <>
                        {loadingLocalizado ? (
                            <Skeleton count={3} height={50} width={300} />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
                                <Toggle
                                    checked={localizadoModal}
                                    label="Localizado"
                                    checkedChildren="Sí"
                                    unCheckedChildren="No"
                                    style={{ marginBottom: '10px' }}
                                />
                                <div class="w-full max-w-4xl bg-gradient-to-l from-slate-300 to-slate-100 text-slate-600 border border-slate-300 grid grid-cols-3 p-6 gap-x-4 gap-y-4 rounded-lg shadow-md">
                                    <div class="col-span-3 text-lg font-bold capitalize">
                                        Información del localizado
                                    </div>
                                    <div class="col-span-3">
                                        {clientData.nombre && (
                                            <div className='gap-4 flex flex-col justify-center'>
                                                <p>Cliente: {clientData.nombre} {clientData.apellido}</p>
                                                <div class="flex flex-row gap-2 items-center">
                                                    <p>Teléfono: <a href={`tel:${clientData.telefono}`}>{clientData.telefono}</a></p>
                                                    <a href={`tel:${clientData.localizado_phone}`} class="rounded-md bg-slate-300 duration-300 p-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path fill="currentColor" fill-opacity="0" stroke-dasharray="64" stroke-dashoffset="64" d="M8 3c0.5 0 2.5 4.5 2.5 5c0 1 -1.5 2 -2 3c-0.5 1 0.5 2 1.5 3c0.39 0.39 2 2 3 1.5c1 -0.5 2 -2 3 -2c0.5 0 5 2 5 2.5c0 2 -1.5 3.5 -3 4c-1.5 0.5 -2.5 0.5 -4.5 0c-2 -0.5 -3.5 -1 -6 -3.5c-2.5 -2.5 -3 -4 -3.5 -6c-0.5 -2 -0.5 -3 0 -4.5c0.5 -1.5 2 -3 4 -3Z"><animate fill="freeze" attributeName="fill-opacity" begin="0.6s" dur="0.15s" values="0;0.3" /><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0" /><animateTransform id="lineMdPhoneCallTwotoneLoop0" fill="freeze" attributeName="transform" begin="0.6s;lineMdPhoneCallTwotoneLoop0.begin+2.7s" dur="0.5s" type="rotate" values="0 12 12;15 12 12;0 12 12;-12 12 12;0 12 12;12 12 12;0 12 12;-15 12 12;0 12 12" /></path><path stroke-dasharray="4" stroke-dashoffset="4" d="M15.76 8.28c-0.5 -0.51 -1.1 -0.93 -1.76 -1.24M15.76 8.28c0.49 0.49 0.9 1.08 1.2 1.72"><animate fill="freeze" attributeName="stroke-dashoffset" begin="lineMdPhoneCallTwotoneLoop0.begin+0s" dur="2.7s" keyTimes="0;0.111;0.259;0.37;1" values="4;0;0;4;4" /></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M18.67 5.35c-1 -1 -2.26 -1.73 -3.67 -2.1M18.67 5.35c0.99 1 1.72 2.25 2.08 3.65"><animate fill="freeze" attributeName="stroke-dashoffset" begin="lineMdPhoneCallTwotoneLoop0.begin+0.2s" dur="2.7s" keyTimes="0;0.074;0.185;0.333;0.444;1" values="6;6;0;0;6;6" /></path></g></svg>
                                                    </a>
                                                </div>

                                                {((inmuebles_asociados_inquilino && inmuebles_asociados_inquilino.some(inmueble => inmueble.id === inmuebleId)) || (inmuebles_asociados_propietario && inmuebles_asociados_propietario.some(inmueble => inmueble.id === inmuebleId)) || (inmuebles_asociados_informador && inmuebles_asociados_informador.some(inmueble => inmueble.id === inmuebleId))) ? (
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <p>Tipo de Cliente:</p>
                                                        <div>
                                                            {inmuebles_asociados_inquilino && inmuebles_asociados_inquilino.some(inmueble => inmueble.id === inmuebleId) && (
                                                                <Tag
                                                                    color="orange"
                                                                    style={{ marginBottom: '5px', marginRight: '5px' }}
                                                                >
                                                                    Inquilino
                                                                </Tag>
                                                            )}
                                                            {inmuebles_asociados_propietario && inmuebles_asociados_propietario.some(inmueble => inmueble.id === inmuebleId) && (
                                                                <Tag
                                                                    color="green"
                                                                    style={{ marginBottom: '5px', marginRight: '5px' }}
                                                                >
                                                                    Propietario
                                                                </Tag>
                                                            )}
                                                            {inmuebles_asociados_informador?.some(inmueble => inmueble.id === inmuebleId) && (
                                                                <Tag
                                                                    style={{ marginBottom: '0px', marginRight: '5px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '2px solid #60a5fa', color: '#2563eb' }}
                                                                >
                                                                    Informador
                                                                </Tag>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-row gap-2">
                                                        <p>Tipo de Cliente:  Sin Asignar</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>


                                {admin && ( // Show trash icon if admin is true and clientData exists
                                    <p className='text-center' >
                                        <AiOutlineDelete onClick={deleteLocalizado} className='cursor-pointer text-red-600 text-2xl' />
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {asesores.length > 0 && isLocalizado && (
                            <>
                                <SelectPicker
                                    data={asesores.map((asesor) => ({ label: `${asesor.nombre} ${asesor.apellido}`, value: asesor }))}
                                    onChange={(value) => setSelectedAsesor(value)}
                                    placeholder="Selecciona un cliente"
                                    className='w-[80%]'
                                />
                                {selectedAsesor && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: 'column', width: '80%' }}>
                                        <Input readOnly value={selectedAsesor.telefono}
                                            style={{ width: '100%' }}
                                        />
                                        <Button appearance="primary" onClick={handleAddLocalizado}>
                                            Registrar
                                        </Button>
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                                    <label>¿No encuentras el cliente?</label>
                                    {isCreatingNewClient ? (
                                        <h2 className='text-center font-base text-lg text-gray-700'>Crear nuevo cliente</h2>
                                    ) : (
                                        <button style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={handleNewClientClick}>
                                            <AiOutlinePlus size={18} /> Crear nuevo cliente
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                        {asesores.length === 0 && isLocalizado && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                                <label>No hay clientes.</label>
                                {isCreatingNewClient ? (
                                    <h2 className='text-center font-base text-lg text-gray-700'>Crear nuevo cliente</h2>

                                ) : (
                                    <button style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={handleNewClientClick}>
                                        <AiOutlinePlus size={18} /> Crear nuevo cliente
                                    </button>
                                )}
                            </div>
                        )}
                        {isCreatingNewClient && (
                            <div style={{ width: '80%' }}>
                                <Form fluid>
                                    <Form.Group>
                                        <Form.ControlLabel>Nombre</Form.ControlLabel>
                                        <Form.Control name="nombre" type="text" value={nombre} onChange={(value) => setNombre(value)} />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel>Apellido</Form.ControlLabel>
                                        <Form.Control name="apellido" type="text" value={apellido} onChange={(value) => setApellido(value)} />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel>Teléfono</Form.ControlLabel>
                                        <Form.Control name="telefono" type="text" value={telefono} onChange={(value) => setTelefono(value)} />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel>DNI</Form.ControlLabel>
                                        <Form.Control name="dni" type="text" value={dni} onChange={(value) => setDni(value)} />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel>Asociación del cliente con el inmueble</Form.ControlLabel>
                                        <TagPicker
                                            data={[
                                                { label: 'Informador', value: 'informador' },
                                                { label: 'Propietario', value: 'propietario' },
                                                { label: 'Co-propietario', value: 'copropietario' },
                                                { label: 'Inquilino', value: 'inquilino' },
                                            ]}
                                            onChange={(value) => setTipoDeCliente(value)}
                                            placement="autoVerticalStart"
                                            placeholder="Selecciona el tipo de cliente"
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Group>
                                    <div className='flex justify-center gap-4 mt-4'>
                                        <Button appearance="primary" onClick={handleCreateNewClient}>
                                            Guardar
                                        </Button>
                                        <Button appearance="subtle" onClick={handleNewClientClick}>
                                            Cancelar
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        )}
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default PhoneModal;
