import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ItemDetailsHeader from './MoreInfoComponents/ItemDetailsHeader'; // Adjust the import path as needed
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import './MoreInfoComponents/ItemsDetailsHeader.css';
import { AiOutlineCamera, AiOutlinePlus, AiOutlineLoading, AiOutlinePhone } from 'react-icons/ai';
import dynamic from 'next/dynamic'; // Import dynamic from next/dynamic

// Dynamically import DetailsInfoOne with SSR disabled
const DetailsInfoOne = dynamic(() => import('./MoreInfoComponents/DetailsInfoOne'), { ssr: false });
import DetailsInfoTwo from './MoreInfoComponents/DetailsInfoTwo';
import DetailsInfoThree from './MoreInfoComponents/DetailsInfoThree';
import ComentariosDetails from './MoreInfoComponents/ComentariosDetails';
import NoticiasDetails from './MoreInfoComponents/NoticiasDetails';
import EncargosDetails from './MoreInfoComponents/EncargosDetails';
import Toastify from 'toastify-js';
// Import React Suite components
import { Modal, Button, Panel } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

import SmallLoadingScreen from '../LoadingScreen/SmallLoadingScreen';

const ItemDetails = ({ id, onClose, showModal, setShowModal, fetchData, currentPage, searchTerm, admin }) => {
    const [data, setData] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loaded, setLoaded] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSliderLoading, setIsSliderLoading] = useState(true);
    const [encargoData, setEncargoData] = useState([]);
    const [onAddNoticiaRefreshKey, setOnAddNoticiaRefreshKey] = useState(1);
    const [onAddEncargoRefreshKey, setOnAddEncargoRefreshKey] = useState(1);
    const [onAddEdtMoreInfoRefreshKey, setOnAddEdtMoreInfoRefreshKey] = useState(1);
    const [onAddDeleteDPVRefreshKey, setOnAddDeleteDPVRefreshKey] = useState(1);
    const [isVisible, setIsVisible] = useState(false); // Initial state
    const [descripcion, setDescripcion] = useState('');
    const [newDescripcion, setNewDescripcion] = useState('');
    const [DPVboolean, setDPVboolean] = useState();
    const [localizado, setLocalizado] = useState(null);
    const [direccion, setDireccion] = useState(null);
    const [nombre, setNombre] = useState(null);
    const [apellido, setApellido] = useState(null);


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

    const fetchDescripcion = async () => {
        try {
            const response = await axios.get('/api/getDescripcionInmueble', {
                params: {
                    id: id,
                },
            });
            if (response.data.status === 'success') {
                setDescripcion(response.data.descripcion || '');
                setNewDescripcion(response.data.descripcion || '');
            }
        } catch (error) {
            console.error('Error fetching description:', error);
            showToast('Error fetching description', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };


    const [sliderRef, slider] = useKeenSlider({
        loop: true,
        slides: {
            perView: 1,
            spacing: 10,
        },
        created() {
            setLoaded(true);
        },
    });

    useEffect(() => {
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading && slider.current) {
            slider.current.update();
        }
    }, [slider, images]);

    useEffect(() => {
        axios
            .get(`/api/inmuebleMoreInfo`, {
                params: { id: id },
            })
            .then((response) => {
                console.log('response.data', response.data);
                setData(response.data);
                let dpv = response.data.inmueble.DPV;
                setDPVboolean(dpv);
                let localizado = response.data.inmueble.localizado;
                setLocalizado(localizado);
                let direccion = response.data.inmueble.direccion;
                setDireccion(direccion);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, [id, onAddNoticiaRefreshKey, onAddEncargoRefreshKey, onAddEdtMoreInfoRefreshKey, onAddDeleteDPVRefreshKey, localizado]);



    useEffect(() => {
        const fetchEncargoData = async () => {
            if (id) {
                const numericId = parseInt(id, 10); // Convert `id` to an integer

                try {
                    const response = await axios.get('/api/encargosFetch', {
                        params: { id: numericId },
                    });
                    setEncargoData(response.data);
                } catch (error) {
                    console.error('Error fetching encargo data:', error);
                }
            }
        };

        fetchEncargoData();
        fetchDescripcion();
    }, [id, onAddNoticiaRefreshKey, onAddEncargoRefreshKey]);



    function Arrow(props) {
        const disabled = props.disabled ? ' arrow--disabled' : '';
        return (
            <svg onClick={props.onClick} className={`arrow ${props.left ? 'arrow--left' : 'arrow--right'} ${disabled}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                {props.left && <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />}
                {!props.left && <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />}
            </svg>
        );
    }

    if (!data) {
        return <SmallLoadingScreen />;
    }

    return (
        <Modal open={showModal} onClose={onClose} size="full" overflow={false} backdrop="static" >
            < Modal.Header >
            </Modal.Header >
            <Modal.Body>
                {isSliderLoading && (
                    <div className="bg-gray-100 w-full h-full fixed top-0 left-0 z-[100]">
                        <div className="flex items-center justify-center h-full">
                            <AiOutlineLoading className="text-blue-500 text-6xl animate-spin" />
                            <span className="ml-4 text-gray-800 font-sans text-xl font-semibold">Cargando...</span>
                        </div>
                    </div>
                )}
                <ItemDetailsHeader
                    onClose={onClose}
                    address={data.inmueble.direccion}
                    inmuebleId={data.inmueble.id}
                    setImages={setImages}
                    setIsSliderLoading={setIsSliderLoading}
                    isVisible={isVisible}
                    setIsVisible={setIsVisible}
                    data={data}
                    onAddEdtMoreInfoRefreshKey={onAddEdtMoreInfoRefreshKey}
                    setOnAddEdtMoreInfoRefreshKey={setOnAddEdtMoreInfoRefreshKey}
                    DPVboolean={DPVboolean} setDPVboolean={setDPVboolean}
                    admin={admin}
                    onAddDeleteDPVRefreshKey={onAddDeleteDPVRefreshKey}
                    setOnAddDeleteDPVRefreshKey={setOnAddDeleteDPVRefreshKey}
                    localizado={localizado}
                    setLocalizado={setLocalizado}
                    direccion={direccion}
                    nombre={nombre}
                    setNombre={setNombre}
                    apellido={apellido}
                    setApellido={setApellido}
                />
                {isVisible && (
                    <>
                        <div className="py-4 h-[300px] w-full rounded-lg">
                            {/* Slider Component */}
                            {images.length > 0 && (
                                <div ref={sliderRef} className="keen-slider h-full">
                                    {images.map((image, index) => (
                                        <div key={index} className="keen-slider__slide h-full flex justify-center items-center">
                                            <img src={`data:${image.type};base64,${image.data}`} alt={`Slide ${index}`} className="w-auto h-full object-contain" />
                                        </div>
                                    ))}
                                    {loaded && slider.current && (
                                        <>
                                            <Arrow left onClick={(e) => e.stopPropagation() || slider.current?.prev()} disabled={currentSlide === 0} />

                                            <Arrow onClick={(e) => e.stopPropagation() || slider.current?.next()} disabled={currentSlide === slider.current.track.details.slides.length - 1} />
                                        </>
                                    )}
                                </div>
                            )}
                            {images.length === 0 && <p className="text-center h-full flex flex-row justify-center items-center">No hay fotos disponibles</p>}
                        </div>
                    </>
                )}
                <h1 className="text-xl font-semibold text-start w-full leading-7 px-6">{data.inmueble.direccion}</h1>
                <DetailsInfoOne data={data} encargoData={encargoData} isVisible={isVisible} setIsVisible={setIsVisible} />
                {data.inmueble.localizado && (
                    <Panel className="bg-slate-50 rounded-lg shadow-xl w-[70%] flex flex-col justify-center items-center mx-auto">
                        <div className='flex flex-row justify-center items-center gap-2 pb-4'>
                            <AiOutlinePhone className='text-3xl text-blue-500' />
                            <h3 className='text-xl font-semibold text-center'>Localizado</h3>
                        </div>
                        <div className='flex flex-col justify-center items-center gap-2'>
                            <div className='flex flex-row justify-center items-center gap-3'>
                                <p className='font-semibold text-lg text-center'>Nombre: </p>
                                <p className='text-center text-lg m-0'>{nombre} {apellido}</p>

                            </div>
                            <div className='flex flex-row gap-2 justify-center items-center'>
                                <p className='font-semibold text-lg text-center'>Teléfono: </p>
                                <a href={`tel:${data.inmueble.localizado_phone}`} style={{ color: 'blue', textDecoration: 'underline' }} className='text-center text-lg'>{data.inmueble.localizado_phone}</a>
                            </div>
                        </div>
                    </Panel>

                )}
                <DetailsInfoTwo data={data} descripcion={descripcion} setDescripcion={setDescripcion} newDescripcion={newDescripcion} setNewDescripcion={setNewDescripcion} />
                <DetailsInfoThree data={data} />
                <ComentariosDetails data={data} />
                <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} />
                <EncargosDetails data={data} setOnAddEncargoRefreshKey={setOnAddEncargoRefreshKey} onAddEncargoRefreshKey={onAddEncargoRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} />
                <div className='flex justify-center gap-4 mt-4 pb-[50px] z-[10]' >
                    <Button onClick={onClose} appearance="default" style={{ fontSize: '1rem', padding: '10px 20px' }}>Cerrar</Button>
                </div>
            </Modal.Body>

        </Modal >
    );
};

export default ItemDetails;
