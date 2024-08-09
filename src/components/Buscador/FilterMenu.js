import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/supabaseClient.js';
import Select from 'react-select';
import axios from 'axios';
import Slider from 'react-slider';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import FontAwesome CSS
import '../../../fontawesome'; // Import the configuration file
import './filterStyles.css';
import { FaHouseChimneyUser } from "react-icons/fa6";
import { FaPhone } from "react-icons/fa6";

const FilterMenu = ({ setFilters, currentPage, filters, data, setData, setCurrentPage, setTotalPages, setLoading, resetFiltersKey }) => {
    const [filterLocalizado, setFilterLocalizado] = useState(null);
    const [selectedZone, setSelectedZone] = useState(null);
    const [selectedResponsable, setSelectedResponsable] = useState(null);
    const [filterNoticia, setFilterNoticia] = useState(null);
    const [filterEncargo, setFilterEncargo] = useState(null);
    const [superficieRange, setSuperficieRange] = useState([0, 1000]);
    const [yearRange, setYearRange] = useState([1850, new Date().getFullYear()]);
    const [zones, setZones] = useState([]);
    const [responsables, setResponsables] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [selectedCategoria, setSelectedCategoria] = useState(null);


    const handleChangeSuperficieRange = (values) => {
        setSuperficieRange(values);
    };

    const handleChangeYearRange = (values) => {
        setYearRange(values);
    };

    const filterOptionsNoticia = [
        { value: true, label: 'Con noticias' },
        { value: false, label: 'Sin noticias' },
    ];
    const filterOptionsEncargo = [
        { value: true, label: 'Con encargos' },
        { value: false, label: 'Sin encargos' },
    ];
    const filterLocalizadoOptions = [
        { value: true, label: 'Localizado' },
        { value: false, label: 'Sin localizar' },
    ];

    useEffect(() => {
        console.log('Filters:', {
            selectedZone: selectedZone?.value || '',
            selectedResponsable: selectedResponsable?.value || '',
            selectedCategoria: selectedCategoria?.value || '',
            filterNoticia,
            filterEncargo,
            superficieMin: superficieRange[0],
            superficieMax: superficieRange[1],
            yearMin: yearRange[0],
            yearMax: yearRange[1],
            localizado: filterLocalizado,
        });
    }, [filterLocalizado, selectedZone, selectedResponsable, selectedCategoria, filterNoticia, filterEncargo, superficieRange, yearRange]);


    const zoneOptions = zones.map((zone) => ({ value: zone, label: zone }));
    const responsableOptions = responsables.map((responsable) => ({ value: responsable.nombre_completo, label: responsable.nombre_completo }));
    const categoriaOptions = categorias.map((categoria) => ({ value: categoria, label: categoria }));
    console.log('categoriaOptions', categoriaOptions);

    // Fetch zones and responsables
    const fetchOptions = async () => {
        try {
            const { data, error } = await supabase.rpc('fetchdatafiltermenu');
            console.log('data', data); // Debugging line
            setZones(data.zones);
            setResponsables(data.responsables);
            setCategorias(data.categorias);

            if (error) {
                throw new Error(error.message);
            }

        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        setFilters({
            selectedZone: selectedZone?.value || '',
            selectedResponsable: selectedResponsable?.value || '',
            selectedCategoria: selectedCategoria?.value || '',
            filterNoticia: filterNoticia !== null ? filterNoticia : null,
            filterEncargo: filterEncargo !== null ? filterEncargo : null,
            superficieMin: superficieRange[0],
            superficieMax: superficieRange[1],
            yearMin: yearRange[0],
            yearMax: yearRange[1],
            localizado: filterLocalizado,
        });
    }, [filterLocalizado, selectedZone, selectedResponsable, selectedCategoria, filterNoticia, filterEncargo, superficieRange, yearRange, setFilters]);

    const resetFilters = () => {
        setFilterLocalizado(null);
        setSelectedZone(null);
        setSelectedResponsable(null);
        setSelectedCategoria(null);
        setFilterNoticia(null); // Assuming the default is false
        setFilterEncargo(null); // Assuming the default is false
        setSuperficieRange([0, 1000]);
        setYearRange([1900, new Date().getFullYear()]);
    };


    useEffect(() => {
        resetFilters();
    }, [resetFiltersKey]);

    // Handler for Filter Noticia Change
    const handleFilterNoticiaChange = (selectedOption) => {
        setFilterNoticia(selectedOption ? selectedOption.value : null);
    };

    // Handler for Filter Encargo Change
    const handleFilterEncargoChange = (selectedOption) => {
        setFilterEncargo(selectedOption ? selectedOption.value : null);
    };
    const handleFilterLocalizadoChange = (selectedOption) => {
        setFilterLocalizado(selectedOption ? selectedOption.value : null);
    };

    return (
        <div className="flex flex-col gap-4 p-2">
            {/* Alphabetical Order Select */}
            <div className="flex flex-row gap-2 w-full items-center justify-center orderbyanimation z-[990]">
                <Select
                    options={filterLocalizadoOptions}
                    onChange={handleFilterLocalizadoChange}
                    value={filterLocalizadoOptions.find((option) => option.value === filterLocalizado) || null}
                    className="w-full z-[999]"
                    placeholder={
                        <span className="flex flex-row justify-start items-center gap-3 text-black">
                            <FaPhone className='text-xl' />
                            Localizado
                        </span>
                    }
                />

                <Select
                    options={categoriaOptions}
                    onChange={setSelectedCategoria}
                    value={selectedCategoria}
                    placeholder={
                        <span className="flex flex-row justify-start items-center gap-3 text-black">
                            <FaHouseChimneyUser className="text-2xl" />
                            Categoría
                        </span>
                    }
                    className="rightanimation1 w-full"
                />
            </div>

            <div className="flex flex-row gap-2 w-full items-center justify-center z-[980]">
                {/* Zone Select */}
                <Select
                    options={zoneOptions}
                    onChange={setSelectedZone}
                    value={selectedZone}
                    placeholder={
                        <span className="flex flex-row justify-start items-center gap-3 text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                                <path fill="currentColor" d="m12 17l1-2V9.858c1.721-.447 3-2 3-3.858c0-2.206-1.794-4-4-4S8 3.794 8 6c0 1.858 1.279 3.411 3 3.858V15zM10 6c0-1.103.897-2 2-2s2 .897 2 2s-.897 2-2 2s-2-.897-2-2" />
                                <path
                                    fill="currentColor"
                                    d="m16.267 10.563l-.533 1.928C18.325 13.207 20 14.584 20 16c0 1.892-3.285 4-8 4s-8-2.108-8-4c0-1.416 1.675-2.793 4.267-3.51l-.533-1.928C4.197 11.54 2 13.623 2 16c0 3.364 4.393 6 10 6s10-2.636 10-6c0-2.377-2.197-4.46-5.733-5.437"
                                />
                            </svg>
                            Zona
                        </span>
                    }
                    className="leftanimation1 w-full z-[900]"
                />

                {/* Responsable Select */}
                <Select
                    options={responsableOptions}
                    onChange={setSelectedResponsable}
                    value={selectedResponsable}
                    placeholder={
                        <span className="flex flex-row justify-start items-center gap-3 text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 48 48">
                                <g fill="none">
                                    <path d="M0 0h48v48H0z" />
                                    <path fill="currentColor" fill-rule="evenodd" d="M34 16c0 5.523-4.477 10-10 10s-10-4.477-10-10S18.477 6 24 6s10 4.477 10 10m-2 0a8 8 0 1 1-16 0a8 8 0 0 1 16 0" clip-rule="evenodd" />
                                    <path
                                        fill="currentColor"
                                        d="M30.5 28a.48.48 0 0 0-.54.262L26 39.572V36l-.575-4.021a1 1 0 0 0 .764-.736l.5-2A1 1 0 0 0 25.72 28h-3.438a1 1 0 0 0-.97 1.242l.5 2a1 1 0 0 0 .764.737L22 36v2.696l-3.96-10.434A.48.48 0 0 0 17.5 28a139 139 0 0 1-1.148.272c-2.262.53-5.058 1.184-6.544 2.16C8.045 31.589 7 32.953 7 34.5V41h34v-6.5c0-1.547-1.045-2.91-2.808-4.068c-1.486-.976-4.282-1.63-6.544-2.16c-.403-.094-.79-.184-1.148-.272"
                                    />
                                </g>
                            </svg>
                            Asesor
                        </span>
                    }
                    className="rightanimation1 w-full"
                />
            </div>

            <div className="flex flex-row gap-2 w-full items-center justify-center z-[970]">
                {/* Filter Noticia Select */}
                <Select
                    options={filterOptionsNoticia}
                    onChange={handleFilterNoticiaChange}
                    value={filterOptionsNoticia.find((option) => option.value === filterNoticia) || null}
                    placeholder={
                        <span className="flex flex-row justify-start items-center gap-3 text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M10 7h4V5.615q0-.269-.173-.442T13.385 5h-2.77q-.269 0-.442.173T10 5.615zm8 15q-1.671 0-2.835-1.164Q14 19.67 14 18t1.165-2.835T18 14t2.836 1.165T22 18t-1.164 2.836T18 22M4.615 20q-.69 0-1.153-.462T3 18.384V8.616q0-.691.463-1.153T4.615 7H9V5.615q0-.69.463-1.153T10.616 4h2.769q.69 0 1.153.462T15 5.615V7h4.385q.69 0 1.152.463T21 8.616v4.198q-.683-.414-1.448-.614T18 12q-2.496 0-4.248 1.752T12 18q0 .506.086 1.009t.262.991zM18 20.423q.2 0 .33-.13t.132-.331t-.131-.331T18 19.5t-.33.13t-.132.332t.131.33t.331.131m-.385-1.846h.77v-3h-.77z"
                                />
                            </svg>
                            Noticia
                        </span>
                    }
                    className="leftanimation2 w-full"
                />

                {/* Filter Encargo Select */}
                <Select
                    options={filterOptionsEncargo}
                    onChange={handleFilterEncargoChange}
                    value={filterOptionsEncargo.find((option) => option.value === filterEncargo) || null}
                    placeholder={
                        <span className="flex flex-row justify-start items-center gap-3 text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.75em" viewBox="0 0 20 20">
                                <path
                                    fill="currentColor"
                                    d="M2 3a1 1 0 0 1 2 0h13a1 1 0 1 1 0 2H4v12.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 5 13.5zm3 7a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-2.55a1 1 0 0 0-.336-.748L11.332 8.13a.5.5 0 0 0-.664 0L8.336 10.2a1 1 0 0 0-.336.75z"
                                />
                            </svg>
                            Encargo
                        </span>
                    }
                    className="rightanimation2 w-full"
                />
            </div>
            {/* Superficie Range */}
            <div className="slideranimation1 flex flex-col py-3 px-4 w-full justify-center items-center bg-white border border-gray-300 rounded-lg shadow-md">
                <h2 className="font-sans text-gray-700 text-center">Superfície</h2>
                <div className="flex flex-row gap-8 justify-center mb-2 text-gray-700">
                    <span>Min: {superficieRange[0]} m²</span>
                    <span>Max: {superficieRange[1]} m²</span>
                </div>
                <Slider
                    min={0}
                    max={2000}
                    step={1}
                    value={superficieRange}
                    onChange={handleChangeSuperficieRange}
                    className="relative flex items-center w-full h-6"
                    trackClassName="absolute bg-blue-200 h-1 rounded"
                    thumbClassName="relative block w-6 h-6 bg-blue-500 rounded-full cursor-pointer"
                    ariaLabel={['Min value', 'Max value']}
                />
            </div>

            {/* Year Range */}
            <div className="flex flex-col py-3 px-4 w-full justify-center items-center bg-white border border-gray-300 rounded-lg shadow-md slideranimation2">
                <h2 className="font-sans text-gray-700 text-center">Año de construcción</h2>

                <div className="flex flex-row gap-4 justify-center mb-2 text-gray-700">
                    <span>{yearRange[0]}</span>
                    <span>a</span>
                    <span>{yearRange[1]}</span>
                </div>
                <Slider
                    min={1900}
                    max={new Date().getFullYear()}
                    step={1}
                    value={yearRange}
                    onChange={handleChangeYearRange}
                    className="relative flex items-center w-full h-6"
                    trackClassName="absolute bg-blue-200 h-1 rounded"
                    thumbClassName="relative block w-6 h-6 bg-blue-500 rounded-full cursor-pointer"
                    ariaLabel={['Start Year', 'End Year']}
                />
            </div>
        </div>
    );
};

export default FilterMenu;
