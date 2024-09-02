import React, { useState } from 'react';
import Slider from 'react-slider';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapPin } from 'react-icons/fa';

const EditModal = ({ closeModal }) => {
    const [formData, setFormData] = useState({
        direccion: '',
        tipo: '',
        uso: '',
        superficie: '',
        ano_construccion: '',
        categoria: '',
        potencialAdquisicion: '',
        location: '',
        habitaciones: '',
        garaje: '',
        ascensor: false,
        banyos: '',
        trastero: false,
        jardin: false,
        terraza: false,
        aireAcondicionado: false,
    });
    const [mapPosition, setMapPosition] = useState([51.505, -0.09]);
    const [showMap, setShowMap] = useState(false);

    // Slider handling functions
    const handleSuperficieChange = (value) => handleChange({ target: { name: 'superficie', value } });
    const handleAnoConstruccionChange = (value) => handleChange({ target: { name: 'ano_construccion', value } });

    // Map click handler
    const handleMapClick = (event) => {
        setMapPosition([event.latlng.lat, event.latlng.lng]);
    };

    // Toggle map visibility
    const toggleMap = () => setShowMap(!showMap);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission here
        console.log(formData);
        closeModal(); // Close the modal after submitting
    };
    return (
        <div className="fixed inset-0 h-[calc(auto + 300px)] bg-gray-800 bg-opacity-75 flex items-center justify-center overflow-y-auto z-[9999] pb-52">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full h-auto max-w-4xl flex flex-col items-center justify-center absolute top-12 -mb-64  z-50">
                <h2 className="text-lg font-bold mb-4">Editar Inmueble</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <h3 className="text-md font-semibold mb-2">Características básicas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="direccion">
                                    Dirección
                                </label>
                                <input id="direccion" name="direccion" type="text" value={formData.direccion} onChange={handleChange} className="border border-gray-300 p-2 rounded-md w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="categoria">
                                    Categoría
                                </label>
                                <select id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} className="border border-gray-300 p-2 rounded-md w-full">
                                    <option value="">Seleccionar</option>
                                    <option value="Vacio">Vacio</option>
                                    <option value="Inquilino">Inquilino</option>
                                    <option value="Propietario">Propietario</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="uso">
                                    Uso
                                </label>
                                <input id="uso" name="uso" type="text" value={formData.uso} onChange={handleChange} className="border border-gray-300 p-2 rounded-md w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="tipo">
                                    Tipo
                                </label>
                                <input id="tipo" name="tipo" type="text" value={formData.tipo} onChange={handleChange} className="border border-gray-300 p-2 rounded-md w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="superficie">
                                    Superficie
                                </label>
                                <Slider min={0} max={2000} value={formData.superficie} onChange={handleSuperficieChange} className="w-full" />
                                <div className="text-center">{formData.superficie} m²</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="ano_construccion">
                                    Año de Construcción
                                </label>
                                <Slider min={1850} max={new Date().getFullYear()} value={formData.ano_construccion} onChange={handleAnoConstruccionChange} className="w-full" />
                                <div className="text-center">{formData.ano_construccion}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="location">
                                    Ubicación
                                    <button type="button" onClick={toggleMap} className="flex items-center text-blue-500 mt-2">
                                        <FaMapPin className="mr-2" /> Seleccionar en el mapa
                                    </button>
                                </label>
                                <input id="location" name="location" type="text" value={formData.location} readOnly className="border border-gray-300 p-2 rounded-md w-full" />
                            </div>
                        </div>
                        {showMap && (
                            <div className="w-full mb-4" style={{ height: '400px' }}>
                                <MapContainer center={mapPosition} zoom={13} onClick={handleMapClick} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                                    <Marker position={mapPosition}>
                                        <Popup>Ubicación seleccionada</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="localidad">
                                    Localidad
                                </label>
                                <input id="localidad" name="localidad" type="text" value={formData.localidad} onChange={handleChange} className="border border-gray-300 p-2 rounded-md w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="banyos">
                                    Baños
                                </label>
                                <input id="banyos" name="banyos" type="number" min="0" max="15" value={formData.banyos} onChange={handleChange} className="border border-gray-300 p-2 rounded-md w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="garaje">
                                    Garaje
                                </label>
                                <input id="garaje" name="garaje" type="checkbox" checked={formData.garaje} onChange={handleChange} className="mr-2" />
                                <span>Garaje</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="ascensor">
                                    Ascensor
                                </label>
                                <input id="ascensor" name="ascensor" type="checkbox" checked={formData.ascensor} onChange={handleChange} className="mr-2" />
                                <span>Ascensor</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="trastero">
                                    Trastero
                                </label>
                                <input id="trastero" name="trastero" type="checkbox" checked={formData.trastero} onChange={handleChange} className="mr-2" />
                                <span>Trastero</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="jardin">
                                    Jardín
                                </label>
                                <input id="jardin" name="jardin" type="checkbox" checked={formData.jardin} onChange={handleChange} className="mr-2" />
                                <span>Jardín</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="terraza">
                                    Terraza
                                </label>
                                <input id="terraza" name="terraza" type="checkbox" checked={formData.terraza} onChange={handleChange} className="mr-2" />
                                <span>Terraza</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="aireAcondicionado">
                                    Aire Acondicionado
                                </label>
                                <input id="aireAcondicionado" name="aireAcondicionado" type="checkbox" checked={formData.aireAcondicionado} onChange={handleChange} className="mr-2" />
                                <span>Aire Acondicionado</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                            Guardar
                        </button>
                        <button type="button" onClick={closeModal} className="ml-2 bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;
