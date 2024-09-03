import React, { use, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { FaMapMarkerAlt } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';
import { AiOutlineClose, AiOutlinePlus } from 'react-icons/ai';
import axios from 'axios';

const icon = L.icon({ iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] });

// some other code


const DetailsInfoOne = ({ data, encargoData, isVisible, setIsVisible }) => {
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        console.log('data', data);
    }, []);

    // Parse coordinates from stringified array
    const coordinatesArray = data.inmueble.coordinates;
    const lat1 = parseFloat(coordinatesArray[0]);
    const lat2 = parseFloat(coordinatesArray[1]);
    const lng1 = parseFloat(coordinatesArray[2]);
    const lng2 = parseFloat(coordinatesArray[3]);

    // Calculate the center of the bounding box
    const centerLat = (lat1 + lat2) / 2;
    const centerLng = (lng1 + lng2) / 2;
    const centerCoordinates = [centerLat, centerLng];

    const { location } = data.inmueble;
    const { address } = data.inmueble.direccion;

    const toggleMap = () => setShowMap(!showMap);

    return (
        <div className="w-full p-4">
            <div className="flex flex-col justify-between items-start px-2">
                {isVisible && (
                    <div className="flex items-center">
                        <p className="text-lg font-semibold mr-2">{location}</p>
                        <button onClick={toggleMap} className="flex items-center text-blue-500">
                            <FaMapMarkerAlt className="text-xl mr-1" />
                            <span>Ver en el mapa</span>
                        </button>
                    </div>
                )}
                <div>
                    {data.inmueble.encargoState == 1 && (
                        <div className="flex flex-row justify-start items-center gap-2">
                            <p className="font-bold py-3">{encargoData != null ? `${encargoData.precio_1} €` : 'No hay encargos para este inmueble'}</p>
                            <p className="font-bold py-3">{encargoData != null ? `${encargoData.tipo_encargo} €` : ''}</p>
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap flex-row justify-start items-center gap-2">
                    <p className='mt-[8px]'>{data.inmueble.superficie} m²</p>
                    <p className="text-gray-500 text-2xl font-extralight h-full pb-0.5">|</p>
                    <p>{data.inmueble.habitaciones === null ? '?' : data.inmueble.habitaciones} hab.</p>
                    <p className="text-gray-500 text-2xl font-extralight h-full pb-0.5">|</p>
                    <p>{data.inmueble.garaje == 1 ? 'Garaje incluido' : 'Sin garaje'}</p>
                    <p className="text-gray-500 text-2xl font-extralight h-full pb-0.5">|</p>
                    <p>{data.inmueble.ano_construccion}</p>
                </div>
            </div>

            {showMap && (
                <div className="fixed inset-0 z-10 bg-gray-800 bg-opacity-80 w-full h-full flex items-center justify-center">
                    <div className="flex flex-col justify-center items-center z-50 bg-white h-full w-full">
                        <div className="flex flex-col items-center justify-center h-auto py-4 w-full px-5">
                            <h1 className="text-sm font-md text-start w-full leading-6">
                                {data.inmueble.direccion} <br />
                                {location} &nbsp;&nbsp; {data.inmueble.tipo} &nbsp;&nbsp; {data.inmueble.superficie} m²
                            </h1>
                            <p className="text-sm font-md text-start w-full leading-6">
                                Zona: {data.inmueble.zona ? data.inmueble.zona : 'N/A'} &nbsp;&nbsp; Responsable: {data.inmueble.responsable ? data.inmueble.responsable : 'N/A'}
                            </p>
                        </div>
                        <button onClick={toggleMap} className="absolute top-7 right-5 text-gray-900 text-3xl z-50">
                            <AiOutlineClose />
                        </button>
                        <MapContainer center={centerCoordinates} zoom={17} style={{ height: '100%', width: '100%', zIndex: 20 }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                            <Marker position={centerCoordinates} icon={icon}>
                                <Popup> Dirección: {data.inmueble.direccion} <br /> Zona: {data.inmueble.zona ? data.inmueble.zona : 'N/A'} <br /> Responsable: {data.inmueble.responsable ? data.inmueble.responsable : 'N/A'} </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailsInfoOne;
