import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet'; // Ensure Leaflet is imported correctly

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

const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'cyan'];

const MapComponent = () => {
    const [center] = useState({ lat: 39.4033747, lng: -0.4028759 });
    const ZOOM_LEVEL = 15;
    const mapRef = useRef();
    const [zones, setZones] = useState([]);
    const [zoneData, setZoneData] = useState({ id: null, latlngs: [] });
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [zone_name, setZoneName] = useState('');
    const [color, setColor] = useState(colors[0]);
    const [zone_responsable, setResponsable] = useState('');
    const featureGroupRef = useRef();
    const [nombres, setNombres] = useState([]);
    const [zoneStatistics, setZoneStatistics] = useState({});
    const [zonesOrganized, setZonesOrganized] = useState({});

    useEffect(() => {
        const fetchResponsables = async () => {
            try {
                const response = await axios.get('/api/fetchNombreApellido'); // API call to fetch responsables
                console.log('Responsables fetched:', response.data);
                setNombres(response.data);
            } catch (error) {
                console.error('Error fetching responsables:', error);
            }
        };

        fetchResponsables();
    }, []); // Run once on component mount

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const response = await axios.get('/api/fetchAllZones'); // Adjust the API endpoint to match your Next.js setup
            console.log('Zones fetched:', response.data);
            setZones(response.data);
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
            setIsPopupOpen(true);
            layer.setStyle({ color });
            layer.bindPopup(document.createElement('div')).openPopup();
        }
    };

    const onDeleted = (e) => {
        console.log('Draw Deleted Event!', e);
        for (const layerId in e.layers._layers) {
            if (e.layers._layers.hasOwnProperty(layerId)) {
                const layer = e.layers._layers[layerId];

                if (layer.options && layer.options.code_id) {
                    console.log('Draw Deleted Event! ID:', layer.options.code_id);
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

        } catch (error) {
            console.error('Error updating zone:', error);
            throw error;
        }
    };

    const handleDelete = async (zoneCodeId) => {
        console.log('zoneCodeId', zoneCodeId);
        try {
            // Properly pass the params with axios.delete
            const response = await axios.delete('/api/deleteZone', { data: { zoneCodeId } });
            setZones((prevZones) => prevZones.filter((zone) => zone.code_id !== zoneCodeId));

            console.log('Zone deleted:', response.data);

        } catch (error) {
            console.error('Error deleting zone:', error);
        }
    };


    const handleCheckInmuebleInZone = async () => {
        try {
            const response = await axios.get('/api/checkInmuebleInZone');
            console.log('Check inmueble in zone:', response.data);
        } catch (error) {
            console.error('Error checking inmueble in zone:', error);
        }
    };

    const fetchZoneStatistics = async () => {
        try {
            const response = await axios.get('/api/calculateZoneStatistics');
            console.log('Zone statistics fetched:', response.data);
            setZoneStatistics(response.data);
        } catch (error) {
            console.error('Error fetching zone statistics:', error);
        }
    };

    useEffect(() => {
        handleCheckInmuebleInZone();
        fetchZoneStatistics();
    }, [zones]);

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
            setColor(colors[0]);
            setResponsable('');
            setIsPopupOpen(false);
            handleCheckInmuebleInZone();
            fetchZoneStatistics();
        } catch (error) {
            console.error('Error saving zone:', error);
        }
    };

    useEffect(() => {
        const organizeZonesData = async (zones, zoneStatistics) => {
            const zonesOrganized = zones.map((zone) => {
                const zoneId = zone.code_id;
                const statistics = zoneStatistics.filter((statistic) => statistic.zone_id === zoneId);

                let encargoState0 = 0;
                let encargoState1 = 0;
                let noticiaState0 = 0;
                let noticiaState1 = 0;
                let categoriaInquilino = 0;
                let categoriaVacio = 0;
                let categoriaPropietario = 0;
                let categoriaNull = 0;

                statistics.forEach((stat) => {
                    if (stat.encargoState === '0') encargoState0 += 1;
                    if (stat.encargoState === '1') encargoState1 += 1;
                    if (stat.noticiastate === '0') noticiaState0 += 1;
                    if (stat.noticiastate === '1') noticiaState1 += 1;
                    if (stat.categoria === 'Inquilino') categoriaInquilino += 1;
                    if (stat.categoria === 'Vacio') categoriaVacio += 1;
                    if (stat.categoria === 'Propietario') categoriaPropietario += 1;
                    if (stat.categoria === null) categoriaNull += 1;
                });

                const totalElements = statistics.length;

                return {
                    ...zone,
                    encargoState0,
                    encargoState1,
                    noticiaState0,
                    noticiaState1,
                    categoriaInquilino,
                    categoriaVacio,
                    categoriaPropietario,
                    categoriaNull,
                    totalElements,
                };
            });

            return zonesOrganized;
        };

        organizeZonesData(zones, zoneStatistics)
            .then((y) => {
                console.log('zones organized', y);
                setZonesOrganized(y);
            })
            .catch((error) => {
                console.error('Error organizing zones:', error);
            });

        console.log('zones organized', zonesOrganized);
    }, [zoneStatistics]);

    const handleZoneClick = (zone, layer) => {
        console.log('Zone clicked:', zone);
        console.log('Searching for code_id:', zone.code_id);
        console.log('zonesOrganized:', zonesOrganized);

        const matchedZone = zonesOrganized.find((z) => z.code_id === zone.code_id);

        if (!matchedZone) {
            console.error('Zone not found. Searched for:', zone.code_id);
            return;
        }

        const totalElements = matchedZone.totalElements || 0;
        const noticiasFalse = matchedZone.noticiaState0 || 0;
        const noticiasTrue = matchedZone.noticiaState1 || 0;
        const percentageNoticias = (noticiasTrue / totalElements) * 100;
        const encargosTrue = matchedZone.encargoState1 || 0;
        const encargosFalse = matchedZone.encargoState0 || 0;
        const percentageEncargos = (encargosTrue / totalElements) * 100;
        const categoriaInquilino = matchedZone.categoriaInquilino || 0;
        const percentageInquilino = (categoriaInquilino / totalElements) * 100;
        const categoriaVacio = matchedZone.categoriaVacio || 0;
        const percentageVacio = (categoriaVacio / totalElements) * 100;
        const categoriaPropietario = matchedZone.categoriaPropietario || 0;
        const percentagePropietario = (categoriaPropietario / totalElements) * 100;
        const categoriaNull = matchedZone.categoriaNull || 0;
        const percentageNull = (categoriaNull / totalElements) * 100;

        if (layer) {
            layer
                .bindPopup(
                    `
            <div class="flex flex-col items-center pt-2">
            <h3 class="line-height: 20px; text-center font-sans font-bold gap-4" style="margin: 6px;">Nombre: <br> ${matchedZone.zone_name}</h3>
              <p class="text-center" style="line-height: 20px; margin: 6px;">Responsable: <br> ${matchedZone.zone_responsable}</p>
              <p class="text-center" style="line-height: 20px; margin: 6px;">Total Inmuebles: ${totalElements}</p>
              <p class="text-center" style="line-height: 20px; margin: 6px;">Noticias: ${noticiasTrue} <br> ${percentageNoticias.toFixed(2)}%</p>
              <p class="text-center" style="line-height: 20px; margin: 6px;">Encargos: ${encargosTrue} <br> ${percentageEncargos.toFixed(2)}%</p>
              <p class="text-center" style="line-height: 20px; margin: 6px;">Propietario: ${categoriaPropietario} <br> ${percentagePropietario.toFixed(2)}%</p>
              <p class="text-center" style="line-height: 20px; margin: 6px;">Inquilino: ${categoriaInquilino} <br> ${percentageInquilino.toFixed(2)}%</p>
              <p class="text-center" style="line-height: 20px; margin: 6px;">Vacio: ${categoriaVacio} <br> ${percentageVacio.toFixed(2)}%</p>
              <p class="text-center" style="line-height: 20px; margin: 6px;">Sin Categoria: ${categoriaNull} <br> ${percentageNull.toFixed(2)}%</p>
            </div>`,
                )
                .openPopup();
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-start h-dvh bg-red-100">
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
                </FeatureGroup>
            </MapContainer>
            {isPopupOpen && (
                <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-slate-100 rounded-lg shadow-lg p-4 w-[80%] flex flex-col items-center gap-4 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-30">
                        <h2 className="font-sans text-center text-slate-800 font-bold text-lg">Editar zona</h2>
                        <label className="flex flex-col items-center gap-1 w-[60%]">
                            Nombre:
                            <input className="font-sans text-base text-center border-2 border-slate-300 rounded-lg p-1 w-full bg-white" type="text" value={zone_name} onChange={(e) => setZoneName(e.target.value)} required />
                        </label>
                        <label className="flex flex-col items-center gap-1 w-[60%]">
                            Color:
                            <select className="font-sans text-base  text-center border-2 border-slate-300 rounded-lg p-1 w-full bg-white" value={color} onChange={(e) => setColor(e.target.value)} required>
                                {colors.map((c) => (
                                    <option className="text-center" key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col items-center gap-1 w-[60%]">
                            Responsable:
                            <select className="font-sans text-base  text-center border-2 border-slate-300 rounded-lg p-1 w-full bg-white" value={zone_responsable} onChange={(e) => setResponsable(e.target.value)} required>
                                <option value="">Selecciona un responsable</option>
                                {nombres.map((nombre, index) => (
                                    <option key={index}>{nombre}</option>
                                ))}
                            </select>
                        </label>
                        <button className="font-sans font-bold text-white py-2 px-4 text-center bg-emerald-700 rounded-lg" onClick={handleSave}>
                            Guardar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
