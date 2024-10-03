import React, { useState, useRef, useEffect, use } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Progress, Modal } from 'rsuite';
import '../ProgressCircle/progresscircle.css';
import 'rsuite/dist/rsuite.min.css';
import Select from 'react-select'; // Import React Select

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet'; // Ensure Leaflet is imported correctly
import SmallLoadingScreen from '../LoadingScreen/SmallLoadingScreen';




const icon = L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
});

const SearchField = () => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
        provider: provider,
        marker: {
            icon: icon,
            draggable: false,
        },
    });

    const map = useMap();
    useEffect(() => {
        map.addControl(searchControl);
        const searchElement = document.querySelector('.leaflet-control-geosearch');
        if (searchElement) {
            searchElement.style.position = 'fixed';
            searchElement.style.top = '20px';
            searchElement.style.left = '50%';
            searchElement.style.transform = 'translateX(-50%)';
            searchElement.style.zIndex = 1000;
            searchElement.style.border = 'none';
            searchElement.style.width = '70%';
            searchElement.style.margin = 0;
        }

        const searchForm = searchElement.querySelector('form');
        if (searchForm) {
            searchForm.style.width = '100%';
        }

        const aSearch = searchElement.querySelector('a');
        if (aSearch) {
            aSearch.style.display = 'none';
        }

        const searchInput = document.querySelector('input.glass');
        if (searchInput) {
            searchInput.style.width = '100%';
            searchInput.style.height = '100%';
            searchInput.style.outline = 'none';
            searchInput.style.backgroundColor = 'white';
            searchInput.style.color = 'black';
            searchInput.style.padding = '10px';
            searchInput.style.borderRadius = '5px';
            searchInput.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            searchInput.placeholder = 'Buscar dirección';
        }

        const buttonReset = document.querySelector('button.reset');
        if (buttonReset) {
            buttonReset.style.display = 'none';
        }

        const results = searchForm.querySelector('div.results');
        if (results) {
            results.style.width = '100%';
            results.style.backgroundColor = 'white';
            results.style.display = 'flex';
            results.style.flexDirection = 'column';
            results.style.alignItems = 'start';
            results.style.justifyContent = 'center';
            results.style.gap = '10px';
            results.style.marginTop = '2px';
        }

        return () => map.removeControl(searchControl);
    }, [map]);

    return null;
};

