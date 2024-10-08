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
import ClientesAsociados from './MoreInfoComponents/ClientesAsociados';
import Toastify from 'toastify-js';
// Import React Suite components
import { Modal, Button, Tag } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import DPVInfoComponent from './MoreInfoComponents/DPVInfoComponent';
import SmallLoadingScreen from '../LoadingScreen/SmallLoadingScreen';

const ItemDetails = ({ id, onClose, showModal, setShowModal, fetchData, currentPage, searchTerm, admin, screenWidth }) => {
    const [data, setData] = useState(null);
    const [inmuebleId, setInmuebleId] = useState(null);
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
    const [inmuebles_asociados_inquilino, setInmueblesAsociadosInquilino] = useState(null);
    const [inmuebles_asociados_propietario, setInmueblesAsociadosPropietario] = useState(null);
    const [inmuebles_asociados_informador, setInmueblesAsociadosInformador] = useState(null);
    const [passedDPVinfo, setPassedDPVinfo] = useState(null);
    const [DPVInfo, setDPVInfo] = useState(null);
    const [loadingThing, setLoadingThing] = useState(true);
    const [fetchClientPhoneNumberRefreshKey, setFetchClientPhoneNumberRefreshKey] = useState(1);
    const [localizadoRefreshKey, setLocalizadoRefreshKey] = useState(1);



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

    const fetchDataDPV = async (inmuebleId) => {
        try {
            const response = await axios.get(`/api/dpv/`, { params: { inmuebleId } });
            // Set fetched data to state variables
            if (response.data) {
                console.log('response.data dpvinfo', response.data);
                setDPVInfo(response.data);
                setDPVInfo(prevState => ({
                    ...prevState,
                    DPVboolean: true
                }));
            }
        } catch (error) {
            console.error('Error fetching DPV data:', error);
            showToast('Error al obtener los datos del DPV.', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
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
                console.log('response.data inmuebleMoreInfo', response.data);
                setData(response.data);
                setInmuebleId(response.data.inmueble.id);

                let dpv = response.data.inmueble.DPV;
                if (dpv) {
                    setDPVboolean(dpv);
                    fetchDataDPV(response.data.inmueble.id);
                }
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



    return (
        <div className='w-full pt-6 overflow-y-scroll bg-slate-200 pb-0 rounded-2xl shadow-2xl'>
            {!data && isSliderLoading ? (

                <div
                    id="small-loading-screen"
                    className="flex justify-center h-svh items-center z-[9900]"
                >
                    <div className="bg-white rounded-xl p-4 bg-opacity-100">
                        <AiOutlineLoading className="text-blue-500 text-4xl animate-spin" />
                    </div>
                </div>
            ) : (

                <div>
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
                        passedDPVinfo={passedDPVinfo}
                        setPassedDPVinfo={setPassedDPVinfo}
                        inmuebles_asociados_inquilino={inmuebles_asociados_inquilino}
                        setInmueblesAsociadosInquilino={setInmueblesAsociadosInquilino}
                        inmuebles_asociados_propietario={inmuebles_asociados_propietario}
                        setInmueblesAsociadosPropietario={setInmueblesAsociadosPropietario}
                        inmuebles_asociados_informador={inmuebles_asociados_informador}
                        setInmueblesAsociadosInformador={setInmueblesAsociadosInformador}
                        localizadoRefreshKey={localizadoRefreshKey}
                        setLocalizadoRefreshKey={setLocalizadoRefreshKey}
                    />

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
                    {!isVisible && (
                        <>
                            <h1 className="text-xl font-semibold text-start w-full leading-7 px-6">{data.inmueble.direccion}</h1>
                            <DetailsInfoOne data={data} encargoData={encargoData} isVisible={isVisible} setIsVisible={setIsVisible} />

                            {data.inmueble.localizado && (
                                <div className='w-full flex flex-col justify-center items-center'>
                                    <div class="w-[90%] max-w-4xl bg-gradient-to-l from-slate-300 to-slate-100 text-slate-600 border border-slate-300 grid grid-cols-3 p-6 gap-x-4 gap-y-4 rounded-lg shadow-md">
                                        <div class="col-span-3 text-lg font-bold capitalize">
                                            Información del localizado
                                        </div>
                                        <div class="col-span-3">
                                            <div className='gap-4 flex flex-col justify-center'>
                                                <p>Cliente: {nombre} {apellido}</p>
                                                <div class="flex flex-row gap-2 items-center">
                                                    <p>Teléfono: <a href={`tel:${data.inmueble.localizado_phone}`}>{data.inmueble.localizado_phone}</a></p>

                                                    <a href={`tel:${data.inmueble.localizado_phone}`} class="rounded-md bg-slate-300 duration-300 p-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path fill="currentColor" fill-opacity="0" stroke-dasharray="64" stroke-dashoffset="64" d="M8 3c0.5 0 2.5 4.5 2.5 5c0 1 -1.5 2 -2 3c-0.5 1 0.5 2 1.5 3c0.39 0.39 2 2 3 1.5c1 -0.5 2 -2 3 -2c0.5 0 5 2 5 2.5c0 2 -1.5 3.5 -3 4c-1.5 0.5 -2.5 0.5 -4.5 0c-2 -0.5 -3.5 -1 -6 -3.5c-2.5 -2.5 -3 -4 -3.5 -6c-0.5 -2 -0.5 -3 0 -4.5c0.5 -1.5 2 -3 4 -3Z"><animate fill="freeze" attributeName="fill-opacity" begin="0.6s" dur="0.15s" values="0;0.3" /><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0" /><animateTransform id="lineMdPhoneCallTwotoneLoop0" fill="freeze" attributeName="transform" begin="0.6s;lineMdPhoneCallTwotoneLoop0.begin+2.7s" dur="0.5s" type="rotate" values="0 12 12;15 12 12;0 12 12;-12 12 12;0 12 12;12 12 12;0 12 12;-15 12 12;0 12 12" /></path><path stroke-dasharray="4" stroke-dashoffset="4" d="M15.76 8.28c-0.5 -0.51 -1.1 -0.93 -1.76 -1.24M15.76 8.28c0.49 0.49 0.9 1.08 1.2 1.72"><animate fill="freeze" attributeName="stroke-dashoffset" begin="lineMdPhoneCallTwotoneLoop0.begin+0s" dur="2.7s" keyTimes="0;0.111;0.259;0.37;1" values="4;0;0;4;4" /></path><path stroke-dasharray="6" stroke-dashoffset="6" d="M18.67 5.35c-1 -1 -2.26 -1.73 -3.67 -2.1M18.67 5.35c0.99 1 1.72 2.25 2.08 3.65"><animate fill="freeze" attributeName="stroke-dashoffset" begin="lineMdPhoneCallTwotoneLoop0.begin+0.2s" dur="2.7s" keyTimes="0;0.074;0.185;0.333;0.444;1" values="6;6;0;0;6;6" /></path></g></svg>
                                                    </a>

                                                </div>
                                                {(
                                                    (inmuebles_asociados_inquilino?.some(inquilino => inquilino.id === inmuebleId)) ||
                                                    (inmuebles_asociados_propietario?.some(propietario => propietario.id === inmuebleId)) ||
                                                    (inmuebles_asociados_informador?.some(informador => informador.id === inmuebleId))
                                                ) ? (
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <p>Tipo de Cliente:</p>
                                                        <div>
                                                            {inmuebles_asociados_inquilino?.some(inquilino => parseInt(inquilino.id) === parseInt(inmuebleId)) && (
                                                                <Tag
                                                                    color="orange"
                                                                    style={{ marginBottom: '5px', marginRight: '5px' }}
                                                                >
                                                                    Inquilino
                                                                </Tag>
                                                            )}
                                                            {inmuebles_asociados_propietario?.some(propietario => propietario.id === inmuebleId) && (
                                                                <Tag
                                                                    color="green"
                                                                    style={{ marginBottom: '5px', marginRight: '5px' }}
                                                                >
                                                                    Propietario
                                                                </Tag>
                                                            )}
                                                            {inmuebles_asociados_informador?.some(informador => informador.id === inmuebleId) && (
                                                                <Tag
                                                                    style={{ marginBottom: '0px', marginRight: '5px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '2px solid #60a5fa', color: '#2563eb' }}
                                                                >
                                                                    Informador
                                                                </Tag>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-row gap-2">
                                                        <p>Tipo de Cliente: Sin Asignar</p>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DetailsInfoTwo data={data} descripcion={descripcion} setDescripcion={setDescripcion} newDescripcion={newDescripcion} setNewDescripcion={setNewDescripcion} />
                            <ClientesAsociados inmuebleId={data.inmueble.id} inmuebleDireccion={data.inmueble.direccion} screenWidth={screenWidth} setFetchClientPhoneNumberRefreshKey={setFetchClientPhoneNumberRefreshKey} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} localizadoRefreshKey={localizadoRefreshKey} setLocalizadoRefreshKey={setLocalizadoRefreshKey} />
                            {data.inmueble.DPV && <DPVInfoComponent DPVInfo={DPVInfo} />}
                        </>
                    )}
                    <DetailsInfoThree data={data} isVisible={isVisible} />
                    {!isVisible && (
                        <>
                            <ComentariosDetails data={data} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} />
                            <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} />
                            <EncargosDetails data={data} setOnAddEncargoRefreshKey={setOnAddEncargoRefreshKey} onAddEncargoRefreshKey={onAddEncargoRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                        </>
                    )}
                    <div className='flex justify-center gap-4 mt-4 pb-[50px] z-[10]' >
                        <Button onClick={onClose} appearance="default" style={{ fontSize: '1rem', padding: '10px 20px' }}>Cerrar</Button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ItemDetails;
