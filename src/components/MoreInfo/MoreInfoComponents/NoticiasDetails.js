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
import { Accordion, Panel, Modal, Button, InputNumber, DatePicker, CustomProvider, SelectPicker, InputPicker } from 'rsuite'; // Import Accordion and Panel from rsuite
import esES from 'rsuite/locales/es_ES';
import { format } from 'date-fns';

// CustomSlider component to handle the slider with only three discrete positions
const CustomSlider = ({ value, onChange }) => {
    return (
        <Slider
            min={0}
            max={1} // Three discrete positions: 0, 1, 2
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


    const fetchNoticias = async () => {
        if (data.inmueble.noticiastate === 0) {
            return;
        } else {
            try {
                const parsedInmuebleId = parseInt(data.inmueble.id);
                const response = await axios.get('/api/fetchAllNoticias', {
                    params: { id: parsedInmuebleId },
                });

                if (response.data.status === 'success') {
                    const noticia = response.data.noticia; // Get the noticia object
                    if (noticia) {
                        console.log('noticia', noticia);
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
            valoracion: valoracion === 'Con Valoración' ? 1 : 0,
            valoraciontext: valoracionPrice,
            fecha: noticiaDateTime,
            prioridad: draggableValue === 0 ? 'Baja' : 'Alta',
            comercial: selectedAsesor.value,
            fechaValoracion: valoracionDateTime,
            comercial: selectedAsesor,
        };



        try {

            // Determine the endpoint based on whether we are editing or adding
            const endpoint = isEditing
                ? '/api/updateNoticia' // Use Next.js API route
                : '/api/agregarNoticia'; // Use Next.js API route

            // Send POST request
            const response = await axios.post(endpoint, params);

            console.log('PARAMS', params);

            if (response.data.success) {
                showToast(isEditing ? 'Noticia actualizada' : 'Noticia añadida', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                handlePopupClose(); // Close the popup and reset fields
                fetchNoticias(); // Refresh noticias
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

    useEffect(() => {
        console.log('noticias', noticias);
    }, [noticias]);

    useEffect(() => {
        console.log('selectedAsesor', selectedAsesor);
    }, [selectedAsesor]);



    const handleEditNoticia = (noticia) => {
        setTipoVenta(noticia.tipo_PV);
        setSelectedAsesor(noticia.comercial_noticia);
        setValoracion(noticia.valoracion === 1 ? 'Con Valoración' : 'Sin Valoración');
        setValoracionPrice(noticia.valoracion_establecida || '');
        setValoracionDateTime(noticia.valoracionDate || '');
        setNoticiaDateTime(noticia.noticia_fecha || '');
        setDraggableValue(noticia.prioridad === 'Baja' ? 0 : 1);
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
            const response = await axios.delete('/api/deleteNoticia', {
                data: {
                    id: currentNoticiaId,
                },
            });
            if (response.data.success) {
                showToast('Noticia eliminada correctamente', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                handlePopupClose();
                setOnAddNoticiaRefreshKey(onAddNoticiaRefreshKey + 1);
                setIsEditing(false);
                fetchData(currentPage, searchTerm);
            } else {
                alert(`Error al eliminar noticia: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error al eliminar noticia:', error);
            showToast('Error al eliminar la noticia', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };
    // Helper function to format date to Spanish format
    const formatDate = (dateString) => {
        return moment(dateString).format('DD/MM/YYYY');
    };
    // Helper function to format date to Spanish format
    const formatDateTwo = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD');
    };

    useEffect(() => {
        console.log('noticiaDateTime', noticiaDateTime);
        console.log('valoracionDateTime', valoracionDateTime);
    }, [noticiaDateTime, valoracionDateTime]);



    return (
        <CustomProvider locale={esES}>
            <Accordion defaultActiveKey={1} bordered style={{ margin: '0px', marginTop: '0px', width: '100%', borderRadius: '1rem' }}>
                <Accordion.Panel style={{
                    backgroundColor: 'rgb(248 250 252)', padding: '0px', borderRadius: '1rem'
                }} header={'Noticias'} eventKey={1} className='shadow-xl'>
                    <div className="p-4">
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
                                                            Valoración <br /> establecida: <br /> {noticia.valoracion_establecida.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €
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
                                            <p className="text-base text-gray-950 py-1 text-center">Asesor: {noticia.comercial_noticia.value ? noticia.comercial_noticia.value : noticia.comercial_noticia}</p>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <FiEdit className="text-2xl cursor-pointer text-blue-500" onClick={() => handleEditNoticia(noticia)} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex justify-center items-center">
                                    <AiOutlinePlus className="text-4xl cursor-pointer text-blue-500" onClick={() => setIsPopupOpen(true)} />
                                </div>
                            )}
                        </div>

                        <Modal open={isPopupOpen} onClose={handlePopupClose} size="sm" backdrop={true} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0px 2px' }}>
                            <Modal.Header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', marginTop: '10px' }}>
                                <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>{isEditing ? 'Editar Noticia' : 'Añadir Noticia'}</Modal.Title>
                            </Modal.Header>
                            <Modal.Body style={{ padding: '10px 25px', fontSize: '1rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
                                <div className="flex flex-col gap-4 w-full">
                                    <p className="text-sm text-gray-600 -mb-4 pl-1">Fecha de Noticia</p>
                                    <DatePicker
                                        value={noticiaDateTime ? new Date(noticiaDateTime) : new Date()}
                                        onChange={(value) => setNoticiaDateTime(formatDateTwo(value))}
                                        format="dd/MM/yyyy"
                                        oneTap
                                        placement="auto"
                                        className="w-full"
                                        placeholder="Fecha de Valoración"
                                    />
                                    <InputPicker
                                        value={tipoVenta}
                                        onChange={(value) => setTipoVenta(value)}
                                        data={[
                                            { value: 'PV', label: 'PV' },
                                            { value: 'PVA', label: 'PVA' }
                                        ]}
                                        placeholder="Tipo Venta"
                                        className="basic-single z-[901]"
                                        style={{ width: '100%' }}
                                    />

                                    <SelectPicker
                                        data={asesorOptions.map(option => ({
                                            ...option,
                                            selected: option.label === selectedAsesor,
                                        }))}
                                        value={selectedAsesor ? asesorOptions.find(option => option.label === selectedAsesor)?.value : null}
                                        onChange={(value, item) => {
                                            setSelectedAsesor(value);
                                        }}
                                        placeholder="Asesor"
                                        clearable={true}
                                        className="basic-single z-[900]"
                                        style={{ width: '100%' }}
                                    />

                                    <Select
                                        value={valoracion ? { value: valoracion, label: valoracion } : null}
                                        onChange={(option) => setValoracion(option.value)}
                                        options={[
                                            { value: 'Con Valoración', label: 'Con Valoración' },
                                            { value: 'Sin Valoración', label: 'Sin Valoración' }
                                        ]}
                                        placeholder="Valoración"
                                        className="basic-single z-[800]"
                                        classNamePrefix="select"
                                    />

                                    {valoracion === 'Con Valoración' && (
                                        <div className="flex flex-col gap-2">
                                            <p className="text-sm text-gray-600 -mb-2 pl-1">Precio de la Valoración</p>
                                            <InputNumber
                                                min={0}
                                                value={valoracionPrice}
                                                onChange={(value) => setValoracionPrice(value)}
                                                className="w-full"
                                                placeholder="Introduce un precio"
                                            />
                                            <p className="text-sm text-gray-600 -mb-2 pl-1">Fecha de la Valoración</p>
                                            <DatePicker
                                                value={valoracionDateTime ? new Date(valoracionDateTime) : new Date()}
                                                onChange={(value) => setValoracionDateTime(formatDateTwo(value))}
                                                format="dd/MM/yyyy"
                                                oneTap
                                                placement="auto"
                                                className="w-full"
                                                placeholder="Fecha de Valoración"
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-col py-3 px-10 w-full justify-center items-center bg-white border border-gray-300 rounded-lg shadow-md">
                                        <h2 className="font-sans text-gray-700 text-center text-xl mb-4 mt-2">Prioridad</h2>
                                        <div className="flex flex-row gap-8 justify-between w-full mb-2 text-gray-700">
                                            <span>Baja</span>
                                            <span>Alta</span>
                                        </div>
                                        <CustomSlider value={draggableValue} onChange={handleSliderChange} />
                                    </div>
                                </div>
                                <Modal.Footer>
                                    <div className='flex flex-col items-center justify-center gap-4 mt-4'>
                                        <div>
                                            <Button onClick={handleAddNoticia} appearance="primary">
                                                {isEditing ? 'Actualizar' : 'Añadir'}
                                            </Button>
                                            {isEditing && (
                                                <Button onClick={handleDeleteNoticia} color="red" appearance="primary">
                                                    Eliminar
                                                </Button>
                                            )}
                                        </div>
                                        <div>
                                            <Button onClick={handlePopupClose} appearance="subtle">
                                                Cerrar
                                            </Button>
                                        </div>
                                    </div>
                                </Modal.Footer>
                            </Modal.Body>
                        </Modal>
                    </div>
                </Accordion.Panel>
            </Accordion>
        </CustomProvider>
    );
};

export default NoticiasDetails;