const colorOptions = [
    { value: 'red', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-red-500"></div>Rojo</div> },
    { value: 'green', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-green-500"></div>Verde</div> },
    { value: 'blue', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-blue-500"></div>Azul</div> },
    { value: 'yellow', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-yellow-500"></div>Amarillo</div> },
    { value: 'orange', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-orange-500"></div>Naranja</div> },
    { value: 'purple', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-purple-500"></div>Morado</div> },
    { value: 'pink', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-pink-500"></div>Rosa</div> },
    { value: 'brown', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-brown-500"></div>Marrón</div> },
    { value: 'black', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-black"></div>Negro</div> },
    { value: 'white', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-white border border-gray-300"></div>Blanco</div> },
    { value: 'gray', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-gray-500"></div>Gris</div> },
    { value: 'cyan', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-cyan-500"></div>Cian</div> },
    { value: 'teal', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-teal-500"></div>Azul Verdoso</div> },
    { value: 'lime', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-lime-500"></div>Lima</div> },
    { value: 'indigo', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-indigo-500"></div>Índigo</div> },
    { value: 'rose', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-rose-500"></div>Rosa Fuerte</div> },
    { value: 'emerald', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-emerald-500"></div>Esmeralda</div> },
    { value: 'amber', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-amber-500"></div>Ámbar</div> },
    { value: 'violet', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-violet-500"></div>Violeta</div> },
    { value: 'fuchsia', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-fuchsia-500"></div>Fucsia</div> },
    { value: 'stone', label: <div className="flex items-center"><div className="w-4 h-4 mr-2 bg-stone-500"></div>Piedra</div> }
];

const customStyles = {
    option: (provided) => ({
        ...provided,
        padding: 10,
    }),
    control: (provided) => ({
        ...provided,
        marginTop: 10,
    }),
    menuList: base => ({
        ...base,
        maxHeight: '190px',
    }),
};

const customStylesColorPicker = {
    menuList: base => ({
        ...base,
        maxHeight: '190px',
    }),
    option: (provided) => ({
        ...provided,
        padding: 10,
    }),
    control: (provided) => ({
        ...provided,
        marginTop: 10,
    }),
};

const ColorPicker = ({ value, onChange }) => (
    <Select
        options={colorOptions}
        onChange={onChange}
        value={colorOptions.find(option => option.value === value)}
        styles={customStylesColorPicker}
    />
);


const MapComponent = ({ admin }) => {
    const [center] = useState({ lat: 39.4033747, lng: -0.4028759 });
    const ZOOM_LEVEL = 15;
    const mapRef = useRef();
    const [zones, setZones] = useState([]);
    const [zoneData, setZoneData] = useState({ id: null, latlngs: [] });
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [zone_name, setZoneName] = useState('');
    const [color, setColor] = useState('Selecciona un color');
    const lastPolygonRef = useRef(null);
    const [zone_responsable, setResponsable] = useState('');
    const featureGroupRef = useRef();
    const [nombres, setNombres] = useState([]);
    const [smallLoadingScreen, setSmallLoadingScreen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleOpen = () => {
        console.log('hola pedro', isPopupOpen);
        setIsPopupOpen(true);
    };
    useEffect(() => {
        const fetchResponsables = async () => {
            try {
                const response = await axios.get('/api/fetchNombreApellido'); // API call to fetch responsables
                console.log('Responsables fetched:', response.data);

                // Format the fetched data before setting it in state
                const formattedOptions = formatNombresToOptions(response.data);
                setNombres(formattedOptions);
            } catch (error) {
                console.error('Error fetching responsables:', error);
            }
        };

        fetchResponsables();
        fetchZones(); // Assuming this is another function you have defined elsewhere
    }, []); // Run once on component mount

    // Function to format the nombres data into options
    const formatNombresToOptions = (nombresList) => {
        return nombresList.map((nombre, index) => ({
            value: index,      // Use the index as a unique value
            label: nombre      // Use the string as the label
        }));
    };



    const fetchZones = async () => {
        try {
            setSmallLoadingScreen(true);
            const response = await axios.get('/api/fetchAllZones'); // Adjust the API endpoint to match your Next.js setup
            console.log('Zones fetched:', response.data);
            setZones(response.data);
            setSmallLoadingScreen(false);
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

    const onCreated = (e) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const { _leaflet_id } = layer;
            const latlngs = layer.getLatLngs();
            setZoneData({ id: _leaflet_id, latlngs });
            layer.setStyle({ color });
            layer.bindPopup(document.createElement('div')).openPopup();
            handleOpen();
            // Store the reference to the last created polygon
            lastPolygonRef.current = layer;
        }
    };

    const onDeleted = (e) => {
        console.log('Draw Deleted Event!', e);
        for (const layerId in e.layers._layers) {
            if (e.layers._layers.hasOwnProperty(layerId)) {
                const layer = e.layers._layers[layerId];

                if (layer.options && layer.options.code_id) {
                    console.log('Draw Deleted Event! ID:', layer.options.zone_name);
                    handleDelete(layer.options.code_id);
                }
            }
        }
    };

    const onEdited = (e) => {
        console.log('Draw Edited Event!', e);
        try {
            Object.values(e.layers._layers).forEach(async (layer) => {
                if (layer.options && layer.options.code_id) {
                    const codeID = layer.options.code_id;
                    const latlngs = layer.getLatLngs();

                    await updateZone(codeID, latlngs);
                }
            });
        } catch (error) {
            console.error('Error editing zone:', error);
        }
    };

    const updateZone = async (codeID, latlngs) => {
        try {
            const response = await axios.post('/api/updateZone', { code_id: codeID, latlngs });
            console.log('Zone updated in backend:', response.data);
            fetchZones();
            handleCheckInmuebleInZone(codeID);

        } catch (error) {
            console.error('Error updating zone:', error);
            throw error;
        }
    };

    const handleDelete = async (zoneCodeId) => {
        console.log('zoneCodeId', zoneCodeId);
        try {
            // Step 1: Set `zona` to null for all inmuebles with the matching `zoneCodeId`
            await axios.post('/api/setNullZoneInmuebleInZone', null, { params: { codeID: zoneCodeId } });

            // Step 2: Proceed to delete the zone
            const response = await axios.delete('/api/deleteZone', { data: { zoneCodeId } });
            setZones((prevZones) => prevZones.filter((zone) => zone.code_id !== zoneCodeId));

        } catch (error) {
            console.error('Error deleting zone:', error);
        }
    };


    const simulateProgress = (start, end, interval) => {
        return new Promise(resolve => {
            let current = start;
            const timer = setInterval(() => {
                if (current >= end) {
                    clearInterval(timer);
                    resolve();
                } else {
                    setUploadProgress(current);
                    current++;
                }
            }, interval);
        });
    };

    const handleCheckInmuebleInZone = async (codeId) => {
        setIsLoading(true);
        setShowSuccess(false);
        setUploadProgress(0); // Initialize progress


        try {
            // Make the Axios request
            const response = await axios.post('/api/checkInmuebleInZone', { codeID: codeId },
                // Simulate progress from 21 to 49 with a 100ms interval
                await simulateProgress(0, 100, 10),
            );
            console.log('Response from checkInmuebleInZone:', response);

            setUploadProgress(100);
            setShowSuccess(true);
        } catch (error) {
            console.error('Error checking inmueble in zone:', error);
            setShowSuccess(false);
        } finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }
    };

    useEffect(() => {
        console.log('zone Responsible', zone_responsable);
    }, [zone_responsable]);



    const handleSave = async () => {
        const code_id = uuidv4();
        const newZone = { code_id: code_id, zone_name: zone_name, color, zone_responsable: zone_responsable, latlngs: zoneData.latlngs };
        try {
            const response = await axios.post('/api/createNewZone', newZone);
            console.log('Zone saved:', response.data);
            const layer = featureGroupRef.current.getLayers().find((l) => l._leaflet_id === zoneData.id);
            if (layer) {
                layer.setStyle({ color });
                layer
                    .bindPopup(
                        `<div>
              <h3>${zone_name}</h3>
              <p>Responsable: ${zone_responsable}</p>
            </div>`,
                    )
                    .openPopup();
            }
            setZoneData({ id: null, latlngs: [] });
            setZoneName('');
            setColor(null);
            setResponsable('');
            setIsPopupOpen(false);
            console.log('code_id', code_id);
            handleCheckInmuebleInZone(code_id);
            fetchZones();
        } catch (error) {
            console.error('Error saving zone:', error);
        }
    };


    const handleZoneClick = async (zone, layer) => {
        try {
            // Step 1: Fetch the statistics for the clicked zone
            const zoneName = zone.zone_name;
            console.log('zoneName', zoneName);
            const response = await axios.get('/api/calculateZoneStatistics', { params: { zoneName } });
            console.log('Zone statistics fetched:', response.data);


            const zoneStatistics = response.data;
            const totalElements = zoneStatistics.totalInmuebles || 0;
            const zoneResponsable = zoneStatistics.zone_responsable;
            const noticiasTrue = zoneStatistics.noticiaState1 || 0;
            const percentageNoticias = zoneStatistics.percentageNoticias || 0;
            const encargosTrue = zoneStatistics.encargoState1 || 0;
            const percentageEncargos = zoneStatistics.percentageEncargos || 0;
            const categoriaInquilino = zoneStatistics.categoriaInquilino || 0;
            const percentageInquilino = zoneStatistics.percentageInquilino || 0;
            const categoriaVacio = zoneStatistics.categoriaVacio || 0;
            const percentageVacio = zoneStatistics.percentageVacio || 0;
            const categoriaPropietario = zoneStatistics.categoriaPropietario || 0;
            const percentagePropietario = zoneStatistics.percentagePropietario || 0;
            const categoriaNull = zoneStatistics.categoriaNull || 0;
            const percentageNull = zoneStatistics.percentageNull || 0;



            if (layer) {
                layer
                    .bindPopup(
                        `
                    <div class="flex flex-col items-center pt-2">
                        <h4 class="line-height: 20px; text-center font-sans font-bold gap-4" style="margin: 6px;">Nombre: <br> ${zoneName}</h4>
                        <p class="text-center" style="line-height: 20px; margin: 6px;">Responsable: <br> ${zoneResponsable}</p>
                        <p class="text-center" style="line-height: 20px; margin: 6px;">Total Inmuebles: ${totalElements}</p>
                        <p class="text-center" style="line-height: 20px; margin: 6px;">Noticias: ${noticiasTrue} <br> ${percentageNoticias}%</p>
                        <p class="text-center" style="line-height: 20px; margin: 6px;">Encargos: ${encargosTrue} <br> ${percentageEncargos}%</p>
                        <p class="text-center" style="line-height: 20px; margin: 6px;">Propietario: ${categoriaPropietario} <br> ${percentagePropietario}%</p>
                        <p class="text-center" style="line-height: 20px; margin: 6px;">Inquilino: ${categoriaInquilino} <br> ${percentageInquilino}%</p>
                        <p class="text-center" style="line-height: 20px; margin: 6px;">Vacio: ${categoriaVacio} <br> ${percentageVacio}%</p>
                        <p class="text-center" style="line-height: 20px; margin: 6px;">Sin Categoria: ${categoriaNull} <br> ${percentageNull}%</p>
                    </div>`,
                    )
                    .openPopup();
            }
        } catch (error) {
            console.error('Error handling zone click:', error);
        }
    };

    const closePopup = () => {
        if (lastPolygonRef.current) {
            // Remove the last created polygon from the map
            lastPolygonRef.current.remove();
            // Clear the reference
            lastPolygonRef.current = null;
            setZoneData({ id: null, latlngs: [] });
        }
        setIsPopupOpen(false);
    };


    const handleResponsableChange = (selectedOption) => {
        setResponsable(selectedOption ? selectedOption.label : '');
    };

    return (
        <>
            {isLoading && (
                <div className="fixed inset-0 bg-slate-800 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl bg-opacity-100 shadow-xl flex flex-col items-center justify-center p-6 transition-opacity duration-1000 gap-3">
                        <Progress.Circle
                            percent={uploadProgress}
                            status={showSuccess ? 'success' : 'active'}
                            strokeWidth={8}
                            strokeColor={showSuccess ? "#28a745" : "#ffc107"}
                            style={{ width: 100, height: 100 }}
                        />
                        {showSuccess && (
                            <p>Inmuebles agregados a la zona..</p>
                        )}
                        {!showSuccess && (
                            <p>Añadiendo inmuebles...</p>
                        )}

                    </div>
                </div>
            )}
            <div className="w-full flex flex-col items-center justify-start h-dvh">

                {smallLoadingScreen && <SmallLoadingScreen />}
                <MapContainer center={center} zoom={ZOOM_LEVEL} ref={mapRef} className="w-full h-dvh z-0">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <SearchField />
                    <FeatureGroup ref={featureGroupRef}>
                        {zones.map((zone) => (
                            <Polygon
                                key={zone.id}
                                positions={Array.isArray(zone.latlngs) && Array.isArray(zone.latlngs[0]) ? zone.latlngs.map((latlngGroup) => latlngGroup.map((coord) => [coord.lat, coord.lng])) : []}
                                color={zone.color}
                                eventHandlers={{ click: (event) => handleZoneClick(zone, event.target) }}
                                id={zone.id}
                                code_id={zone.code_id}
                            />
                        ))}

                        {admin && (
                            <EditControl
                                position="topright"
                                onCreated={onCreated}
                                onDeleted={onDeleted}
                                onEdited={onEdited}
                                draw={{
                                    rectangle: false,
                                    polyline: false,
                                    circle: false,
                                    circlemarker: false,
                                    marker: false,
                                    polygon: true,
                                }}
                            />
                        )}
                    </FeatureGroup>
                </MapContainer>
                <Modal
                    open={isPopupOpen}
                    onClose={closePopup}
                    size="sm"
                >
                    <Modal.Header>
                        <Modal.Title className="text-center" style={{ fontSize: '1.4rem', marginTop: '10px' }}>Crear Zona</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4 z-[9999] overflow-visible">
                        <div className="mb-4 mt-2">
                            <label className="block text-sm font-medium text-gray-700">Nombre de la Zona</label>
                            <input
                                type="text"
                                value={zone_name}
                                onChange={(e) => setZoneName(e.target.value)}
                                placeholder="Nombre de la Zona"
                                className="mt-1 block w-full border px-2 py-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <div className="mb-4 z-[9999] mt-8">
                            <label className="block text-sm font-medium text-gray-700">Color de la Zona</label>
                            <ColorPicker value={color} onChange={(option) => setColor(option.value)} />
                        </div>
                        <div className="mb-4 z-[9998] mt-8">
                            <label className="block text-sm font-medium text-gray-700">Responsable</label>
                            <Select
                                options={nombres} // Use the formatted `nombres` data
                                onChange={handleResponsableChange}
                                placeholder="Select a Responsable" // Placeholder text for the select component
                                styles={customStyles} // Apply any custom styles you may have
                            />

                        </div>
                        <div className="flex justify-center p-4 gap-2 z-20 mt-8">
                            <button
                                onClick={handleSave}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Guardar
                            </button>
                            <button
                                onClick={closePopup}
                                className="ml-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        </>
    );
};

export default MapComponent;
