import React, { useState } from 'react';
import { Modal, Button, Form, Input, InputPicker, InputNumber, Toggle } from 'rsuite';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import axios from 'axios';

const DPVComponent = ({ isOpen, setDPVModalOpen }) => {
    const [isDPV, setIsDPV] = useState(false);
    const [estadoDPV, setEstadoDPV] = useState('');
    const [nombreInmobiliaria, setNombreInmobiliaria] = useState('');
    const [linkInmobiliaria, setLinkInmobiliaria] = useState('');
    const [telefono, setTelefono] = useState('');
    const [evaluacionEstimada, setEvaluacionEstimada] = useState(0);

    const dpvStatusOptions = [
        { label: "Empezada", value: "Empezada" },
        { label: "Sin empezar", value: "Sin empezar" },
        { label: "En acción", value: "En acción" },
        { label: "En nota simple", value: "En nota simple" },
        { label: "A espera", value: "A espera" },
        { label: "Visita", value: "Visita" },
        { label: "Ocupado", value: "Ocupado" },
        { label: "Vacío", value: "Vacío" },
        { label: "Información de propietario", value: "Información de propietario" }
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

    const uploadDPV = async () => {
        // Validate required fields
        if (!estadoDPV || !nombreInmobiliaria || !linkInmobiliaria || !telefono || !evaluacionEstimada) {
            if (!estadoDPV) showToast('Estado del DPV es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            if (!nombreInmobiliaria) showToast('Nombre de la inmobiliaria es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            if (!linkInmobiliaria) showToast('Link de la inmobiliaria es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            if (!telefono) showToast('Teléfono es obligatorio.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            if (!evaluacionEstimada) showToast('Evaluación estimada es obligatoria.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }

        // Prepare data
        const data = {
            estadoDPV,
            telefono: parseInt(telefono, 10),
            nombreInmobiliaria,
            linkInmobiliaria,
            evaluacionEstimada: parseInt(evaluacionEstimada, 10),
        };

        try {
            // Call API to upload DPV
            await axios.post('/api/uploadDpv', data);
            // Show success toast
            showToast('DPV Registrado correctamente.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            setEstadoDPV('');
            setTelefono('');
            setNombreInmobiliaria('');
            setLinkInmobiliaria('');
            setEvaluacionEstimada(0);
            onClose(); // Close the modal on success
        } catch (error) {
            console.error('Error uploading DPV:', error);
            showToast('Error al registrar el DPV.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
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
        setDPVModalOpen(false);
        setEstadoDPV('');
        setTelefono('');
        setNombreInmobiliaria('');
        setLinkInmobiliaria('');
        setEvaluacionEstimada(0);
    };

    return (
        <Modal open={isOpen} onClose={closeDPVModal} size="md" backdrop="static" style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0px 2px' }}>
            <Modal.Header>
                <Modal.Title className='text-center'>DPV</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '35px' }}>
                <div className='flex flex-col justify-center items-center gap-4'>
                    <label>¿Este inmueble es un DPV?</label>
                    <Toggle
                        size="lg"
                        checked={isDPV}
                        onChange={(value) => setIsDPV(value)}
                        checkedChildren={<FaCheckCircle />}
                        unCheckedChildren={<FaTimesCircle />}
                    />
                </div>

                {/* Conditional form rendering */}
                {isDPV && (
                    <Form fluid style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
                        {/* DPV Status */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Form.ControlLabel>Estado del DPV</Form.ControlLabel>
                            <InputPicker
                                data={dpvStatusOptions}
                                style={{ width: '50%' }}
                                placeholder="Seleccione el estado del DPV"
                                value={estadoDPV}
                                onChange={(value) => setEstadoDPV(value)}
                            />
                        </Form.Group>

                        {/* Nombre de la inmobiliaria */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Nombre de la inmobiliaria</Form.ControlLabel>
                            <Input
                                placeholder="Ingrese el nombre de la inmobiliaria"
                                value={nombreInmobiliaria}
                                onChange={(value) => setNombreInmobiliaria(value)}
                            />
                        </Form.Group>

                        {/* Link de la inmobiliaria */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Link de la inmobiliaria</Form.ControlLabel>
                            <Input
                                type="url"
                                placeholder="Ingrese el enlace de la inmobiliaria"
                                value={linkInmobiliaria}
                                onChange={(value) => setLinkInmobiliaria(value)}
                            />
                        </Form.Group>

                        {/* Teléfono */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Teléfono</Form.ControlLabel>
                            <Input
                                type="tel"
                                placeholder="Ingrese el número de teléfono"
                                value={telefono}
                                onChange={handleTelefonoChange}
                                onBlur={validateTelefono} // Trigger validation when input loses focus
                            />
                        </Form.Group>

                        {/* Evaluación estimada */}
                        <Form.Group style={{ width: '95%', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                            <Form.ControlLabel>Evaluación estimada</Form.ControlLabel>
                            <InputNumber
                                value={evaluacionEstimada}
                                onChange={(value) => setEvaluacionEstimada(value)}
                                max={600000}
                                min={0}
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
