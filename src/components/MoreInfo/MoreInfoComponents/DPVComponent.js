import React, { useState, useEffect, use } from 'react';
import { Modal, Button, Form, Input, InputPicker, InputNumber, Toggle, DatePicker } from 'rsuite';
import { FaCheckCircle, FaTimesCircle, FaEdit } from 'react-icons/fa';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import axios from 'axios';
import { format, parse } from 'date-fns';

const DPVComponent = ({ isOpen, setDPVModalOpen, inmuebleId, DPVboolean, setDPVboolean, admin, onAddDeleteDPVRefreshKey, setOnAddDeleteDPVRefreshKey, passedDPVinfo, setpassedDPVinfo }) => {
    const [isDPV, setIsDPV] = useState(false);
    const [estadoDPV, setEstadoDPV] = useState('');
    const [nombreInmobiliaria, setNombreInmobiliaria] = useState('');
    const [linkInmobiliaria, setLinkInmobiliaria] = useState('');
    const [telefono, setTelefono] = useState('');
    const [evaluacionEstimada, setEvaluacionEstimada] = useState(0);
    const [editDPVMode, setEditDPVMode] = useState(false); // New state for edit mode
    const [DPVInfo, setDPVInfo] = useState(
        {
            estadoDPV: '',
            nombreInmobiliaria: '',
            linkInmobiliaria: '',
            telefono: '',
            valoracionEstimada: 0,
            inmuebleId: inmuebleId,
            precioActual: 0,
            fechaPublicacion: '',
            accionDPV: '',
            DPVboolean: false,
        }
    );

    const dpvStatusOptions = [
        { label: "Empezada", value: "Empezada" },
        { label: "Sin empezar", value: "Sin empezar" },
    ];

    const accionDPVOptions = [
        { label: "En acción", value: "En acción" },
        { label: "En nota simple", value: "En nota simple" },
        { label: "A espera", value: "A espera" },
        { label: "Visita", value: "Visita" },
    ];

    const showToast = (message, backgroundColor) => {
        Toastify({
            text: message,
            duration: 2500,
            gravity: 'top',
            position: 'center',
            stopOnFocus: true,
            style: {
                borderRadius: '10px',
                background: backgroundColor,
                textAlign: 'center',
            },
            onClick: function () { },
        }).showToast();
    };
    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/dpv/`, { params: { inmuebleId } });
            // Set fetched data to state variables
            if (response.data) {
                setDPVInfo(response.data);
                setDPVInfo(prevState => ({
                    ...prevState,
                    DPVboolean: true
                }));
            }
        } catch (error) {
            console.error('Error fetching DPV data:', error);
            showToast('Error al obtener los datos del DPV.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    useEffect(() => {
        if (DPVboolean) {
            // Fetch DPV data from the API
            fetchData();
        }
    }, []);

    useEffect(() => {
        console.log('DPVInfo', DPVInfo);
    }, [DPVInfo]);

    const uploadDPV = async () => {
        // Validate required fields using DPVInfo
        if (!DPVInfo.estadoDPV || !DPVInfo.nombreInmobiliaria || !DPVInfo.linkInmobiliaria || !DPVInfo.telefono || !DPVInfo.valoracionEstimada) {
            if (!DPVInfo.estadoDPV) showToast('Estado del DPV es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            if (!DPVInfo.nombreInmobiliaria) showToast('Nombre de la inmobiliaria es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            if (!DPVInfo.linkInmobiliaria) showToast('Link de la inmobiliaria es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            if (!DPVInfo.telefono) showToast('Teléfono es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            if (!DPVInfo.valoracionEstimada) showToast('Evaluación estimada es obligatoria.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }



        try {
            // Call API to upload DPV
            await axios.post('/api/uploadDpv', DPVInfo);
            // Show success toast
            showToast('DPV Registrado correctamente.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            setDPVboolean(true);
            setOnAddDeleteDPVRefreshKey(onAddDeleteDPVRefreshKey + 1);
            setDPVInfo({
                estadoDPV: '',
                nombreInmobiliaria: '',
                linkInmobiliaria: '',
                telefono: '',
                valoracionEstimada: 0,
                inmuebleId: inmuebleId,
                precioActual: 0,
                fechaPublicacion: '',
                accionDPV: '',
                DPVboolean: false,
            });
            fetchData();
        } catch (error) {
            console.error('Error uploading DPV:', error);
            showToast('Error al registrar el DPV.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    const updateDPV = async () => {
        // Validate required fields
        if (!DPVInfo.estadoDPV || !DPVInfo.nombreInmobiliaria || !DPVInfo.linkInmobiliaria || !DPVInfo.telefono || !DPVInfo.valoracionEstimada) {
            if (!DPVInfo.estadoDPV) showToast('Estado del DPV es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            if (!DPVInfo.nombreInmobiliaria) showToast('Nombre de la inmobiliaria es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            if (!DPVInfo.linkInmobiliaria) showToast('Link de la inmobiliaria es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            if (!DPVInfo.telefono) showToast('Teléfono es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            if (!DPVInfo.valoracionEstimada) showToast('Evaluación estimada es obligatoria.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }


        try {
            // Call API to update DPV
            await axios.put('/api/updateDPV', DPVInfo);
            // Show success toast
            showToast('DPV actualizado correctamente.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            setDPVInfo({
                estadoDPV: '',
                nombreInmobiliaria: '',
                linkInmobiliaria: '',
                telefono: '',
                valoracionEstimada: 0,
                inmuebleId: inmuebleId,
                precioActual: 0,
                fechaPublicacion: '',
                accionDPV: '',
                DPVboolean: false,
            });
            // Fetch updated data
            fetchData();
            setOnAddDeleteDPVRefreshKey(onAddDeleteDPVRefreshKey + 1);
            // Exit edit mode
            setEditDPVMode(false);
        } catch (error) {
            console.error('Error updating DPV:', error);
            showToast('Error al actualizar el DPV.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };
    const deleteDPV = async () => {
        try {
            await axios.delete('/api/deleteDPV', { data: { inmuebleId } });
            showToast('DPV eliminado correctamente.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            setDPVInfo({
                estadoDPV: '',
                nombreInmobiliaria: '',
                linkInmobiliaria: '',
                telefono: '',
                valoracionEstimada: 0,
                inmuebleId: inmuebleId,
                precioActual: 0,
                fechaPublicacion: '',
                accionDPV: '',
                DPVboolean: false,
            });
            setDPVModalOpen(false);
            setEditDPVMode(false);
            setOnAddDeleteDPVRefreshKey(onAddDeleteDPVRefreshKey + 1);
        } catch (error) {
            console.error('Error deleting DPV:', error);
            showToast('Error al eliminar el DPV.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    const handleTelefonoChange = (value) => {
        // Only allow numeric values for telefono
        setTelefono(value.replace(/\D/g, ''));
    };

    const validateTelefono = () => {
        // Check length of telefono
        if (telefono.length < 9) {
            showToast('El teléfono debe tener al menos 9 dígitos.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    const closeDPVModal = () => {
        if (!DPVboolean) {
            setDPVModalOpen(false);
            setEstadoDPV('');
            setTelefono('');
            setNombreInmobiliaria('');
            setLinkInmobiliaria('');
            setEvaluacionEstimada(0);
        } else {
            setDPVModalOpen(false);
            setEditDPVMode(false);
        }
    };

    const handleEditDPV = () => {
        setEditDPVMode(true);
    };
    return (
        <Modal open={isOpen} onClose={closeDPVModal} size="md" backdrop="static" style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0px 2px' }}>
            <Modal.Header>
                <Modal.Title className='text-center'>DPV</Modal.Title>

            </Modal.Header>
            <Modal.Body style={{ padding: '35px' }}>
                <div className='flex flex-col justify-center items-center gap-4'>
                    {!DPVboolean && (
                        <label>¿Este inmueble es un DPV?</label>
                    )}
                    <div className='flex flex-row justify-center items-center gap-4'>
                        {!DPVboolean && (
                            <Toggle
                                size="lg"
                                checked={DPVInfo.DPVboolean}
                                onChange={(value) => setDPVInfo(prev => ({ ...prev, DPVboolean: value }))}
                                checkedChildren={<FaCheckCircle />}
                                unCheckedChildren={<FaTimesCircle />}
                            />
                        )}
                        {DPVboolean && (
                            <Toggle
                                size="lg"
                                checked={true}
                                checkedChildren={<FaCheckCircle />}
                                unCheckedChildren={<FaTimesCircle />}
                            />
                        )}
                        {DPVboolean && admin && ( // Show edit icon if DPVboolean is true and admin is true
                            <FaEdit className="cursor-pointer text-blue-500 text-2xl justify-center items-end" onClick={() => setEditDPVMode(!editDPVMode)} />
                        )}
                    </div>
                </div>

                {DPVboolean && !editDPVMode && (
                    <div className="p-4 flex flex-col gap-4 items-center" style={{ width: '100%' }}>
                        <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                            <h3 className="text-lg font-medium text-gray-700">Estado del DPV:</h3>
                            <p className="text-gray-600">{DPVInfo.estadoDPV}</p>
                        </div>
                        <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                            <h3 className="text-lg font-medium text-gray-700">Nombre de la inmobiliaria:</h3>
                            <p className="text-gray-600">{DPVInfo.nombreInmobiliaria}</p>
                        </div>
                        <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                            <h3 className="text-lg font-medium text-gray-700">Link de la inmobiliaria:</h3>
                            <a href={DPVInfo.linkInmobiliaria} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{DPVInfo.linkInmobiliaria.length > 35 ? DPVInfo.linkInmobiliaria.substring(0, 35) + '...' : DPVInfo.linkInmobiliaria}</a>
                        </div>
                        <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                            <h3 className="text-lg font-medium text-gray-700">Teléfono:</h3>
                            <p className="text-gray-600">{DPVInfo.telefono}</p>
                        </div>
                        <div className='flex flex-row gap-6 justify-center items-stretch h-auto'>
                            <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center justify-center">
                                <h3 className="text-lg font-medium text-gray-700 text-center">Precio actual:</h3>
                                <p className="text-gray-600 text-center">{DPVInfo.precioActual} €</p>
                            </div>
                            <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center justify-center">
                                <h3 className="text-lg font-medium text-gray-700 text-center">Valoración estimada:</h3>
                                <p className="text-gray-600 text-center">{DPVInfo.valoracionEstimada} €</p>
                            </div>
                        </div>
                        <div className={`rounded-md p-3 flex flex-col gap-2 w-full items-center ${DPVInfo.precioActual - DPVInfo.valoracionEstimada < 20000 ? 'bg-red-300' : DPVInfo.precioActual - DPVInfo.valoracionEstimada <= 40000 ? 'bg-orange-300' : 'bg-gray-100'}`}>
                            <h3 className="text-lg font-medium text-gray-700">Distancia precio:</h3>
                            <p className="text-gray-600">{DPVInfo.precioActual - DPVInfo.valoracionEstimada} €</p>
                        </div>
                        <div className="bg-gray-100 rounded-md p-3 flex flex-col gap-2 w-full items-center">
                            <h3 className="text-lg font-medium text-gray-700">Fecha de publicación:</h3>
                            <p className="text-gray-600">{DPVInfo.fechaPublicacion ? format(parse(DPVInfo.fechaPublicacion, 'yyyy-MM-dd', new Date()), 'dd-MM-yyyy') : ''}</p>
                        </div>
                    </div>
                )}
                {/* Editable form for DPV information */}
                {DPVboolean && editDPVMode && (
                    <Form fluid style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
                        {/* DPV Status */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Form.ControlLabel>Estado del DPV</Form.ControlLabel>
                            <InputPicker
                                data={dpvStatusOptions}
                                style={{ width: '50%' }}
                                placeholder="Seleccione el estado del DPV"
                                value={DPVInfo.estadoDPV}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, estadoDPV: value }))}
                            />
                        </Form.Group>

                        {/* Nombre de la inmobiliaria */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Nombre de la inmobiliaria</Form.ControlLabel>
                            <Input
                                placeholder="Ingrese el nombre de la inmobiliaria"
                                value={DPVInfo.nombreInmobiliaria}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, nombreInmobiliaria: value }))}
                            />
                        </Form.Group>

                        {/* Link de la inmobiliaria */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Link de la inmobiliaria</Form.ControlLabel>
                            <Input
                                type="url"
                                placeholder="Ingrese el enlace de la inmobiliaria"
                                value={DPVInfo.linkInmobiliaria}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, linkInmobiliaria: value }))}
                            />
                        </Form.Group>

                        {/* Teléfono */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Teléfono de la inmobiliaria</Form.ControlLabel>
                            <Input
                                type="tel"
                                placeholder="Teléfono de la inmobiliaria"
                                value={DPVInfo.telefono}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, telefono: value }))}
                                onBlur={validateTelefono} // Trigger validation when input loses focus
                            />
                        </Form.Group>

                        {/* Acción DPV */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Acción del DPV</Form.ControlLabel>
                            <InputPicker
                                data={accionDPVOptions}
                                placeholder="Selecciona una acción"
                                value={DPVInfo.accionDPV}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, accionDPV: value }))}
                            />
                        </Form.Group>

                        {/* Evaluación estimada */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Valoracion estimada</Form.ControlLabel>
                            <InputNumber
                                value={DPVInfo.valoracionEstimada}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, valoracionEstimada: value }))}
                                max={600000}
                                min={0}
                            />
                        </Form.Group>
                        {/* PRECIO ACTUAL */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Precio actual</Form.ControlLabel>
                            <InputNumber
                                value={DPVInfo.precioActual}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, precioActual: value }))}
                                max={600000}
                                min={0}
                            />
                        </Form.Group>

                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Fecha de publicación</Form.ControlLabel>
                            <DatePicker
                                format="dd.MM.yyyy"  // Adjusted the format to match 'DD.MM.YYYY'
                                value={DPVInfo.fechaPublicacion ? new Date(DPVInfo.fechaPublicacion) : new Date()}
                                onChange={(value) => {
                                    const formattedDate = value ? format(value, 'yyyy-MM-dd') : ''; // Convert to ISO-like format or set to empty string if no value
                                    setDPVInfo(prevState => ({ ...prevState, fechaPublicacion: formattedDate }));
                                }}
                                oneTap
                                placement='auto'
                            />
                        </Form.Group>

                        {/* Update Button */}
                        <div style={{ width: '95%', display: 'flex', justifyContent: 'center' }}>
                            <Button onClick={updateDPV} appearance="primary">
                                Actualizar
                            </Button>
                            <Button onClick={deleteDPV} color="red" appearance="primary" style={{ marginLeft: '10px' }}>
                                Eliminar
                            </Button>
                        </div>
                    </Form>
                )}
                {/* Conditional form rendering */}
                {!DPVboolean && DPVInfo.DPVboolean && (
                    <Form fluid style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
                        {/* DPV Status */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Form.ControlLabel>Estado del DPV</Form.ControlLabel>
                            <InputPicker
                                data={dpvStatusOptions}
                                style={{ width: '50%' }}
                                placeholder="Seleccione el estado del DPV"
                                value={DPVInfo.estadoDPV}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, estadoDPV: value }))}
                            />
                        </Form.Group>

                        {/* Nombre de la inmobiliaria */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Nombre de la inmobiliaria</Form.ControlLabel>
                            <Input
                                placeholder="Ingrese el nombre de la inmobiliaria"
                                value={DPVInfo.nombreInmobiliaria}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, nombreInmobiliaria: value }))}
                            />
                        </Form.Group>

                        {/* Link de la inmobiliaria */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Link de la inmobiliaria</Form.ControlLabel>
                            <Input
                                type="url"
                                placeholder="Ingrese el enlace de la inmobiliaria"
                                value={DPVInfo.linkInmobiliaria}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, linkInmobiliaria: value }))}
                            />
                        </Form.Group>

                        {/* Teléfono */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Teléfono de la inmobiliaria</Form.ControlLabel>
                            <Input
                                type="tel"
                                placeholder="Teléfono de la inmobiliaria"
                                value={DPVInfo.telefono}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, telefono: value }))}
                                onBlur={validateTelefono} // Trigger validation when input loses focus
                            />
                        </Form.Group>
                        {/* Acción DPV */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Acción del DPV</Form.ControlLabel>
                            <InputPicker
                                data={accionDPVOptions}
                                placeholder="Selecciona una acción"
                                value={DPVInfo.accionDPV}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, accionDPV: value }))}
                            />
                        </Form.Group>

                        {/* Evaluación estimada */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Valoración estimada</Form.ControlLabel>
                            <InputNumber
                                value={DPVInfo.valoracionEstimada}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, valoracionEstimada: value }))}
                                max={600000}
                                min={0}
                            />
                        </Form.Group>

                        {/* PRECIO ACTUAL */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Precio actual</Form.ControlLabel>
                            <InputNumber
                                value={DPVInfo.precioActual}
                                onChange={(value) => setDPVInfo(prevState => ({ ...prevState, precioActual: value }))}
                                max={600000}
                                min={0}
                            />
                        </Form.Group>

                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Fecha de publicación</Form.ControlLabel>
                            <DatePicker
                                format="dd.MM.yyyy"  // Adjusted the format to match 'DD.MM.YYYY'
                                value={DPVInfo.fechaPublicacion ? new Date(DPVInfo.fechaPublicacion) : new Date()}
                                onChange={(value) => {
                                    const formattedDate = value ? format(value, 'yyyy-MM-dd') : ''; // Convert to ISO-like format or set to empty string if no value
                                    setDPVInfo(prevState => ({ ...prevState, fechaPublicacion: formattedDate }));
                                }}
                                oneTap
                                placement='auto'
                            />
                        </Form.Group>

                        {/* Registrar Button */}
                        <div style={{ width: '95%', display: 'flex', justifyContent: 'center' }}>
                            <Button onClick={uploadDPV} appearance="primary">
                                Registrar
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer className="flex flex-row justify-center gap-1">
                <Button onClick={closeDPVModal} appearance="subtle">
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DPVComponent;
