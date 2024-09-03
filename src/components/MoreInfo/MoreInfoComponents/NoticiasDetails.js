import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import Slider from 'react-slider';
import { AiOutlineDown, AiOutlineUp, AiOutlinePlus, AiOutlineClose } from 'react-icons/ai';
import Select from 'react-select';
import Toastify from 'toastify-js';
import moment from 'moment';
import 'moment/locale/es'; // Import Spanish locale for moment.js
import { IoCalendarNumber } from 'react-icons/io5';
import { MdRealEstateAgent } from 'react-icons/md';
import { RiAuctionLine } from 'react-icons/ri';
import { TbCalendarDollar } from 'react-icons/tb';
import { FaHandHoldingDollar } from 'react-icons/fa6';
import { TbUrgent } from 'react-icons/tb';
import { FaUserTie } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';

// CustomSlider component to handle the slider with only three discrete positions
const CustomSlider = ({ value, onChange }) => {
    return (
        <Slider
            min={0}
            max={2} // Three discrete positions: 0, 1, 2
            step={1}
            value={value}
            onChange={onChange}
            className="relative flex items-center w-full h-6"
            trackClassName="absolute bg-blue-200 h-1 rounded"
            thumbClassName="relative block w-6 h-6 bg-blue-500 rounded-full cursor-pointer"
        />
    );
};

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
        onClick: function () { },
    }).showToast();
};

