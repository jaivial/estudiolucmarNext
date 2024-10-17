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
import { FaArrowLeft } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

const DesktopSliderComponent = dynamic(() => import('./MoreInfoComponents/DesktopSliderComponent.js'), { ssr: false });
const DesktopAdditionalInfo = dynamic(() => import('./desktopAdditionalinfo.js'), { ssr: false });
import TransactionHistory from './MoreInfoComponents/TransactionHistory';


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
    const [clientesAsociados, setClientesAsociados] = useState([]);
    const [clientesAsociadosInmueble, setClientesAsociadosInmueble] = useState([]);
    const [filteredClientes, setFilteredClientes] = useState(null);
    const [refreshMatchingClientesEncargos, setRefreshMatchingClientesEncargos] = useState(1);
    const [clienteOptions, setClienteOptions] = useState([]);
    const [transaccionesHistory, setTransaccionesHistory] = useState([]);

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

    const fetchClientes = useCallback(async () => {
        const inmuebleId = data.inmueble.id;
        try {
            const response = await axios.get('/api/seleccionaClienteEncargos', { params: { inmuebleId } });
            console.log('response clientes', response.data);
            if (Array.isArray(response.data)) {
                setClienteOptions(
                    response.data.map((cliente) => ({
                        value: cliente.id,
                        label: cliente.nombrecompleto_cliente,
                    })),
                );
            } else {
                console.error('Invalid data format for clients');
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    });


    useEffect(() => {
        console.log('id', id);
        console.log('inmuebleId', inmuebleId);
    }), [id];

    useEffect(() => {

        fetchTransacciones(id);
    }, []);

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

    const fetchClientesAsociados = useCallback(async () => {
        try {
            const response = await axios.get('/api/fetchClientesAsociados', {
                params: {
                    inmuebleId: id,
                },
            });
            console.log('response.data.clientesTotales', response.data.clientesTotales);
            console.log('response.data.clientesTarget', response.data.clientesTarget);
            setClientesAsociados(response.data.clientesTotales);
            setClientesAsociadosInmueble(response.data.clientesTarget);
            setFilteredClientes(response.data.clientesTarget);
        } catch (error) {
            console.error('Error fetching clientes asociados del inmueble:', error);
        }
    });

    function Arrow(props) {
        const disabled = props.disabled ? ' arrow--disabled' : '';
        return (
            <svg onClick={props.onClick} className={`arrow ${props.left ? 'arrow--left' : 'arrow--right'} ${disabled}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                {props.left && <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />}
                {!props.left && <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />}
            </svg>
        );
    }

    const fetchTransacciones = useCallback(async (inmuebleID) => {
        try {
            const response = await axios.get('/api/fetchTransacciones', {
                params: { inmuebleID: inmuebleID },
            });
            if (response.status === 200) {
                setTransaccionesHistory(response.data.transacciones); // Assuming the API returns an array of transactions
                console.log('fetch transactions', response.data);
            } else {
                console.error('Error fetching transactions:', response.statusText);
                return;
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
    });


    return (
        <div className='w-full pt-6 pb-6 px-6 overflow-y-scroll bg-slate-200 rounded-2xl shadow-2xl h-full flex flex-col gap-4 relative'>
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
                    {screenWidth > 560 && (
                        <Button onClick={onClose} appearance="secondary" className='m-auto' style={{ padding: '0.5rem 1rem', position: 'absolute', top: '2rem', left: '2rem' }}>
                            <FaArrowLeft className='text-3xl' />
                        </Button>
                    )}
                    {screenWidth <= 560 && (
                        <Button onClick={onClose} appearance="secondary" className='ml-auto' style={{ padding: '0.5rem 1rem', }}>
                            <IoClose className='text-3xl' />
                        </Button>
                    )}
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
                            <div className='w-full h-auto flex flex-row gap-6'>
                                <div ref={divRef} className={`rounded-xl ${data.inmueble.noticiastate ? 'w-2/6' : 'w-2/4'} h-full flex flex-col gap-4`}>
                                    {/* Slider Component */}
                                    <div className='w-full flex flex-col gap-6'>
                                        <DesktopSliderComponent data={data} encargoData={encargoData} images={images} screenWidth={screenWidth} />
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
                                </div>

                                <div className={`w-full flex flex-row gap-6 rounded-2xl ${data.inmueble.noticiastate ? 'w-3/4' : 'w-1/3'} overflow-hidden max-h-[1600px]`}>

                                    <div className={`flex flex-col h-full rounded-lg gap-6 ${data.inmueble.noticiastate ? 'w-full' : 'w-1/2'} overflow-y-scroll`}>
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            <ClientesAsociados fetchClientesEncargos={fetchClientes} setFilteredClientes={setFilteredClientes} refreshMatchingClientesEncargos={refreshMatchingClientesEncargos} setRefreshMatchingClientesEncargos={setRefreshMatchingClientesEncargos} fetchClientesAsociados={fetchClientesAsociados} setClientesAsociadosInmueble={setClientesAsociadosInmueble} setClientesAsociados={setClientesAsociados} clientesAsociados={clientesAsociados} clientesAsociadosInmueble={clientesAsociadosInmueble} filteredClientes={filteredClientes} inmuebleId={data.inmueble.id} inmuebleDireccion={data.inmueble.direccion} screenWidth={screenWidth} setFetchClientPhoneNumberRefreshKey={setFetchClientPhoneNumberRefreshKey} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} localizadoRefreshKey={localizadoRefreshKey} setLocalizadoRefreshKey={setLocalizadoRefreshKey} />
                                        </div>
                                        {!data.inmueble.noticiastate && (
                                            <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                                <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                            </div>
                                        )}
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            {data.inmueble.DPV && <DPVInfoComponent DPVInfo={DPVInfo} />
                                            }
                                        </div>
                                        {!data.inmueble.DPV && data.inmueble.noticiastate && (
                                            <div className='flex flex-col h-fit rounded-2xl'>
                                                <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                            </div>
                                        )}

                                    </div>

                                    {data.inmueble.noticiastate && (
                                        <div className='flex flex-col w-full h-full rounded-2xl gap-6 transition-all duration-[800ms] ease-in-out overflow-y-scroll'>
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

                                            <div className='flex flex-row h-auto rounded-2xl'>
                                                <EncargosDetails fetchTransacciones={fetchTransacciones} fetchClientes={fetchClientes} clienteOptions={clienteOptions} setClienteOptions={setClienteOptions} refreshMatchingClientesEncargos={refreshMatchingClientesEncargos} fetchClientesAsociados={fetchClientesAsociados} data={data} fetchInmuebleMoreInfo={fetchInmuebleMoreInfo} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                            </div>
                                        </div>
                                    )}

                                    <div className={`flex flex-col h-full rounded-2xl gap-6 ${data.inmueble.noticiastate ? 'w-full' : 'w-1/2'} overflow-y-scroll comentariosdivcontainer`}>
                                        {transaccionesHistory && transaccionesHistory.length > 0 && (
                                            <div className='flex flex-row h-auto rounded-2xl'>
                                                <TransactionHistory inmuebleID={inmuebleId} transaccionesHistory={transaccionesHistory} fetchTransacciones={fetchTransacciones} />
                                            </div>
                                        )}
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            <ComentariosDetails data={data} inmuebleId={id} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} screenWidth={screenWidth} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <Button onClick={onClose} appearance="secondary" className='m-auto' style={{ padding: '0.5rem 1rem' }}>
                                Cerrar
                            </Button>
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
                            <div className={`w-full h-auto flex flex-row gap-4 ${screenWidth <= 1280 ? 'flex-col' : ''}`}>

                                <div ref={divRef} className={`rounded-xl h-full flex  gap-4 ${screenWidth <= 1280 ? 'flex-row w-full' : 'flex-col w-1/3 '} ${screenWidth <= 1000 && 'hidden'}`}>
                                    {/* Slider Component */}
                                    <DesktopSliderComponent data={data} encargoData={encargoData} images={images} screenWidth={screenWidth} />

                                    <div className='flex flex-col gap-6 w-full h-auto rounded-2xl shadow-lg bg-slate-50 p-8'>
                                        <DesktopAdditionalInfo data={data} encargoData={encargoData} isVisible={isVisible} setIsVisible={setIsVisible} screenWidth={screenWidth} inmuebles_asociados_informador={inmuebles_asociados_informador} inmuebles_asociados_inquilino={inmuebles_asociados_inquilino} inmuebles_asociados_propietario={inmuebles_asociados_propietario} nombre={nombre} apellido={apellido} inmuebleId={data.inmueble.id} />
                                        <div className={`w-full bg-white border-blue-400 border-2 p-6 gap-4 rounded-2xl shadow-md flex flex-col ${screenWidth <= 1280 && 'hidden'}`}>
                                            <DetailsInfoTwo data={data} descripcion={descripcion} setDescripcion={setDescripcion} newDescripcion={newDescripcion} setNewDescripcion={setNewDescripcion} screenWidth={screenWidth} />
                                        </div>
                                        <div className={`flex flex-row items-start gap-6 w-full h-auto rounded-2xl ${screenWidth <= 1280 && 'hidden'}`}>
                                            <DetailsInfoThree data={data} isVisible={isVisible} screenWidth={screenWidth} />
                                        </div>
                                    </div>
                                </div>
                                <div ref={divRef} className={`rounded-xl h-full flex gap-4 flex-col ${screenWidth > 1000 && 'hidden'}`}>
                                    {/* Slider Component */}
                                    <DesktopSliderComponent data={data} encargoData={encargoData} images={images} screenWidth={screenWidth} />

                                    <div className={`flex flex-row gap-6 w-full h-auto rounded-2xl shadow-lg bg-slate-50 p-8 ${screenWidth < 780 && 'hidden'}`}>
                                        <div className='flex flex-col gap-6 w-1/2 h-full rounded-2xl '>
                                            <DesktopAdditionalInfo data={data} encargoData={encargoData} isVisible={isVisible} setIsVisible={setIsVisible} screenWidth={screenWidth} inmuebles_asociados_informador={inmuebles_asociados_informador} inmuebles_asociados_inquilino={inmuebles_asociados_inquilino} inmuebles_asociados_propietario={inmuebles_asociados_propietario} nombre={nombre} apellido={apellido} inmuebleId={data.inmueble.id} />
                                            <div className={`w-full bg-white border-blue-400 border-2 p-6 gap-4 rounded-2xl shadow-md flex flex-col`}>
                                                <DetailsInfoTwo data={data} descripcion={descripcion} setDescripcion={setDescripcion} newDescripcion={newDescripcion} setNewDescripcion={setNewDescripcion} screenWidth={screenWidth} />
                                            </div>
                                        </div>
                                        <div className='w-1/2 flex flex-col gap-6 h-auto rounded-2xl'>
                                            <div className={`flex flex-row items-start gap-6 w-full h-auto rounded-2xl`}>
                                                <DetailsInfoThree data={data} isVisible={isVisible} screenWidth={screenWidth} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`flex flex-col gap-6 w-full h-auto rounded-2xl shadow-lg bg-slate-50 p-8 ${screenWidth >= 780 && 'hidden'}`}>
                                        <div className={`flex gap-6 ${screenWidth < 705 ? 'flex-col items-end' : 'flex-row items-end'}`}>
                                            <div className={`flex flex-col gap-6 h-full rounded-2xl ${screenWidth < 705 ? 'w-full' : 'w-1/2'}`}>
                                                <DesktopAdditionalInfo data={data} encargoData={encargoData} isVisible={isVisible} setIsVisible={setIsVisible} screenWidth={screenWidth} inmuebles_asociados_informador={inmuebles_asociados_informador} inmuebles_asociados_inquilino={inmuebles_asociados_inquilino} inmuebles_asociados_propietario={inmuebles_asociados_propietario} nombre={nombre} apellido={apellido} inmuebleId={data.inmueble.id} />
                                            </div>
                                            <div className={`w-full bg-white border-blue-400 border-2 gap-4 rounded-2xl shadow-md flex flex-col min-h-[258px] ${screenWidth < 650 ? 'p-0' : 'p-2'}`}>
                                                <DetailsInfoTwo data={data} descripcion={descripcion} setDescripcion={setDescripcion} newDescripcion={newDescripcion} setNewDescripcion={setNewDescripcion} screenWidth={screenWidth} />
                                            </div>
                                        </div>
                                        <div className={`flex flex-row items-start gap-6 w-full h-auto rounded-2xl`}>
                                            <DetailsInfoThree data={data} isVisible={isVisible} screenWidth={screenWidth} />
                                        </div>
                                    </div>
                                </div>


                                <div className={`${(screenWidth >= 1280 || screenWidth < 1000) && 'hidden'} flex flex-row gap-6 w-full h-auto rounded-2xl shadow-lg bg-slate-50 p-8`}>
                                    <div className={`w-1/3 bg-white border-blue-400 border-2 p-6 gap-4 rounded-2xl shadow-md flex flex-col ${screenWidth <= 1280 && ''}`}>
                                        <DetailsInfoTwo data={data} descripcion={descripcion} setDescripcion={setDescripcion} newDescripcion={newDescripcion} setNewDescripcion={setNewDescripcion} screenWidth={screenWidth} />
                                    </div>
                                    <div className={`flex flex-row items-start gap-6 w-2/3 h-auto rounded-2xl ${screenWidth <= 1280 && ''}`}>
                                        <DetailsInfoThree data={data} isVisible={isVisible} screenWidth={screenWidth} />
                                    </div>
                                </div>

                                <div className={`flex flex-row gap-6 rounded-2xl w-2/3 overflow-y-hidden ${screenWidth <= 1280 && 'hidden'}`} style={{ maxHeight: `${divHeight}px` }}>
                                    <div className={`flex flex-col justify-start rounded-lg gap-6 w-1/2 overflow-y-scroll`} style={{ maxHeight: `${divHeight}px` }}>
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            <ClientesAsociados fetchClientesEncargos={fetchClientes} setFilteredClientes={setFilteredClientes} setClientesAsociadosInmueble={setClientesAsociadosInmueble} refreshMatchingClientesEncargos={refreshMatchingClientesEncargos} setRefreshMatchingClientesEncargos={setRefreshMatchingClientesEncargos} fetchClientesAsociados={fetchClientesAsociados} setClientesAsociados={setClientesAsociados} clientesAsociados={clientesAsociados} clientesAsociadosInmueble={clientesAsociadosInmueble} filteredClientes={filteredClientes} inmuebleId={data.inmueble.id} inmuebleDireccion={data.inmueble.direccion} screenWidth={screenWidth} setFetchClientPhoneNumberRefreshKey={setFetchClientPhoneNumberRefreshKey} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} localizadoRefreshKey={localizadoRefreshKey} setLocalizadoRefreshKey={setLocalizadoRefreshKey} />
                                        </div>

                                        <div className='flex flex-col w-full h-fit rounded-2xl gap-6 ease-in-out '>
                                            <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                                <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                            </div>
                                            {data.inmueble.noticiastate && (
                                                <div className='flex flex-row h-fit rounded-2xl'>
                                                    <EncargosDetails fetchTransacciones={fetchTransacciones} fetchClientes={fetchClientes} clienteOptions={clienteOptions} setClienteOptions={setClienteOptions} refreshMatchingClientesEncargos={refreshMatchingClientesEncargos} fetchClientesAsociados={fetchClientesAsociados} data={data} fetchInmuebleMoreInfo={fetchInmuebleMoreInfo} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                                </div>
                                            )}
                                        </div>

                                        {data.inmueble.DPV && (
                                            <div className='flex flex-row h-fit rounded-2xl shadow-lg'>
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


                                <div className={`flex flex-row gap-6 rounded-2xl w-full overflow-y-hidden mt-2 ${(screenWidth > 1280 || screenWidth <= 1150) && 'hidden'}`}>

                                    <div className='flex flex-col gap-6 h-fit w-1/3 rounded-2xl overflow-y-scroll  max-h-[1250px]'>
                                        <ClientesAsociados fetchClientesEncargos={fetchClientes} setFilteredClientes={setFilteredClientes} setClientesAsociadosInmueble={setClientesAsociadosInmueble} refreshMatchingClientesEncargos={refreshMatchingClientesEncargos} setRefreshMatchingClientesEncargos={setRefreshMatchingClientesEncargos} fetchClientesAsociados={fetchClientesAsociados} setClientesAsociados={setClientesAsociados} clientesAsociados={clientesAsociados} clientesAsociadosInmueble={clientesAsociadosInmueble} filteredClientes={filteredClientes} inmuebleId={data.inmueble.id} inmuebleDireccion={data.inmueble.direccion} screenWidth={screenWidth} setFetchClientPhoneNumberRefreshKey={setFetchClientPhoneNumberRefreshKey} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} localizadoRefreshKey={localizadoRefreshKey} setLocalizadoRefreshKey={setLocalizadoRefreshKey} />
                                        {data.inmueble.DPV && (
                                            <div className='flex flex-row h-fit rounded-2xl shadow-lg'>
                                                <DPVInfoComponent DPVInfo={DPVInfo} />
                                            </div>
                                        )}
                                    </div>

                                    <div className='flex flex-col w-1/3 h-fit rounded-2xl gap-6 ease-in-out overflow-y-scroll max-h-[1220px]'>
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                        </div>
                                        {data.inmueble.noticiastate && (
                                            <div className='flex flex-row h-fit rounded-2xl shadow-lg'>
                                                <EncargosDetails fetchTransacciones={fetchTransacciones} fetchClientes={fetchClientes} clienteOptions={clienteOptions} setClienteOptions={setClienteOptions} refreshMatchingClientesEncargos={refreshMatchingClientesEncargos} fetchClientesAsociados={fetchClientesAsociados} data={data} fetchInmuebleMoreInfo={fetchInmuebleMoreInfo} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                            </div>
                                        )}
                                    </div>

                                    <div className={`flex flex-col h-fit rounded-2xl gap-6 w-1/3 overflow-y-scroll comentariosdivcontainer max-h-[1220px]`}>
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            <ComentariosDetails data={data} inmuebleId={id} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} screenWidth={screenWidth} />
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex flex-row gap-6 rounded-2xl w-full overflow-y-hidden mt-2 ${(screenWidth < 780 || screenWidth > (1150)) && 'hidden'}`}>

                                    <div className='flex flex-col gap-6 h-fit w-1/2 rounded-2xl overflow-y-scroll  max-h-full'>
                                        <div>
                                            <ClientesAsociados fetchClientesEncargos={fetchClientes} setFilteredClientes={setFilteredClientes} setClientesAsociadosInmueble={setClientesAsociadosInmueble} refreshMatchingClientesEncargos={refreshMatchingClientesEncargos} setRefreshMatchingClientesEncargos={setRefreshMatchingClientesEncargos} fetchClientesAsociados={fetchClientesAsociados} setClientesAsociados={setClientesAsociados} clientesAsociados={clientesAsociados} clientesAsociadosInmueble={clientesAsociadosInmueble} filteredClientes={filteredClientes} inmuebleId={data.inmueble.id} inmuebleDireccion={data.inmueble.direccion} screenWidth={screenWidth} setFetchClientPhoneNumberRefreshKey={setFetchClientPhoneNumberRefreshKey} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} localizadoRefreshKey={localizadoRefreshKey} setLocalizadoRefreshKey={setLocalizadoRefreshKey} />
                                        </div>
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                        </div>
                                        {data.inmueble.noticiastate && (
                                            <div className='flex flex-row h-fit rounded-2xl shadow-lg'>
                                                <EncargosDetails fetchTransacciones={fetchTransacciones} fetchClientes={fetchClientes} clienteOptions={clienteOptions} setClienteOptions={setClienteOptions} refreshMatchingClientesEncargos={refreshMatchingClientesEncargos} fetchClientesAsociados={fetchClientesAsociados} data={data} fetchInmuebleMoreInfo={fetchInmuebleMoreInfo} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                            </div>
                                        )}
                                        {data.inmueble.DPV && (
                                            <div className='flex flex-row h-fit rounded-2xl shadow-lg'>
                                                <DPVInfoComponent DPVInfo={DPVInfo} />
                                            </div>
                                        )}
                                    </div>


                                    <div className={`flex flex-col h-fit rounded-2xl gap-6 w-1/2 overflow-y-scroll comentariosdivcontainer max-h-full`}>
                                        <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                            <ComentariosDetails data={data} inmuebleId={id} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} screenWidth={screenWidth} />
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex flex-col gap-6 rounded-2xl w-full overflow-y-hidden mt-2 ${screenWidth > 780 && 'hidden'}`}>
                                    <div>
                                        <ClientesAsociados fetchClientesEncargos={fetchClientes} setFilteredClientes={setFilteredClientes} setClientesAsociadosInmueble={setClientesAsociadosInmueble} fetchClientesAsociados={fetchClientesAsociados} setClientesAsociados={setClientesAsociados} clientesAsociados={clientesAsociados} clientesAsociadosInmueble={clientesAsociadosInmueble} filteredClientes={filteredClientes} inmuebleId={data.inmueble.id} inmuebleDireccion={data.inmueble.direccion} screenWidth={screenWidth} setFetchClientPhoneNumberRefreshKey={setFetchClientPhoneNumberRefreshKey} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} localizadoRefreshKey={localizadoRefreshKey} setLocalizadoRefreshKey={setLocalizadoRefreshKey} />
                                    </div>
                                    <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                        <NoticiasDetails data={data} setOnAddNoticiaRefreshKey={setOnAddNoticiaRefreshKey} onAddNoticiaRefreshKey={onAddNoticiaRefreshKey} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                    </div>
                                    {data.inmueble.noticiastate && (
                                        <div className='flex flex-row h-fit rounded-2xl shadow-lg'>
                                            <EncargosDetails fetchTransacciones={fetchTransacciones} fetchClientes={fetchClientes} clienteOptions={clienteOptions} setClienteOptions={setClienteOptions} refreshMatchingClientesEncargos={refreshMatchingClientesEncargos} fetchClientesAsociados={fetchClientesAsociados} data={data} fetchInmuebleMoreInfo={fetchInmuebleMoreInfo} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} screenWidth={screenWidth} />
                                        </div>
                                    )}
                                    {data.inmueble.DPV && (
                                        <div className='flex flex-row h-fit rounded-2xl shadow-lg'>
                                            <DPVInfoComponent DPVInfo={DPVInfo} />
                                        </div>
                                    )}

                                    <div className='flex flex-row h-auto rounded-2xl shadow-lg'>
                                        <ComentariosDetails data={data} inmuebleId={id} fetchClientPhoneNumberRefreshKey={fetchClientPhoneNumberRefreshKey} screenWidth={screenWidth} />
                                    </div>

                                </div>


                            </div>
                        </>
                    )}
                    {screenWidth <= 1660 && (
                        <Button onClick={onClose} appearance="secondary" className='m-auto' style={{ padding: '0.5rem 1rem' }}>
                            Cerrar
                        </Button>
                    )}
                </>
            )
            }

        </div >
    );
};

export default ItemDetails;
