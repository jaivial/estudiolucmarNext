import React, { useState, useEffect, use } from 'react';
import { Modal, Toggle, SelectPicker, Input, Panel, Form, Button, TagPicker, Tag } from 'rsuite';
import 'rsuite/dist/rsuite.min.css'; // Import the rsuite CSS
import axios from 'axios';
import { AiOutlinePlus, AiOutlineDelete } from 'react-icons/ai';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import { dniValidator } from '../../../lib/mongodb/dniValidator/dniValidator.js';


const PhoneModal = ({ isOpen, setPhoneModalOpen, localizado, setLocalizado, inmuebleId, direccion, admin, nombreReturn, setNombreReturn, apellidoReturn, setApellidoReturn }) => {
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



    const fetchLocalizadoPhone = async (inmuebleId) => {
        try {
            const response = await axios.get('/api/fetchLocalizadoPhone', {
                params: {
                    inmuebleId: inmuebleId,
                },
            });
            if (response.status === 200) {
                setClientData(response.data.clientData);
                setNombreReturn(response.data.clientData.nombre);
                setApellidoReturn(response.data.clientData.apellido);
                // Handle the response data
            } else {
                showToast('Error al obtener el teléfono localizado.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            }
        } catch (error) {
            console.error('Error al obtener el teléfono localizado:', error);
            showToast('Error al obtener el teléfono localizado.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
        }
    };

    useEffect(() => {
        if (localizado) {
            fetchLocalizadoPhone(inmuebleId);
        }
    }, [inmuebleId]);

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

    useEffect(() => {
        if (isLocalizado) {
            fetchAsesores();
        } else {
            setAsesores([]);
            setSelectedAsesor(null);
        }
    }, [isLocalizado]);


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
                // ... additional actions after successful client creation ...
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
            } else {
                showToast('Error al eliminar el localizado.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            }
        } catch (error) {
            console.error('Error al eliminar el localizado:', error);
            showToast('Error al eliminar el localizado.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
        }
    };

    return (
        <Modal open={isOpen} onClose={handleClose} overflow={true} size="sm" backdrop="static" style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0px 2px' }}>
            <Modal.Header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', marginTop: '10px' }}>
                <Modal.Title style={{ fontSize: '1.3rem', textAlign: 'center' }}>Localizado</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '20px', fontSize: '1rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%', marginBottom: '2px' }}>
                {!localizadoModal && (
                    <Toggle
                        checked={isLocalizado}
                        onChange={handleToggleChange}
                        label="Localizado"
                    />
                )}
                {localizadoModal ? ( // Check if the modal state is true
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}>
                        <Toggle
                            checked={localizadoModal}
                            label="Localizado"
                        />
                        <p>Cliente: {clientData.nombre} {clientData.apellido}</p>
                        <p>Teléfono: <a href={`tel:${clientData.telefono}`} style={{ color: 'blue', textDecoration: 'underline' }}>{clientData.telefono}</a></p>
                        {clientData.tipo_de_cliente && (
                            <div className="flex flex-row gap-2 my-[10px]">
                                <p><strong>Tipo de Cliente:</strong></p>
                                <div>
                                    {clientData.tipo_de_cliente.map(tipo => (
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
                        )}
                        {clientData.tipo_de_cliente && ['informador', 'propietario', 'copropietario', 'inquilino'].map(tipo => (
                            clientData.tipo_de_cliente.includes(tipo) && (
                                <div key={tipo} style={{ width: '100%', marginBottom: '20px' }}>
                                    <div
                                        style={{
                                            backgroundColor: tipo === 'propietario' ? '#28a745' :
                                                tipo === 'copropietario' ? '#007bff' :
                                                    tipo === 'inquilino' ? '#fd7e14' :
                                                        '#17a2b8',
                                            borderRadius: '10px',
                                            padding: '5px',
                                            color: '#fff',
                                            textAlign: 'center',
                                            width: '150px',
                                            marginRight: 'auto',
                                            marginLeft: 'auto',
                                            marginBottom: '15px',
                                        }}
                                    >
                                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                    </div>
                                    <div className='flex flex-col gap-2 w-full justify-center items-center '>
                                        <div className='w-[70%] h-[1px] bg-gray-300'></div>
                                        {clientData[`inmuebles_asociados_${tipo}`].map((inmueble, index) => (
                                            <>
                                                <p className='text-center ' key={index}>
                                                    {inmueble.direccion}
                                                </p>
                                                <div className='w-[70%] h-[1px] bg-gray-300'></div>
                                            </>
                                        ))}
                                    </div>

                                </div>
                            )
                        ))}
                        {admin && ( // Show trash icon if admin is true and clientData exists
                            <p className='text-center' >
                                <AiOutlineDelete onClick={deleteLocalizado} className='cursor-pointer text-red-600 text-2xl' />
                            </p>
                        )}
                    </div>
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
                                        <button style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer' }} onClick={handleNewClientClick}>
                                            Cerrar
                                        </button>
                                    ) : (
                                        <button style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={handleNewClientClick}>
                                            <AiOutlinePlus size={18} /> Crear nuevo cliente
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                        {asesores.length === 0 && isLocalizado && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                <label>No hay clientes.</label>
                                {isCreatingNewClient ? (
                                    <button style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer' }} onClick={handleNewClientClick}>
                                        Cerrar
                                    </button>
                                ) : (
                                    <button style={{ backgroundColor: '#007bff', color: 'white', padding: '8px 16px', borderRadius: '5px', border: 'none', cursor: 'pointer' }} onClick={handleNewClientClick}>
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
                                        <Form.ControlLabel>Tipo de Cliente</Form.ControlLabel>
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
                                    <Button appearance="primary" onClick={handleCreateNewClient}>
                                        Guardar
                                    </Button>
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
