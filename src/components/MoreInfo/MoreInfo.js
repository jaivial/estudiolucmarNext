import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import ItemDetailsHeader from './MoreInfoComponents/ItemDetailsHeader'; // Adjust the import path as needed
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import './MoreInfoComponents/ItemsDetailsHeader.css';
import { AiOutlineCamera, AiOutlinePlus, AiOutlineLoading, AiOutlinePhone } from 'react-icons/ai';
import { Icon } from '@iconify/react';
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


const DesktopSliderComponent = dynamic(() => import('./MoreInfoComponents/DesktopSliderComponent.js'), { ssr: false });
const DesktopAdditionalInfo = dynamic(() => import('./desktopAdditionalinfo.js'), { ssr: false });


const ItemDetails = ({ id, onClose, showModal, setShowModal, fetchData, currentPage, searchTerm, admin, screenWidth }) => {
    const [data, setData] = useState(null);
    const [inmuebleId, setInmuebleId] = useState(id);
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
    const divRef = useRef(null);
    const [divHeight, setDivHeight] = useState(null);

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            if (entries[0]) {
                const height = entries[0].contentRect.height; // Get the dynamic height of the content
                setDivHeight(height); // Set the height dynamically
            }
        });

        if (divRef.current) {
            observer.observe(divRef.current);
        }

        return () => {
            if (divRef.current) {
                observer.unobserve(divRef.current);
            }
        };
    }, [divRef]);





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


    // Memoized function for fetching data
    const fetchInmuebleMoreInfo = useCallback(() => {
        axios
            .get(`/api/inmuebleMoreInfo`, {
                params: { id: id },
            })
            .then((response) => {
                console.log('response.data inmuebleMoreInfo', response.data);
                setData(response.data);

                let dpv = response.data.inmueble.DPV;
                if (dpv) {
                    setDPVboolean(dpv);
                    fetchDataDPV(response.data.inmueble.id); // Ensure fetchDataDPV is available in the scope
                }

                let localizado = response.data.inmueble.localizado;
                setLocalizado(localizado);

                let direccion = response.data.inmueble.direccion;
                setDireccion(direccion);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, [id]); // Memoize the function based on the `id`

    useEffect(() => {
        fetchInmuebleMoreInfo();
    }, [onAddNoticiaRefreshKey, onAddEdtMoreInfoRefreshKey, onAddDeleteDPVRefreshKey, localizado]);


    useEffect(() => {
        console.log('id', id);
        console.log('inmuebleId', inmuebleId);
    }), [id, inmuebleId];

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
        <div className='w-full pt-6 pb-6 px-6 overflow-y-scroll bg-slate-200 rounded-2xl shadow-2xl h-full flex flex-col gap-4'>
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
                <>
                    {screenWidth > 1660 ? (
                        <>

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
                                screenWidth={screenWidth}
                            />
                            <div className='w-full h-auto flex flex-row gap-4'>
                                <div ref={divRef} className={`rounded-xl ${data.inmueble.noticiastate ? 'w-1/4' : 'w-2/4'} h-full flex flex-col gap-4`}>
                                    {/* Slider Component */}
                                    <DesktopSliderComponent data={data} encargoData={encargoData} images={images} />
                                    {/* </div> */}
                                    <div className='flex flex-col gap-6 w-full h-auto rounded-2xl shadow-lg bg-slate-50 p-8'>
                                        <DesktopAdditionalInfo data={data} encargoData={encargoData} isVisible={isVisible} setIsVisible={setIsVisible} screenWidth={screenWidth} inmuebles_asociados_informador={inmuebles_asociados_informador} inmuebles_asociados_inquilino={inmuebles_asociados_inquilino} inmuebles_asociados_propietario={inmuebles_asociados_propietario} nombre={nombre} apellido={apellido} inmuebleId={data.inmueble.id} />
                                        <div className='w-full bg-white border-blue-400 border-2 p-6 gap-4 rounded-2xl shadow-md flex flex-col'>
                                            <DetailsInfoTwo data={data} descripcion={descripcion} setDescripcion={setDescripcion} newDescripcion={newDescripcion} setNewDescripcion={setNewDescripcion} screenWidth={screenWidth} />
                                        </div>
                                        <div className='flex flex-row items-start gap-6 w-full h-auto rounded-2xl'>
                                            <DetailsInfoThree data={data} isVisible={isVisible} screenWidth={screenWidth} />
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-full flex flex-row gap-6 rounded-2xl ${data.inmueble.noticiastate ? 'w-3/4' : 'w-2/4'} overflow-hidden`} style={{ maxHeight: `${divHeight}px` }}>
                                    <div className={`flex flex-col h-full rounded-lg gap-6 ${!data.inmueble.noticiastate ? 'w-1/2' : 'w-1/3'} overflow-y-scroll`} style={{ maxHeight: `${divHeight}px` }}>
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            <ClientesAsociados inmuebleId={data.inmueble.id} inmuebleDireccion={data.inmueble.direccion} screenWidth={screenWidth} setFetchClientPhoneNumberRefreshKey={setFetchClientPhoneNumberRefreshKey} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} localizadoRefreshKey={localizadoRefreshKey} setLocalizadoRefreshKey={setLocalizadoRefreshKey} />
                                        </div>
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            {data.inmueble.DPV ? <DPVInfoComponent DPVInfo={DPVInfo} /> : data.inmueble.encargostate && <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                            }
                                        </div>
                                    </div>
                                    {data.inmueble.noticiastate && (
                                        <div className='flex flex-col w-1/3 h-full rounded-2xl gap-6 transition-all duration-[800ms] ease-in-out overflow-y-scroll' style={{ maxHeight: `${divHeight}px` }}>
                                            {data.inmueble.DPV && !data.inmueble.encargostate && (
                                                <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                                    <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                                </div>
                                            )}
                                            {data.inmueble.DPV && data.inmueble.encargostate && (
                                                <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                                    <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                                </div>
                                            )}
                                            <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                                <EncargosDetails data={data} fetchInmuebleMoreInfo={fetchInmuebleMoreInfo} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                            </div>
                                        </div>
                                    )}
                                    <div className={`flex flex-col h-full rounded-2xl gap-6 ${!data.inmueble.noticiastate ? 'w-1/2' : 'w-1/3'} overflow-y-scroll comentariosdivcontainer`} style={{ maxHeight: `${divHeight}px` }}>
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            <ComentariosDetails data={data} inmuebleId={id} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} screenWidth={screenWidth} />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </>
                    ) : screenWidth <= 1660 ? (
                        <>
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
                                screenWidth={screenWidth}
                            />
                            <div className='w-full h-auto flex flex-row gap-4'>

                                <div ref={divRef} className={`rounded-xl ${data.inmueble.noticiastate ? 'w-1/3' : 'w-1/3'} h-full flex flex-col gap-4`}>
                                    {/* Slider Component */}
                                    <DesktopSliderComponent data={data} encargoData={encargoData} images={images} />
                                    {/* </div> */}
                                    <div className='flex flex-col gap-6 w-full h-auto rounded-2xl shadow-lg bg-slate-50 p-8'>
                                        <DesktopAdditionalInfo data={data} encargoData={encargoData} isVisible={isVisible} setIsVisible={setIsVisible} screenWidth={screenWidth} inmuebles_asociados_informador={inmuebles_asociados_informador} inmuebles_asociados_inquilino={inmuebles_asociados_inquilino} inmuebles_asociados_propietario={inmuebles_asociados_propietario} nombre={nombre} apellido={apellido} inmuebleId={data.inmueble.id} />
                                        <div className='w-full bg-white border-blue-400 border-2 p-6 gap-4 rounded-2xl shadow-md flex flex-col'>
                                            <DetailsInfoTwo data={data} descripcion={descripcion} setDescripcion={setDescripcion} newDescripcion={newDescripcion} setNewDescripcion={setNewDescripcion} screenWidth={screenWidth} />
                                        </div>
                                        <div className='flex flex-row items-start gap-6 w-full h-auto rounded-2xl'>
                                            <DetailsInfoThree data={data} isVisible={isVisible} screenWidth={screenWidth} />
                                        </div>
                                    </div>
                                </div>

                                <div className={`w-full flex flex-row gap-6 rounded-2xl ${data.inmueble.noticiastate ? 'w-2/3' : 'w-2/3'} overflow-y-hidden bg-yellow-400`} style={{ maxHeight: `${divHeight}px` }}>
                                    <div className={`flex flex-col justify-start rounded-lg gap-6 ${!data.inmueble.noticiastate ? 'w-1/2' : 'w-1/2'} overflow-y-scroll`} style={{ maxHeight: `${divHeight}px` }}>
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            <ClientesAsociados inmuebleId={data.inmueble.id} inmuebleDireccion={data.inmueble.direccion} screenWidth={screenWidth} setFetchClientPhoneNumberRefreshKey={setFetchClientPhoneNumberRefreshKey} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} localizadoRefreshKey={localizadoRefreshKey} setLocalizadoRefreshKey={setLocalizadoRefreshKey} />
                                        </div>

                                        <div className='flex flex-col w-full h-fit bg-red-400 rounded-2xl gap-6 ease-in-out'>
                                            <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                                <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                            </div>
                                            {data.inmueble.noticiastate && (
                                                <div className='flex flex-row h-fit bg-red-300 rounded-2xl shadow-lg'>
                                                    <EncargosDetails data={data} fetchInmuebleMoreInfo={fetchInmuebleMoreInfo} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                                </div>
                                            )}
                                        </div>

                                        {data.inmueble.DPV && (
                                            <div className='flex flex-row h-fit bg-red-300 rounded-2xl shadow-lg'>
                                                <DPVInfoComponent DPVInfo={DPVInfo} />
                                            </div>
                                        )}

                                    </div>

                                    <div className={`flex flex-col h-full rounded-2xl gap-6 ${!data.inmueble.noticiastate ? 'w-1/2' : 'w-1/2'} overflow-y-scroll comentariosdivcontainer`} style={{ maxHeight: `${divHeight}px` }}>
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            <ComentariosDetails data={data} inmuebleId={id} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} screenWidth={screenWidth} />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </>
                    ) : (
                        <>
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
                                screenWidth={screenWidth}
                            />

                            <div className="py-4 h-[300px] w-full rounded-lg">
                                {/* Slider Component */}
                                {images.length > 0 && (
                                    <div ref={sliderRef} className="keen-slider h-full relative">
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
                                    <DetailsInfoOne data={data} encargoData={encargoData} isVisible={isVisible} setIsVisible={setIsVisible} screenWidth={screenWidth} />
                                </>
                            )}

                            <div
                                className={`${screenWidth >= 640 ? 'flex flex-wrap gap-4' : 'flex flex-col gap-4'
                                    } w-full`}
                            >
                                {!isVisible && (
                                    <>
                                        <div className="flex flex-col gap-4 w-full">
                                            {data.inmueble.localizado && (
                                                <div className="w-full flex flex-col justify-center items-center">
                                                    <div className="w-[90%] max-w-4xl bg-gradient-to-l from-slate-300 to-slate-100 text-slate-600 border border-slate-300 p-6 gap-4 rounded-lg shadow-md">
                                                        <div className="text-lg font-bold capitalize">Información del localizado</div>
                                                        <div className="flex flex-col gap-4">
                                                            <p>Cliente: {nombre} {apellido}</p>
                                                            <div className="flex flex-row gap-2 items-center">
                                                                <p>Teléfono: <a href={`tel:${data.inmueble.localizado_phone}`}>{data.inmueble.localizado_phone}</a></p>
                                                                <a href={`tel:${data.inmueble.localizado_phone}`} className="rounded-md bg-slate-300 duration-300 p-2">
                                                                    {/* SVG for phone icon */}
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
                                                                            <Tag color="orange" style={{ marginBottom: '5px', marginRight: '5px' }}>Inquilino</Tag>
                                                                        )}
                                                                        {inmuebles_asociados_propietario?.some(propietario => propietario.id === inmuebleId) && (
                                                                            <Tag color="green" style={{ marginBottom: '5px', marginRight: '5px' }}>Propietario</Tag>
                                                                        )}
                                                                        {inmuebles_asociados_informador?.some(informador => informador.id === inmuebleId) && (
                                                                            <Tag style={{ marginBottom: '0px', marginRight: '5px', backgroundColor: '#dbeafe', borderRadius: '8px', border: '2px solid #60a5fa', color: '#2563eb' }}>Informador</Tag>
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
                                            )}
                                            <div className={`${screenWidth >= 1024 ? 'flex flex-row w-full transition-all duration-[1000ms] ease-in-out' : ''}`}>
                                                <DetailsInfoTwo data={data} descripcion={descripcion} setDescripcion={setDescripcion} newDescripcion={newDescripcion} setNewDescripcion={setNewDescripcion} screenWidth={screenWidth} />
                                                <ClientesAsociados inmuebleId={data.inmueble.id} inmuebleDireccion={data.inmueble.direccion} screenWidth={screenWidth} setFetchClientPhoneNumberRefreshKey={setFetchClientPhoneNumberRefreshKey} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} localizadoRefreshKey={localizadoRefreshKey} setLocalizadoRefreshKey={setLocalizadoRefreshKey} />
                                            </div>
                                            {data.inmueble.DPV && <DPVInfoComponent DPVInfo={DPVInfo} />}
                                        </div>
                                        <div className="flex flex-col gap-4 w-full">
                                            <div className={`${screenWidth >= 1024 ? 'flex flex-row w-full transition-all duration-[1000ms] ease-in-out' : ''}`}>
                                                <DetailsInfoThree data={data} isVisible={isVisible} screenWidth={screenWidth} />

                                                <ComentariosDetails data={data} inmuebleId={id} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} screenWidth={screenWidth} />
                                            </div>
                                            <div className={`${screenWidth >= 780 ? 'flex flex-row w-full' : ''}`}>
                                                <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                                <EncargosDetails data={data} setOnAddEncargoRefreshKey={setOnAddEncargoRefreshKey} onAddEncargoRefreshKey={onAddEncargoRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className={`${screenWidth >= 640 ? 'flex justify-center w-full mt-10 pb-[30px] z-[10]' : 'flex justify-center gap-4 mt-4 pb-[50px] z-[10]'}`}>
                                <Button onClick={onClose} appearance="default" style={{ fontSize: '1rem', padding: '10px 20px' }}>Cerrar</Button>
                            </div>
                        </>
                    )}
                </>
            )
            }

        </div >
    );
};

export default ItemDetails;