const NoticiasDetails = ({ data, setOnAddNoticiaRefreshKey, onAddNoticiaRefreshKey, fetchData, currentPage, searchTerm }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [noticias, setNoticias] = useState([]);
    const [tipoVenta, setTipoVenta] = useState('');
    const [selectedAsesor, setSelectedAsesor] = useState(null);
    const [asesorOptions, setAsesorOptions] = useState([]);
    const [valoracion, setValoracion] = useState('');
    const [valoracionPrice, setValoracionPrice] = useState('');
    const [valoracionDateTime, setValoracionDateTime] = useState('');
    const [noticiaDateTime, setNoticiaDateTime] = useState(''); // New state for noticia date
    const [draggableValue, setDraggableValue] = useState(0); // 0: Baja, 1: Media, 2: Alta
    const [isEditing, setIsEditing] = useState(false); // New state for editing
    const [currentNoticiaId, setCurrentNoticiaId] = useState(null); // New state for current noticia ID

    useEffect(() => {
        console.log('data.inmueble.noticiastate', data.inmueble.noticiastate);
    }, []);

    const fetchNoticias = async () => {
        if (data.inmueble.noticiastate === 0) {
            console.log('No hay noticias para mostrar');
            return;
        } else {
            try {
                const parsedInmuebleId = parseInt(data.inmueble.id);
                console.log('parsedInmuebleId', parsedInmuebleId);
                const response = await axios.get('/api/fetchAllNoticias', {
                    params: { id: parsedInmuebleId },
                });

                if (response.data.status === 'success') {
                    const noticia = response.data.noticia; // Get the noticia object
                    if (noticia) {
                        // Wrap the single noticia object in an array
                        setNoticias([noticia]);
                    } else {
                        console.error('No noticia data available');
                        setNoticias([]); // Set to empty array if there's no noticia
                    }
                }
            } catch (error) {
                console.error('Error fetching noticias:', error);
                setNoticias([]); // Set to empty array on error
            }
        }
    };

    const fetchAsesores = async () => {
        try {
            const response = await axios.get('/api/fetchAsesores');
            const asesores = response.data.asesores;
            console.log('response', response.data.asesores);
            if (Array.isArray(asesores)) {
                setAsesorOptions(
                    asesores.map((user) => ({
                        value: `${user.nombre} ${user.apellido}`,
                        label: `${user.nombre} ${user.apellido}`,
                    })),
                );
            } else {
                console.error('Invalid data format for asesores');
            }
        } catch (error) {
            console.error('Error fetching asesores:', error);
        }
    };
    useEffect(() => {
        fetchNoticias();
        fetchAsesores();
    }, [data]);

    const handleSliderChange = (value) => {
        setDraggableValue(value);
    };

    const handlePopupClose = () => {
        setTipoVenta('');
        setSelectedAsesor(null);
        setValoracion('');
        setValoracionPrice('');
        setValoracionDateTime('');
        setNoticiaDateTime(''); // Reset noticia date
        setDraggableValue(0); // Reset draggable slider position
        setIsPopupOpen(false);
    };

    const handleAddNoticia = async () => {
        // Validate the input fields
        if (!tipoVenta) {
            showToast('Selecciona el tipo de venta', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }

        if (!selectedAsesor) {
            showToast('Selecciona un asesor', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }

        if (!valoracion) {
            showToast('Selecciona valoración', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }

        if (valoracion === 'Yes' && (!valoracionPrice || !valoracionDateTime)) {
            showToast('Introduce el precio y la fecha de valoración', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }

        // Prepare parameters
        const params = {
            id: isEditing ? currentNoticiaId : data.inmueble.id,
            tipoPVA: tipoVenta,
            valoracion: valoracion === 'Yes' ? '1' : '0',
            valoraciontext: valoracionPrice,
            fecha: noticiaDateTime,
            prioridad: draggableValue === 0 ? 'Baja' : draggableValue === 1 ? 'Media' : 'Alta',
            comercial: selectedAsesor.value,
            fechaValoracion: valoracionDateTime,
        };

        try {
            console.log('Sending params:', params);

            // Determine the endpoint based on whether we are editing or adding
            const endpoint = isEditing
                ? '/api/updateNoticia' // Use Next.js API route
                : '/api/agregarNoticia'; // Use Next.js API route

            // Send POST request
            const response = await axios.post(endpoint, params);
            console.log('Response data:', response.data);

            if (response.data.success) {
                showToast(isEditing ? 'Noticia actualizada' : 'Noticia añadida', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                handlePopupClose(); // Close the popup and reset fields
                await fetchNoticias(); // Refresh noticias
                setOnAddNoticiaRefreshKey(onAddNoticiaRefreshKey + 1); // Refresh the key to trigger a re-render
                fetchData(currentPage, searchTerm);
            } else {
                alert(response.data.error || 'An error occurred');
            }
        } catch (error) {
            console.error('Error adding/updating noticia:', error);
            showToast('Error al añadir/actualizar la noticia', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };


    const handleEditNoticia = (noticia) => {
        setTipoVenta(noticia.tipo_PV);
        setSelectedAsesor({
            value: noticia.comercial_noticia,
            label: noticia.comercial_noticia,
        });
        setValoracion(noticia.valoracion === 1 ? 'Yes' : 'No');
        setValoracionPrice(noticia.valoracion_establecida || '');
        setValoracionDateTime(noticia.valoracionDate || '');
        setNoticiaDateTime(noticia.noticia_fecha || '');
        setDraggableValue(noticia.prioridad === 'Baja' ? 0 : noticia.prioridad === 'Media' ? 1 : 2);
        setIsEditing(true); // Set editing state
        setCurrentNoticiaId(noticia.noticia_id); // Set current noticia ID for editing
        setIsPopupOpen(true); // Open the popup for editing
    };

    const handleDeleteNoticia = async () => {
        if (!isEditing || !currentNoticiaId) {
            console.error('Noticia ID is missing or not in editing mode.');
            return;
        }

        try {
            const response = await axios.get('http://localhost:8000/backend/noticias/deletenoticia.php', {
                params: {
                    id: currentNoticiaId,
                },
            });
            console.log('response deleted', response.data);
            if (response.data.success) {
                alert('Noticia eliminada correctamente.');
                // Optionally, close the popup or refresh the list of noticias
                handlePopupClose();
                setOnAddNoticiaRefreshKey(onAddNoticiaRefreshKey + 1);
                setIsEditing(false);
                fetchData(currentPage, searchTerm);
            } else {
                alert(`Error al eliminar noticia: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error al eliminar noticia:', error);
            alert('Ocurrió un error al eliminar la noticia.');
        }
    };
    // Helper function to format date to Spanish format
    const formatDate = (dateString) => {
        return moment(dateString).format('DD/MM/YYYY');
    };

    useEffect(() => {
        console.log('noticias', noticias);
    }, [noticias]);

    return (
        <div className="p-4">
            <div className="bg-white border border-gray-300 rounded-md">
                <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between p-4 cursor-pointer bg-gray-100 rounded-t-md">
                    <h2 className="font-bold text-xl">Noticias</h2>
                    {isOpen ? <AiOutlineUp className="text-2xl" /> : <AiOutlineDown className="text-2xl" />}
                </div>
                {isOpen && (
                    <div className="py-1 px-2 relative">
                        {data.inmueble.noticiastate === true ? (
                            noticias.map((noticia) => (
                                <div key={noticia.id} className="py-2 my-3 flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-2 flex-col w-full">
                                        <IoCalendarNumber className="text-gray-900 text-3xl" />
                                        <p className="text-base text-gray-950 py-1 text-center">{formatDate(noticia.noticia_fecha)}</p>
                                        <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-col w-full">
                                        <MdRealEstateAgent className="text-gray-900 text-3xl" />
                                        <p className="text-base text-gray-950 py-1 text-center">{noticia.tipo_PV === 'PV' ? 'Piso en Venta' : 'Piso en Venta con Anterioridad'}</p>
                                        <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-col w-full">
                                        <RiAuctionLine className="text-gray-900 text-3xl" />
                                        <p className="text-base text-gray-950 py-1 text-center">{noticia.valoracion === 0 ? 'No valorado' : 'Valorado'}</p>
                                        {noticia.valoracion === 0 && <div className="border-b border-gray-300 w-4/6 -mt-1"></div>}
                                    </div>

                                    {noticia.valoracion === 1 && (
                                        <div className="flex flex-col items-center gap-2 w-full">
                                            <div className="flex flex-row items-center justify-center gap-8 w-full">
                                                <div className="flex items-center gap-2 flex-col w-fit">
                                                    <TbCalendarDollar className="text-gray-900 text-3xl" />
                                                    <p className="text-base text-gray-900 py-1 text-center">
                                                        Fecha de <br /> valoración: <br /> {formatDate(noticia.valoracionDate)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-col w-fit">
                                                    <FaHandHoldingDollar className="text-gray-900 text-3xl" />
                                                    <p className="text-base text-gray-950 py-1 text-center">
                                                        Valoración <br /> establecida: <br /> {noticia.valoracion_establecida} €
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 flex-col w-full">
                                        <TbUrgent className="text-gray-900 text-3xl" />
                                        <p className="text-base text-gray-950 py-1 text-center">Prioridad: {noticia.prioridad}</p>
                                        <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-col w-full">
                                        <FaUserTie className="text-gray-900 text-3xl" />
                                        <p className="text-base text-gray-950 py-1 text-center">Asesor: {noticia.comercial_noticia}</p>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <FiEdit className="text-2xl cursor-pointer text-blue-500" onClick={() => handleEditNoticia(noticia)} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex justify-center items-center py-3">
                                <AiOutlinePlus className="text-4xl cursor-pointer text-blue-500" onClick={() => setIsPopupOpen(true)} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isPopupOpen && (
                <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                        <AiOutlineClose className="absolute top-2 right-2 text-2xl cursor-pointer" onClick={handlePopupClose} />
                        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Editar Noticia' : 'Añadir Noticia'}</h2>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-gray-600 -mb-4 pl-1">Fecha de Noticia</p>
                            <input type="date" value={noticiaDateTime} onChange={(e) => setNoticiaDateTime(e.target.value)} className="border border-gray-300 p-2 rounded" placeholder="Fecha de Noticia" />
                            <select value={tipoVenta} onChange={(e) => setTipoVenta(e.target.value)} className="border border-gray-300 p-2 rounded">
                                <option value="">Tipo Venta</option>
                                <option value="PV">PV</option>
                                <option value="PVA">PVA</option>
                            </select>

                            <Select options={asesorOptions} value={selectedAsesor} onChange={(option) => setSelectedAsesor(option)} placeholder="Asesor" className="basic-single z-[999]" classNamePrefix="select" />

                            <select value={valoracion} onChange={(e) => setValoracion(e.target.value)} className="border border-gray-300 p-2 rounded z-[900]">
                                <option value="">Valoración</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>

                            {valoracion === 'Yes' && (
                                <div className="flex flex-col gap-2">
                                    <input type="number" value={valoracionPrice} onChange={(e) => setValoracionPrice(e.target.value)} className="border border-gray-300 p-2 rounded" placeholder="Introduce un precio" />
                                    <p className="text-sm text-gray-600 -mb-2 pl-1">Fecha de la Valoración</p>
                                    <input type="date" value={valoracionDateTime} onChange={(e) => setValoracionDateTime(e.target.value)} className="border border-gray-300 p-2 rounded" placeholder="Fecha de Valoración" />
                                </div>
                            )}

                            <div className="flex flex-col py-3 px-4 w-full justify-center items-center bg-white border border-gray-300 rounded-lg shadow-md">
                                <h2 className="font-sans text-gray-700 text-center">Nivel</h2>
                                <div className="flex flex-row gap-8 justify-center mb-2 text-gray-700">
                                    <span>Baja</span>
                                    <span>Media</span>
                                    <span>Alta</span>
                                </div>
                                <CustomSlider value={draggableValue} onChange={handleSliderChange} />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button onClick={handleAddNoticia} className="bg-blue-500 text-white p-2 rounded">
                                    {isEditing ? 'Actualizar' : 'Añadir'}
                                </button>
                                {isEditing && (
                                    <button onClick={handleDeleteNoticia} className="bg-red-500 text-white p-2 rounded-md">
                                        Eliminar
                                    </button>
                                )}
                                <button onClick={handlePopupClose} className="bg-gray-500 text-white p-2 rounded">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticiasDetails;
