import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AiOutlineClose, AiOutlinePlus } from 'react-icons/ai';
import './moreinfoslider.css';

const icon = L.icon({ iconUrl: "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] });


const DesktopSliderComponent = ({ data, encargoData, images }) => {
    const [loaded, setLoaded] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
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

    function Arrow(props) {
        const disabled = props.disabled ? ' arrow--disabled' : '';
        return (
            <svg onClick={props.onClick} className={`arrow ${props.left ? 'arrow--left' : 'arrow--right'} ${disabled}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                {props.left && <path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />}
                {!props.left && <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z" />}
            </svg>
        );
    }

    const [showMap, setShowMap] = useState(false);

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

    useEffect(() => {
        console.log('encargoData', encargoData);
    }, [encargoData]);


    return (
        <>
            {images.length > 0 ? (
                <div ref={sliderRef} className="keen-slider h-[400px] rounded-2xl shadow-lg w-full flex relative">
                    <div className='bg-white absolute top-5 right-5 flex flex-row gap-2 items-center justify-center px-3 py-2 rounded-3xl hover:bg-slate-900 cursor-pointer group z-[99]' onClick={toggleMap}>
                        <Icon icon="solar:map-outline" className='text-slate-900 text-2xl font-bold group-hover:text-white' />
                        <p className='font-sans text-slate-900 font-bold text-sm group-hover:text-white'>Abrir Mapa</p>
                    </div>

                    {images.map((image, index) => (
                        <div key={index} className="keen-slider__slide moreinfoslider h-full w-full flex justify-center items-center">
                            <img src={`data:${image.type};base64,${image.data}`} alt={`Slide ${index}`} className="w-full h-full object-center object-cover" />
                        </div>
                    ))}
                    {loaded && slider.current && (
                        <>
                            <Arrow left onClick={(e) => e.stopPropagation() || slider.current?.prev()} disabled={currentSlide === 0} />

                            <Arrow onClick={(e) => e.stopPropagation() || slider.current?.next()} disabled={currentSlide === slider.current.track.details.slides.length - 1} />
                        </>
                    )}
                </div>
            ) : (
                <div className='h-[800px] rounded-lg w-[90%] shadow-lg flex'>
                    <div className="keen-slider__slide h-full flex flex-col gap-2 justify-center items-center w-full bg-slate-100 rounded-lg">
                        <div className='min-w-[770.234px] h-full flex flex-col gap-2 justify-center items-center'>
                            <Icon icon="fluent:camera-off-16-regular" className='text-4xl' />
                            <p>No hay imágenes</p>
                        </div>
                    </div>
                </div>
            )}
            {showMap && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-80 w-full h-full flex items-center justify-center z-[100]">
                    <div className="flex flex-col justify-center items-center z-50 h-full w-full relative">
                        <div className='w-[calc(100%-5rem)] ml-auto bg-white rounded-xl p-4 flex flex-row items-center justify-center absolute top-0 right-0 z-[999]'>
                            <div className="flex flex-row items-center justify-between h-auto rounded-xl w-full">
                                <h1 className="text-sm font-md text-start w-full leading-6">
                                    {data.inmueble.direccion} <br />
                                    {location} &nbsp;&nbsp; {data.inmueble.tipo} &nbsp;&nbsp; {data.inmueble.superficie} m²
                                </h1>
                                <h1 className="text-sm font-md text-start w-full leading-6">
                                    Zona: {data.inmueble.zona ? data.inmueble.zona : 'N/A'} &nbsp;&nbsp; Responsable: {data.inmueble.responsable ? data.inmueble.responsable : 'N/A'}
                                </h1>
                            </div>
                            <button onClick={toggleMap} className="absolute top-7 right-5 text-gray-900 text-3xl z-50">
                                <AiOutlineClose />
                            </button>
                        </div>
                        <MapContainer center={centerCoordinates} zoom={17} style={{ height: '100%', width: '100%', zIndex: 20 }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                            <Marker position={centerCoordinates} icon={icon}>
                                <Popup> Dirección: {data.inmueble.direccion} <br /> Zona: {data.inmueble.zona ? data.inmueble.zona : 'N/A'} <br /> Responsable: {data.inmueble.responsable ? data.inmueble.responsable : 'N/A'} </Popup>
                            </Marker>
                        </MapContainer>
                    </div >
                </div >
            )}
        </>

    );

};

export default DesktopSliderComponent;
