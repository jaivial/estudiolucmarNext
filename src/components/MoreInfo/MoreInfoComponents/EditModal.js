import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, SelectPicker, InputPicker, Panel, Grid, Row, Col } from 'rsuite';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapPin } from 'react-icons/fa';
import L from 'leaflet';
import axios from 'axios';

const icon = L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
});

const EditModal = ({ isModalOpen, closeModal, data, onAddEdtMoreInfoRefreshKey, setOnAddEdtMoreInfoRefreshKey }) => {
    const inmueble = data.inmueble;
    const [formData, setFormData] = useState({
        id: inmueble.id,
        direccion: inmueble.direccion,
        tipo: inmueble.tipo ? inmueble.tipo : '',
        uso: inmueble.uso ? inmueble.uso : '',
        superficie: inmueble.superficie ? inmueble.superficie : '',
        ano_construccion: inmueble.ano_construccion ? inmueble.ano_construccion : '',
        categoria: inmueble.categoria ? inmueble.categoria : '',
        coordinates: inmueble.coordinates,
        location: inmueble.location ? inmueble.location : '',
        habitaciones: inmueble.habitaciones !== null ? inmueble.habitaciones : '',
        banyos: inmueble.banyos !== null ? inmueble.banyos : '',
        garaje: inmueble.garaje || false, // Ensure boolean values
        ascensor: inmueble.ascensor || false,
        trastero: inmueble.trastero || false,
        jardin: inmueble.jardin || false,
        terraza: inmueble.terraza || false,
        aireAcondicionado: inmueble.aireacondicionado || false,
    });

    const [mapPosition, setMapPosition] = useState([39.3968, -0.4189]); // Coordinates for Catarroja, Valencia, Spain
    const [showMap, setShowMap] = useState(false);
    const [markerPosition, setMarkerPosition] = useState(null);

    // Handle map click
    const MapClickHandler = () => {
        useMapEvents({
            click(event) {
                if (markerPosition && markerPosition.lat === event.latlng.lat && markerPosition.lng === event.latlng.lng) {
                    // Remove marker if clicked on the same position
                    setMarkerPosition(null);
                    setFormData((prevData) => ({
                        ...prevData,
                        coordinates: '',
                    }));
                } else {
                    // Set a new marker position
                    setMarkerPosition(event.latlng);
                    setMapPosition([event.latlng.lat, event.latlng.lng]);
                    setFormData((prevData) => ({
                        ...prevData,
                        coordinates: `${event.latlng.lat}, ${event.latlng.lng}`,
                    }));
                }
            },
        });
        return null;
    };

    useEffect(() => {
        console.log('formData', formData);
    }, [formData]);

    // Toggle map visibility
    const toggleMap = () => setShowMap(!showMap);

    const handleChange = (value, name) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle checkbox change
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: checked,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            const response = await axios.put('/api/updateInmuebleInfo', {
                inmuebleID: formData.id, // Assuming formData contains the inmuebleID
                direccion: formData.direccion,
                tipo: formData.tipo,
                uso: formData.uso,
                superficie: formData.superficie,
                ano_construccion: formData.ano_construccion,
                categoria: formData.categoria,
                coordinates: formData.coordinates,
                location: formData.location,
                habitaciones: formData.habitaciones,
                banyos: formData.banyos,
                garaje: formData.garaje,
                ascensor: formData.ascensor,
                trastero: formData.trastero,
                jardin: formData.jardin,
                terraza: formData.terraza,
                aireacondicionado: formData.aireAcondicionado,
            });

            setOnAddEdtMoreInfoRefreshKey(onAddEdtMoreInfoRefreshKey + 1);
            closeModal(); // Close the modal after submitting
        } catch (error) {
            console.error('Error updating inmueble:', error.response ? error.response.data : error.message);
        }
    };

    // Generate options for InputPicker
    const generateOptions = (start, end) => {
        return Array.from({ length: end - start + 1 }, (_, i) => ({
            label: (start + i).toString(),
            value: start + i
        }));
    };


    return (
        <>
            <Modal open={isModalOpen} onClose={closeModal} size="md" overflow={false} backdrop="static" style={{ backgroundColor: 'rgba(0,0,0,0.15)', marginBottom: '70px' }}>
                <Modal.Header>
                    <Modal.Title className='text-center' style={{ fontSize: '1.4rem', marginTop: '10px', fontFamily: 'sans-serif' }}>Editar Inmueble</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '30px' }}>
                    <Form fluid>
                        <Form.Group>
                            <Form.ControlLabel>Dirección</Form.ControlLabel>
                            <Form.Control name="direccion" value={formData.direccion} onChange={(value) => handleChange(value, 'direccion')} />
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Categoría</Form.ControlLabel>
                            <SelectPicker
                                data={[
                                    { label: 'Vacio', value: 'Vacio' },
                                    { label: 'Inquilino', value: 'Inquilino' },
                                    { label: 'Propietario', value: 'Propietario' }
                                ]}
                                value={['Vacio', 'Inquilino', 'Propietario'].includes(formData.categoria) ? formData.categoria : 'Vacio'}
                                onChange={(value) => handleChange(value, 'categoria')}
                                block
                                searchable={false}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Uso</Form.ControlLabel>
                            <SelectPicker
                                data={[
                                    { label: 'Residencial', value: 'Residencial' },
                                    { label: 'Almacén-Estacionamiento', value: 'Almacén-Estacionamiento' },
                                    { label: 'Industrial', value: 'Industrial' },
                                    { label: 'Comercial', value: 'Comercial' },
                                    { label: 'Oficinas', value: 'Oficinas' },
                                    { label: 'Cultural', value: 'Cultural' },
                                    { label: 'Sanidad y Beneficencia', value: 'Sanidad y Beneficencia' },
                                    { label: 'Deportivo', value: 'Deportivo' },
                                    { label: 'Ocio y hostelería', value: 'Ocio y hostelería' },
                                    { label: 'Almacén', value: 'Almacén' },
                                    { label: 'Almacén-Estacionamiento-Industrial', value: 'Almacén-Estacionamiento-Industrial' },
                                    { label: 'Edificio Singular', value: 'Edificio Singular' },
                                    { label: 'Suelo sin edif.', value: 'Suelo sin edif.' },
                                    { label: 'NULL', value: 'NULL' },
                                    { label: 'Religioso', value: 'Religioso' },
                                    { label: 'Espectáculos', value: 'Espectáculos' }
                                ]}
                                value={formData.uso}
                                onChange={(value) => handleChange(value, 'uso')}
                                block
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Tipo</Form.ControlLabel>
                            <SelectPicker
                                data={[
                                    { label: 'Urbano', value: 'Urbano' },
                                    { label: 'Rural', value: 'Rural' },
                                    { label: 'Sin Especificar', value: 'NULL' }
                                ]}
                                value={formData.tipo}
                                onChange={(value) => handleChange(value, 'tipo')}
                                block
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Superficie (m²)</Form.ControlLabel>
                            <InputPicker
                                data={generateOptions(0, 2000)}
                                value={formData.superficie}
                                onChange={(value) => handleChange(value, 'superficie')}
                                block
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.ControlLabel>Año de Construcción</Form.ControlLabel>
                            <InputPicker
                                data={generateOptions(1800, new Date().getFullYear())}
                                value={generateOptions(1800, new Date().getFullYear()).find(option => option.value === formData.ano_construccion) ? formData.ano_construccion : ''}
                                onChange={(value) => handleChange(value, 'ano_construccion')}
                                block
                            />
                        </Form.Group>


                        <Form.Group>
                            <Form.ControlLabel>
                                Ubicación
                                <Button appearance="link" onClick={toggleMap} className="ml-2">
                                    <FaMapPin /> Seleccionar en el mapa
                                </Button>
                            </Form.ControlLabel>
                            <Form.Control name="coordinates" value={formData.coordinates} readOnly />
                        </Form.Group>
                        {showMap && (
                            <div style={{ height: '400px', marginBottom: '20px' }}>
                                <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                                    <MapClickHandler />
                                    {markerPosition && (
                                        <Marker position={markerPosition} icon={icon} onDragend={(event) => setMarkerPosition(event.latlng)}>
                                            <Popup>Ubicación seleccionada</Popup>
                                        </Marker>
                                    )}
                                </MapContainer>
                            </div>
                        )}
                        <Panel header="Más Opciones" collapsible defaultExpanded={true}>
                            <Form.Group>
                                <Form.ControlLabel>Localidad</Form.ControlLabel>
                                <SelectPicker
                                    data={[
                                        { label: 'Catarroja', value: 'Catarroja' }
                                    ]}
                                    value={formData.location}
                                    onChange={(value) => handleChange(value, 'location')}
                                    block
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Baños</Form.ControlLabel>
                                <SelectPicker
                                    data={Array.from({ length: 11 }, (_, i) => ({ label: i.toString(), value: i }))}
                                    value={formData.banyos}
                                    onChange={(value) => handleChange(value, 'banyos')}
                                    block
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Habitaciones</Form.ControlLabel>
                                <SelectPicker
                                    data={Array.from({ length: 16 }, (_, i) => ({ label: i.toString(), value: i }))}
                                    value={formData.habitaciones}
                                    onChange={(value) => handleChange(value, 'habitaciones')}
                                    block
                                />
                            </Form.Group>
                            <Grid gap={4}>
                                <Row>
                                    <Col xs={12} md={6}>
                                        <Form.Group className='flex flex-row-reverse gap-2 items-center justify-end mb-3'>
                                            <Form.ControlLabel style={{ marginBottom: '0px' }}>Garaje</Form.ControlLabel>
                                            <input
                                                type="checkbox"
                                                name="garaje"
                                                checked={formData.garaje}
                                                onChange={handleCheckboxChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <Form.Group className='flex flex-row-reverse gap-2 items-center justify-end mb-3'>
                                            <Form.ControlLabel style={{ marginBottom: '0px' }}>Ascensor</Form.ControlLabel>
                                            <input
                                                type="checkbox"
                                                name="ascensor"
                                                checked={formData.ascensor}
                                                onChange={handleCheckboxChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <Form.Group className='flex flex-row-reverse gap-2 items-center justify-end mb-3'>
                                            <Form.ControlLabel style={{ marginBottom: '0px' }}>Trastero</Form.ControlLabel>
                                            <input
                                                type="checkbox"
                                                name="trastero"
                                                checked={formData.trastero}
                                                onChange={handleCheckboxChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <Form.Group className='flex flex-row-reverse gap-2 items-center justify-end mb-3'>
                                            <Form.ControlLabel style={{ marginBottom: '0px' }}>Jardín</Form.ControlLabel>
                                            <input
                                                type="checkbox"
                                                name="jardin"
                                                checked={formData.jardin}
                                                onChange={handleCheckboxChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <Form.Group className='flex flex-row-reverse gap-2 items-center justify-end mb-3'>
                                            <Form.ControlLabel style={{ marginBottom: '0px' }}>Terraza</Form.ControlLabel>
                                            <input
                                                type="checkbox"
                                                name="terraza"
                                                checked={formData.terraza}
                                                onChange={handleCheckboxChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <Form.Group className='flex flex-row-reverse gap-2 items-center justify-end mb-3'>
                                            <Form.ControlLabel style={{ marginBottom: '0px' }}>Aire Acondicionado</Form.ControlLabel>
                                            <input
                                                type="checkbox"
                                                name="aireAcondicionado"
                                                checked={formData.aireAcondicionado}
                                                onChange={handleCheckboxChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Grid>
                        </Panel>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleSubmit} appearance="primary">
                        Guardar
                    </Button>
                    <Button onClick={closeModal} appearance="subtle">
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default EditModal;
