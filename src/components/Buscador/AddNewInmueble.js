import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import Select from 'react-select';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import Toastify from 'toastify-js';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import SmallLoadingScreen from '../LoadingScreen/SmallLoadingScreen';
import { Modal, Button, Accordion } from 'rsuite';

const icon = L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
});

// Get the current year
const currentYear = new Date().getFullYear();

// Generate years from 1850 to the current year
const years = Array.from({ length: currentYear - 1850 + 1 }, (_, index) => ({ value: 1850 + index, label: (1850 + index).toString() }));
const meters = Array.from({ length: 2501 }, (_, index) => ({ value: index, label: index.toString() + ' m²' }));

const AddInmueblePopup = ({ screenWidth, showAddNewInmueble, setShowAddNewInmueble, fetchData, currentPage, searchTerm, fetchParentsAndChilds, handleIconAddInmueble }) => {
    const [direccion, setDireccion] = useState('');
    const [tipo, setTipo] = useState('Selecciona un tipo');
    const [uso, setUso] = useState('Selecciona un uso');
    const [anoConstruccion, setAnoConstruccion] = useState(null);
    const [superficie, setSuperficie] = useState(null); // Ensure correct initial state
    const [categoriaOcupacion, setCategoriaOcupacion] = useState('Elige una opción');
    const [markerPosition, setMarkerPosition] = useState(null);
    const [showOptions, setShowOptions] = useState(false);
    // New state variables for additional options
    const [habitaciones, setHabitaciones] = useState(null);
    const [garaje, setGaraje] = useState(false);
    const [ascensor, setAscensor] = useState(false);
    const [banyos, setBanyos] = useState(null);
    const [trastero, setTrastero] = useState(false);
    const [jardin, setJardin] = useState(false);
    const [terraza, setTerraza] = useState(false);
    const [aireAcondicionado, setAireAcondicionado] = useState(false);
    const [loading, setLoading] = useState(false);

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    const numberOptions = (max) => {
        return Array.from({ length: max + 1 }, (_, i) => ({ value: i, label: i.toString() }));
    };

    useEffect(() => {
        console.log('coordiantes', markerPosition);
    }, [markerPosition]);

    const handleAddInmueble = () => {
        if (!direccion || tipo === 'Selecciona un tipo' || uso === 'Selecciona un uso' || !anoConstruccion || !superficie || categoriaOcupacion === 'Elige una opción' || !markerPosition) {
            Toastify({
                text: 'Debes rellenar todos los campos',
                duration: 2500,
                destination: 'https://github.com/apvarun/toastify-js',
                newWindow: true,
                close: false,
                gravity: 'top', // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    borderRadius: '10px',
                    backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                    textAlign: 'center',
                },
                onClick: function () { }, // Callback after click
            }).showToast();
            return;
        }
        setLoading(true);
        const coordinatesArray = markerPosition ? [markerPosition.lat.toString(), markerPosition.lng.toString()] : [];
        axios
            .post('/api/add_New_Inmueble', {
                direccion,
                tipo,
                uso,
                ano_construccion: anoConstruccion.value,
                superficie: superficie.value,
                categoria: categoriaOcupacion,
                coordinates: coordinatesArray,
                location: 'Catarroja', // Assuming location is fixed or you can replace it with a state variable
                habitaciones: habitaciones ? habitaciones.value : null,
                garaje,
                ascensor,
                banyos: banyos ? banyos.value : null,
                trastero,
                jardin,
                terraza,
                aireacondicionado: aireAcondicionado,
            })
            .then((response) => {
                console.log(response.data);
                if (response.data.status === 'success') {

                    Toastify({
                        text: 'Inmueble agregado.',
                        duration: 2500,
                        destination: 'https://github.com/apvarun/toastify-js',
                        newWindow: true,
                        close: false,
                        gravity: 'top', // `top` or `bottom`
                        position: 'center', // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                            borderRadius: '10px',
                            backgroundImage: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)',
                            textAlign: 'center',
                        },
                        onClick: function () { }, // Callback after click
                    }).showToast();

                    setShowAddNewInmueble(false);
                    fetchData(currentPage, searchTerm);
                    fetchParentsAndChilds();
                    setLoading(false);
                }

            })
            .catch((error) => {
                console.error('There was an error!', error);
                setLoading(false);
            });
    };

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                setMarkerPosition(e.latlng);
            },
        });
        return null;
    };

    return (
        <Modal open={showAddNewInmueble} onClose={() => setShowAddNewInmueble(false)} style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '10px', padding: '0px', marginBottom: '70px' }} size="md" overflow={false} backdrop>
            <Modal.Header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', marginTop: '10px' }}>
                <Modal.Title style={{ fontSize: '1.5rem', textAlign: 'center' }}>Añadir Inmueble</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: '20px 20px 0px 20px' }}>
                <div className="flex flex-col gap-4">
                    <div className={`${screenWidth >= 990 ? 'flex flex-row' : 'flex flex-col'} gap-4 w-full`}>
                        <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} className="border p-2 rounded w-full" />
                        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="border rounded w-full">
                            <option>Selecciona un tipo</option>
                            <option>Urbano</option>
                            <option>Rural</option>
                        </select>
                    </div>
                    <div className={`${screenWidth >= 990 ? 'flex flex-row' : 'flex flex-col'} gap-4 w-full`}>

                        <select value={uso} onChange={(e) => setUso(e.target.value)} className="border rounded w-full">
                            <option>Selecciona un uso</option>
                            <option>Industrial</option>
                            <option>Residencial</option>
                            <option>Almacén-Estacionamiento</option>
                            <option>Comercial</option>
                            <option>Sanidad y Beneficiencia</option>
                            <option>Suelo sin edif</option>
                        </select>
                        <Select maxMenuHeight={150} options={years} placeholder="Año de construcción" value={anoConstruccion} onChange={setAnoConstruccion} className="w-full z-[9999]" />
                    </div>
                    <div className={`${screenWidth >= 990 ? 'flex flex-row' : 'flex flex-col'} gap-4 w-full`}>

                        <Select maxMenuHeight={150} options={meters} placeholder="Superfície m²" value={superficie} onChange={setSuperficie} className="w-full z-[9990]" />
                        <select value={categoriaOcupacion} onChange={(e) => setCategoriaOcupacion(e.target.value)} className="border rounded w-full">
                            <option>Elige una opción</option>
                            <option>Propietario</option>
                            <option>Inquilino</option>
                            <option>Vacío</option>
                        </select>
                    </div>
                    <Accordion defaultActiveKey='0' className='w-auto m-0 mt-[20px] border-2 border-blue-400 bg-white rounded-2xl'>
                        <Accordion.Panel header="Más Opciones" eventKey="0" style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            <div className={`${screenWidth >= 990 ? 'flex flex-row gap-4 w-full' : 'flex flex-col gap-4 w-full'}`}>
                                <div className='flex flex-col gap-4 w-full'>
                                    <label className='ml-1'>Habitaciones</label>
                                    <Select placeholder='Habitaciones' options={numberOptions(15)} value={habitaciones} onChange={setHabitaciones} />
                                </div>
                                <div className='flex flex-col gap-4 w-full'>
                                    <label className='ml-1'>Baños</label>
                                    <Select placeholder='Baños' options={numberOptions(10)} value={banyos} onChange={setBanyos} />
                                </div>
                            </div>
                            <div className={`checkbox-options ${screenWidth >= 990 ? 'grid grid-cols-4' : 'grid grid-cols-2'} gap-2 rounded-b-md p-4 w-full`}>
                                <div className='flex items-center justify-start gap-3'>
                                    <input type="checkbox" checked={garaje} onChange={(e) => setGaraje(e.target.checked)} />
                                    <label>Garaje</label>
                                </div>
                                <div className='flex items-center justify-start gap-3'>
                                    <input type="checkbox" checked={ascensor} onChange={(e) => setAscensor(e.target.checked)} />
                                    <label>Ascensor</label>
                                </div>
                                <div className='flex items-center justify-start gap-3'>
                                    <input type="checkbox" checked={trastero} onChange={(e) => setTrastero(e.target.checked)} />
                                    <label>Trastero</label>
                                </div>
                                <div className='flex items-center justify-start gap-3'>
                                    <input type="checkbox" checked={jardin} onChange={(e) => setJardin(e.target.checked)} />
                                    <label>Jardín</label>
                                </div>
                                <div className='flex items-center justify-start gap-3'>
                                    <input type="checkbox" checked={terraza} onChange={(e) => setTerraza(e.target.checked)} />
                                    <label>Terraza</label>
                                </div>
                                <div className='flex items-center justify-start gap-3'>
                                    <input type="checkbox" checked={aireAcondicionado} onChange={(e) => setAireAcondicionado(e.target.checked)} />
                                    <label>Aire Acondicionado</label>
                                </div>
                            </div>

                        </Accordion.Panel>
                    </Accordion>
                    <h2 className="text-lg font-bold w-[80%] text-center flex justify-center items-center mx-auto">Selecciona su ubicación</h2>
                    <MapContainer center={[39.4033747, -0.4028759]} zoom={14} className="h-[400px] w-[100%]">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {markerPosition && <Marker position={markerPosition} icon={icon} />}
                        <MapEvents />
                    </MapContainer>
                    <div className="flex justify-center gap-4">
                        <Button appearance="primary" onClick={handleAddInmueble}>
                            Añadir
                        </Button>
                        <Button appearance="subtle" onClick={() => handleIconAddInmueble()}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal >
    );
};

export default AddInmueblePopup;
