import React, { use, useEffect, useState, useRef, useCallback } from 'react';
// import ItemDetails from './itemDetails/ItemDetails.jsx';
import dynamic from 'next/dynamic';
const AddNewInmueble = dynamic(() => import('./AddNewInmueble'), { ssr: false });
import LoadingScreen from '../LoadingScreen/LoadingScreen.js';
import Toastify from 'toastify-js';
import './stylesBuscador.css';
import axios from 'axios';
import FilterMenu from './FilterMenu.js';
import { IoAnalytics } from "react-icons/io5";
import Analytics from './Analytics.js';
import SmallLoadingScreen from '../LoadingScreen/SmallLoadingScreen.js';
import Select from 'react-select';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Icon } from '@iconify/react';
import MoreInfo from '../MoreInfo/MoreInfo.js';
import { AiOutlineLoading } from "react-icons/ai";
import BuscadorTabs from './TabsBuscador.js';
import { Accordion, Panel, Checkbox, Modal, Button, RadioGroup, Radio, SelectPicker } from 'rsuite';
import { FaArrowLeft } from "react-icons/fa6";




const Table = ({ parentsEdificioProps, admin, screenWidth, loadingLoader }) => {
    const [expanded, setExpanded] = useState(false);
    const [expandedEscalera, setExpandedEscalera] = useState(false);
    const [expandedEscaleraId, setExpandedEscaleraId] = useState(null);
    const contentRef = useRef(null);
    const [contentHeight, setContentHeight] = useState(0);
    const [expandedItems, setExpandedItems] = useState({});
    const [expandedItemsEscalera, setExpandedItemsEscalera] = useState({});


    //     <div className="cursor-pointer flex flex-row justify-center w-[30%]">
    //     {!expandedItems[item.EdificioID] && (
    //         <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24">
    //             <path fill="currentColor" fillRule="evenodd" d="M7 9a1 1 0 0 0-.707 1.707l5 5a1 1 0 0 0 1.414 0l5-5A1 1 0 0 0 17 9z" clipRule="evenodd" />
    //         </svg>
    //     )}
    //     {expandedItems[item.EdificioID] && (
    //         <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24">
    //             <path fill="currentColor" d="M18.2 13.3L12 7l-6.2 6.3c-.2.2-.3.5-.3.7s.1.5.3.7c.2.2.4.3.7.3h11c.3 0 .5-.1.7-.3c.2-.2.3-.5.3-.7s-.1-.5-.3-.7" />
    //         </svg>
    //     )}
    // </div>

    // </div>
    // {expandedItems[item.EdificioID] && edifciosChildren(item)}
    // </div>

    //     onClick={() => handleToggle(item.EdificioID)}>

    //     const [expandedItems, setExpandedItems] = useState({});

    //     const handleToggle = (itemId) => {
    //         setExpandedItems((prev) => ({
    //             ...prev,
    //             [itemId]: !prev[itemId],
    //         }));
    //     };

    //     {expandedItems[child.id] && (
    //         console.log('child.nestedInmuebles', child.nestedinmuebles)
    //     )}
    //     {expandedItems[child.id] && <div className="w-full flex flex-col justify-center items-center px-2">{escalerasChildren(child.nestedinmuebles)}</div>}
    // </div>

    const handleToggle = (edificioId) => {
        setExpandedItems(prevState => ({
            ...prevState,
            [edificioId]: !prevState[edificioId],
        }));
    };
    const handleToggleEscalera = (escaleraId) => {
        setExpandedItemsEscalera(prevState => ({
            ...prevState,
            [escaleraId]: !prevState[escaleraId],
        }));
    };


    useEffect(() => {
        console.log('expandedItems', expandedItems);
    }, [expandedItems]);



    useEffect(() => {
        if (contentRef.current) {
            let totalHeight = contentRef.current.scrollHeight;

            // If the escalera is expanded, add its height
            if (expandedEscalera) {
                const escaleraContent = contentRef.current.querySelector('.escalera-content');
                if (escaleraContent) {
                    totalHeight += escaleraContent.scrollHeight;
                }
            }

            console.log('totalheight', totalHeight);

            setContentHeight(totalHeight);
        }
    }, [expanded, expandedEscalera]);



    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(30);
    const [searchTerm, setSearchTerm] = useState('');
    const [childsEscalera, setChildsEscalera] = useState([]);
    const [childsEdificio, setChildsEdificio] = useState([]);
    const [parentsEscalera, setParentsEscalera] = useState(parentsEdificioProps.escaleras);
    const [parentsEdificio, setParentsEdificio] = useState(parentsEdificioProps.edificios);
    const [showExtraButtons, setShowExtraButtons] = useState(false);
    const [showUngroupButtons, setShowUngroupButtons] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [selectedItemsUngroup, setSelectedItemsUngroup] = useState(new Set());
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupUngroup, setShowPopupUngroup] = useState(false);
    const [showFormType, setShowFormType] = useState(null); // New state to manage form type
    const [formData, setFormData] = useState({
        tipo: '',
        nombre: '',
        existingGroup: '',
        grupo: '',
    });
    const [selectedId, setSelectedId] = useState(null);
    const [showAskForDeleteOrphan, setShowAskForDeleteOrphan] = useState(false);
    const [orphanInfo, setOrphanInfo] = useState([]);
    const [showDeleteInmuebleButtons, setShowDeleteInmuebleButtons] = useState(false);
    const [showAddInmuebleButtons, setShowAddInmuebleButtons] = useState(false);
    const [showPopupDeleteInmueble, setShowPopupDeleteInmueble] = useState(false);
    const [thereAreChildrenDelete, setThereAreChildrenDelete] = useState(false);
    const [keepChildren, setKeepChildren] = useState([]);
    const [parentData, setParentData] = useState([]);
    const [showAddNewInmueble, setShowAddNewInmueble] = useState(false);
    const [showEditTable, setShowEditTable] = useState(false);
    const [showAnimation, setShowAnimation] = useState(showEditTable);
    const [filters, setFilters] = useState({
        selectedZone: '',
        selectedCategoria: '',
        selectedResponsable: '',
        filterNoticia: null,
        filterEncargo: null,
        superficieMin: 0,
        superficieMax: 800000,
        yearMin: 1800,
        yearMax: new Date().getFullYear(),
        localizado: null,
        garaje: undefined,
        aireacondicionado: undefined,
        ascensor: undefined,
        trastero: undefined,
        jardin: undefined,
        terraza: undefined,
        tipo: undefined,
        banos: undefined,
        habitaciones: undefined,
        DPV: null,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [resetFiltersKey, setResetFiltersKey] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [showAnalytics, setShowAnalytics] = useState(false);
    useEffect(() => {
        // Check if window is defined
        if (typeof window !== 'undefined') {
            // Set showAnalytics based on window.innerWidth
            setShowAnalytics(window.innerWidth >= 1280);
        }

        // Function to update showAnalytics on window resize
        const handleResize = () => {
            setShowAnalytics(window.innerWidth >= 1280);
        };

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Clean up the event listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Run only once on mount
    const [analyticsData, setAnalyticsData] = useState([]);
    const [selectedType, setSelectedType] = useState();
    const [options, setOptions] = useState([]);
    const [smallLoadingScreen, setSmallLoadingScreen] = useState(false);
    const [nestedElements, setNestedElements] = useState([]);
    const [loadingTotalItems, setLoadingTotalItems] = useState(false);
    const [showMoreInfo, setShowMoreInfo] = useState(false); // New state for MoreInfo visibility
    const [showModal, setShowModal] = useState(false); // Controls the modal visibility
    const [loadingPage, setLoadingPage] = useState(true);
    const [paginaBuscador, setPaginaBuscador] = useState('Todos'); // Initial tab state


    const fetchData = async (currentPage, searchTerm) => {
        setLoadingPage(true);
        // Function to determine the value for each filter
        const determineFilterValue = (filterValue) => {
            if (typeof filterValue === 'undefined' || filterValue === 'undefined') {
                return 'undefined';
            } else if (isNaN(filterValue) || filterValue === '' || filterValue === null) {
                return 'undefined';
            } else {
                return filterValue;
            }
        };
        // Apply the function to each filter
        let aireacondicionadoValue = determineFilterValue(filters.aireacondicionado);
        let ascensorValue = determineFilterValue(filters.ascensor);
        let garajeValue = determineFilterValue(filters.garaje);
        let jardinValue = determineFilterValue(filters.jardin);
        let terrazaValue = determineFilterValue(filters.terraza);
        let trasteroValue = determineFilterValue(filters.trastero);


        // Always set value to undefined or to inerger value
        const determineFilterValueInterger = (filterValue) => {
            if (typeof filterValue === 'undefined' || filterValue === 'undefined') {
                return 'undefined';
            } else if (isNaN(filterValue) || filterValue === '' || filterValue === null) {
                return 'undefined';
            } else {
                return parseInt(filterValue, 10);
            }
        };
        let tipoValue = determineFilterValueInterger(filters.tipo);
        let banosValue = determineFilterValueInterger(filters.banos);
        let habitacionesValue = determineFilterValueInterger(filters.habitaciones);


        try {
            setLoadingTotalItems(true);
            setLoading(true);
            const params = new URLSearchParams({
                pattern: searchTerm,
                itemsPerPage: 20,
                currentPage: currentPage,
                selectedZone: filters.selectedZone,
                selectedCategoria: filters.selectedCategoria,
                selectedResponsable: filters.selectedResponsable,
                filterNoticia: paginaBuscador === 'Noticias' ? true : filters.filterNoticia,
                filterEncargo: paginaBuscador === 'Encargos' ? true : filters.filterEncargo,
                superficieMin: filters.superficieMin,
                superficieMax: filters.superficieMax,
                yearMin: filters.yearMin,
                yearMax: filters.yearMax,
                localizado: filters.localizado,
                garaje: garajeValue,
                aireacondicionado: aireacondicionadoValue,
                ascensor: ascensorValue,
                trastero: trasteroValue,
                jardin: jardinValue,
                terraza: terrazaValue,
                tipo: tipoValue,
                banos: banosValue,
                habitaciones: habitacionesValue,
                DPV: filters.DPV,
            });
            axios.get('api/searchInmuebles', { params }).then((response) => {
                const data = response.data;
                setData(data.results);
                console.log('searchInmuebles data', data.results);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
                setAnalyticsData(data.analyitics[0]);
                setTotalItems(data.analyitics[0].totalInmuebles);
                setTimeout(() => {
                    setLoadingPage(false);
                }, 1);

            }).catch((error) => {
                console.error('Error fetching data:', error.message || error);
                setLoading(false);
            });

            if (!data) {
                throw new Error("Invalid data format received from the API");
            }

            setLoading(false);
            setLoadingTotalItems(false);



        } catch (error) {
            console.error('Error fetching data:', error.message || error);
            setLoading(false);
        }
    };


    const fetchParentsEdificio = async () => {
        try {
            const { data } = await axios.get('/api/fetch_parents'); // Use axios to fetch parents

            setParentsEdificio(data.edificios || []); // Set the state with fetched data
            setParentsEscalera(data.escaleras || []); // Set the state with fetched data
        } catch (error) {
            console.error('Error fetching parents:', error);
        }
    };

    useEffect(() => {
        fetchParentsEdificio();
    }, []);

    // UseEffect to update options whenever selectedType changes
    useEffect(() => {
        if (selectedType === 'Edificio') {
            setOptions(
                parentsEdificio?.map((parent) => ({
                    value: parent.id,
                    label: parent.direccion,
                })) || []
            );
        } else if (selectedType === 'Escalera') {
            setOptions(
                parentsEscalera?.map((parent) => ({
                    value: parent.id,
                    label: parent.direccion,
                })) || []
            );
        } else if (selectedType === 'undefined' || selectedType === null || selectedType === '') {
            setOptions([]);
        }
    }, [selectedType, parentsEdificio, parentsEscalera]);

    const handleChangeExistingGroup = (selectedOption) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            existingGroup: selectedOption ? selectedOption : '',
        }));
    };


    // OPTIONS AND HANDECHANGE FOR NUEVO GRUPO ESCALERA
    const optionsNuevoGrupoEscalera = parentsEdificio?.map((parent) => ({
        value: parent.id,
        label: parent.direccion,
    }));
    // Handle the change event for react-select
    const handleChange = (selectedOption) => {
        // Update the formData with the selected value
        handleFormChange({
            target: {
                name: 'grupo',
                value: selectedOption ? selectedOption.value : '',
            },
        });
    };


    useEffect(() => {
        const fetchAndSetData = async () => {
            await fetchData(currentPage, searchTerm);
            if (currentPage > totalPages) {
                setCurrentPage(totalPages > 0 ? totalPages : 1); // Ensure currentPage is set to a valid page number
            }
        };
        fetchAndSetData();
    }, [
        currentPage,
        searchTerm,
        filters.selectedZone,
        filters.selectedResponsable,
        filters.selectedCategoria,
        filters.filterNoticia,
        filters.filterEncargo,
        filters.superficieMin,
        filters.superficieMax,
        filters.yearMin,
        filters.yearMax,
        filters.localizado,
        filters.habitaciones,        // Added habitaciones filter
        filters.banos,               // Added banos filter
        filters.tipo,                // Added tipo filter
        filters.aireacondicionado,   // Added aireacondicionado filter
        filters.ascensor,            // Added ascensor filter
        filters.garaje,              // Added garaje filter
        filters.jardin,              // Added jardin filter
        filters.terraza,             // Added terraza filter
        filters.trastero,             // Added trastero filter
        filters.DPV,                 // Added DPV filter
        paginaBuscador,
    ]);


    const handlePrevious = () => {
        if (currentPage > 1) {
            setLoadingPage(true);
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setLoadingPage(true);
            setCurrentPage(currentPage + 1);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchData(1, searchTerm);
        setShowMoreInfo(false); // Close MoreInfo
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchData(1, '');
        handleResetFilters();
        setShowFilters(false);
        setShowMoreInfo(false);
    };


    const handleCheckboxChange = (itemId) => {
        setSelectedItems((prev) => {
            const newSelectedItems = new Set(prev);
            newSelectedItems.has(itemId) ? newSelectedItems.delete(itemId) : newSelectedItems.add(itemId);
            return newSelectedItems;
        });
    };

    const handleCheckboxChangeUngroup = (itemId) => {
        setSelectedItemsUngroup((prev) => {
            const newSelectedItems = new Set(prev);
            newSelectedItems.has(itemId) ? newSelectedItems.delete(itemId) : newSelectedItems.add(itemId);
            return newSelectedItems;
        });
    };

    const handleIconClick = () => {
        setShowExtraButtons(!showExtraButtons);
        if (showUngroupButtons) setShowUngroupButtons(false);
        if (showDeleteInmuebleButtons) setShowDeleteInmuebleButtons(false);
        if (showAddInmuebleButtons) setShowAddInmuebleButtons(false);
        setSelectedItems(new Set());
        setSelectedItemsUngroup(new Set());
    };

    const handleIconClickUngroup = () => {
        setShowUngroupButtons(!showUngroupButtons);
        if (showExtraButtons) setShowExtraButtons(false);
        if (showDeleteInmuebleButtons) setShowDeleteInmuebleButtons(false);
        if (showAddInmuebleButtons) setShowAddInmuebleButtons(false);
        setSelectedItems(new Set());
        setSelectedItemsUngroup(new Set());
    };

    const handleIconDeleteInmueble = () => {
        setShowDeleteInmuebleButtons(!showDeleteInmuebleButtons);
        if (showExtraButtons) setShowExtraButtons(false);
        if (showUngroupButtons) setShowUngroupButtons(false);
        if (showAddInmuebleButtons) setShowAddInmuebleButtons(false);
        setSelectedItems(new Set());
        setSelectedItemsUngroup(new Set());
    };

    const handleIconAddInmueble = () => {
        setShowAddInmuebleButtons(!showAddInmuebleButtons);
        setShowAddNewInmueble(!showAddNewInmueble);
        if (showExtraButtons) setShowExtraButtons(false);
        if (showUngroupButtons) setShowUngroupButtons(false);
        if (showDeleteInmuebleButtons) setShowDeleteInmuebleButtons(false);
    };

    const handlePopupToggle = () => {
        if (selectedItems.size === 0) {
            Toastify({
                text: 'Selecciona un inmueble',
                duration: 2500,
                destination: 'https://github.com/apvarun/toastify-js',
                newWindow: true,
                close: false,
                gravity: 'top', // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    borderRadius: '10px',
                    backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                    textAlign: 'center',
                },
                onClick: function () { }, // Callback after click
            }).showToast();
            return;
        }
        setShowPopup(!showPopup);
        setShowFormType(null); // Reset form type when closing popup
    };

    const ressetSelectedType = () => {
        setSelectedType('');
    };

    useEffect(() => {
        setFormData((prevFormData) => ({
            ...prevFormData, // Preserve the other values in formData
            tipo: selectedType, // Update the 'tipo' field with the value of selectedType
        }));
    }, [selectedType]);


    useEffect(() => {
        ressetSelectedType();
    }, [showFormType]);

    const handlePopupToggleUngroup = () => {
        if (selectedItemsUngroup.size === 0) {
            Toastify({
                text: 'Selecciona un inmueble',
                duration: 2500,
                destination: 'https://github.com/apvarun/toastify-js',
                newWindow: true,
                close: false,
                gravity: 'top', // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    borderRadius: '10px',
                    backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                    textAlign: 'center',
                },
                onClick: function () { }, // Callback after click
            }).showToast();
            return;
        }
        setShowPopupUngroup(!showPopupUngroup);
    };

    const handlePopupToggleDeleteInmueble = async () => {

        if (selectedItems.size === 0) {
            Toastify({
                text: 'Selecciona un inmueble',
                duration: 2500,
                destination: 'https://github.com/apvarun/toastify-js',
                newWindow: true,
                close: false,
                gravity: 'top', // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    borderRadius: '10px',
                    backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                    textAlign: 'center',
                },
                onClick: function () { }, // Callback after click
            }).showToast();
            return;
        }
        try {

            const response = await axios.post('/api/check_children_nested', {
                inmuebles: Array.from(selectedItems) // Transform Set to Array
            });


            if (response.data.empty) {
                setShowPopupDeleteInmueble(!showPopupDeleteInmueble);
            } else {
                setShowPopupDeleteInmueble(!showPopupDeleteInmueble);
                setThereAreChildrenDelete(true);
                setNestedElements(response.data.nestedElements);
            }
        } catch (error) {
            console.error('Error checking nested elements:', error);
            // Handle the error appropriately
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();

        if (showFormType === 'new') {
            if (formData.tipo === '') {
                Toastify({
                    text: 'Debes rellenar los campos',
                    duration: 2500,
                    destination: 'https://github.com/apvarun/toastify-js',
                    newWindow: true,
                    close: false,
                    gravity: 'top', // `top` or `bottom`
                    position: 'center', // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        borderRadius: '10px',
                        backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                        textAlign: 'center',
                    },
                    onClick: function () { }, // Callback after click
                }).showToast();
                return;
            }

            if (formData.tipo === 'Edificio') {
                if (formData.nombre === '') {
                    Toastify({
                        text: 'Debes introducir una dirección',
                        duration: 2500,
                        destination: 'https://github.com/apvarun/toastify-js',
                        newWindow: true,
                        close: false,
                        gravity: 'top', // `top` or `bottom`
                        position: 'center', // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                            borderRadius: '10px',
                            backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                            textAlign: 'center',
                        },
                        onClick: function () { }, // Callback after click
                    }).showToast();
                    return;
                } else {
                    // Call API using Axios
                    try {
                        setSmallLoadingScreen(true);
                        const response = await axios.post('/api/create_new_edificio_agrupacion', {
                            name: formData.nombre,
                            selectedInmuebles: Array.from(selectedItems),
                        });

                        Toastify({
                            text: 'Edificio creado.',
                            duration: 2500,
                            gravity: 'top',
                            position: 'center',
                            style: {
                                borderRadius: '10px',
                                backgroundImage: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)',
                                textAlign: 'center',
                            },
                        }).showToast();

                        setShowPopup(false);
                        setSelectedItems(new Set());
                        setFormData({ tipo: '', nombre: '', existingGroup: '', grupo: '' });
                        handleIconClick();
                        fetchData(currentPage, searchTerm);
                        setShowExtraButtons(false);
                        setShowUngroupButtons(false);
                        fetchParentsEdificio();
                        setSmallLoadingScreen(false);
                    } catch (error) {
                        console.error('Error performing operation:', error);
                        Toastify({
                            text: 'Error performing operation.',
                            duration: 2500,
                            gravity: 'top',
                            position: 'center',
                            style: {
                                borderRadius: '10px',
                                backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                                textAlign: 'center',
                            },
                        }).showToast();
                        setSmallLoadingScreen(false);
                    }
                }
            } else if (formData.tipo === 'Escalera') {
                if (formData.nombre === '' || formData.grupo === '') {
                    Toastify({
                        text: 'Debes rellenar los campos',
                        duration: 2500,
                        destination: 'https://github.com/apvarun/toastify-js',
                        newWindow: true,
                        close: false,
                        gravity: 'top', // `top` or `bottom`
                        position: 'center', // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                            borderRadius: '10px',
                            backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                            textAlign: 'center',
                        },
                        onClick: function () { }, // Callback after click
                    }).showToast();
                    return;
                } else {
                    // Call Supabase function
                    setSmallLoadingScreen(true);
                    const { data, error } = await axios.post('/api/create_new_escalera_agrupacion', {
                        name: formData.nombre,
                        selectedInmuebles: Array.from(selectedItems),
                        grupo: parseInt(formData.grupo, 10), // Convert grupo to an integer
                    });

                    if (error) {
                        console.error('Error performing operation:', error);
                        Toastify({
                            text: 'Error performing operation.',
                            duration: 2500,
                            gravity: 'top',
                            position: 'center',
                            style: {
                                borderRadius: '10px',
                                backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                                textAlign: 'center',
                            },
                        }).showToast();
                        setSmallLoadingScreen(false);
                        return;
                    }

                    Toastify({
                        text: 'Escalera creada.',
                        duration: 2500,
                        gravity: 'top',
                        position: 'center',
                        style: {
                            borderRadius: '10px',
                            backgroundImage: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)',
                            textAlign: 'center',
                        },
                    }).showToast();

                    setSmallLoadingScreen(false);

                    setShowPopup(false);
                    setSelectedItems(new Set());
                    setFormData({ tipo: '', nombre: '', existingGroup: '', grupo: '' });
                    handleIconClick();
                    fetchData(currentPage, searchTerm);
                    setShowExtraButtons(false);
                    setShowUngroupButtons(false);
                    fetchParentsEdificio();
                }
            }
        } else if (showFormType === 'existing') {
            if (formData.tipo === '') {
                Toastify({
                    text: 'Debes rellenar los campos',
                    duration: 2500,
                    destination: 'https://github.com/apvarun/toastify-js',
                    newWindow: true,
                    close: false,
                    gravity: 'top', // `top` or `bottom`
                    position: 'center', // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        borderRadius: '10px',
                        backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                        textAlign: 'center',
                    },
                    onClick: function () { }, // Callback after click
                }).showToast();
                return;
            }

            if (formData.tipo === 'Edificio') {
                if (formData.existingGroup === '') {
                    Toastify({
                        text: 'Debes rellenar los campos',
                        duration: 2500,
                        destination: 'https://github.com/apvarun/toastify-js',
                        newWindow: true,
                        close: false,
                        gravity: 'top', // `top` or `bottom`
                        position: 'center', // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                            borderRadius: '10px',
                            backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                            textAlign: 'center',
                        },
                        onClick: function () { }, // Callback after click
                    }).showToast();
                    return;
                }
                setSmallLoadingScreen(true);
                // Use axios to make the API call
                const { data, error } = await axios.post('/api/existing_edificio_agrupacion', {
                    type: formData.tipo,
                    inmuebles: Array.from(selectedItems),
                    existingGroup: parseInt(formData.existingGroup, 10),
                });
                if (error) {
                    console.error('Error performing operation:', error);
                    Toastify({
                        text: 'Error performing operation.',
                        duration: 2500,
                        gravity: 'top',
                        position: 'center',
                        style: {
                            borderRadius: '10px',
                            backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                            textAlign: 'center',
                        },
                    }).showToast();
                    setSmallLoadingScreen(false);
                    return;
                }

                setSmallLoadingScreen(false);
                setShowPopup(false);
                setSelectedItems(new Set());
                setFormData({ tipo: '', nombre: '', existingGroup: '', grupo: '' });
                handleIconClick();
                fetchData(currentPage, searchTerm);
                setShowExtraButtons(false);
                setShowUngroupButtons(false);
                fetchParentsEdificio();


            } else if (formData.tipo === 'Escalera') {
                if (formData.existingGroup === '') {
                    Toastify({
                        text: 'Debes rellenar los campos',
                        duration: 2500,
                        destination: 'https://github.com/apvarun/toastify-js',
                        newWindow: true,
                        close: false,
                        gravity: 'top', // `top` or `bottom`
                        position: 'center', // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                            borderRadius: '10px',
                            backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                            textAlign: 'center',
                        },
                        onClick: function () { }, // Callback after click
                    }).showToast();
                    return;
                }
                setSmallLoadingScreen(true);
                // Use axios to make the API call
                const { data, error } = await axios.post('/api/existing_escalera_agrupacion', {
                    type: formData.tipo,
                    inmuebles: Array.from(selectedItems),
                    existingGroup: parseInt(formData.existingGroup, 10),
                });
                if (error) {
                    console.error('Error performing operation:', error);
                    Toastify({
                        text: 'Error performing operation.',
                        duration: 2500,
                        gravity: 'top',
                        position: 'center',
                        style: {
                            borderRadius: '10px',
                            backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                            textAlign: 'center',
                        },
                    }).showToast();
                    setSmallLoadingScreen(false);
                    return;
                }

                setSmallLoadingScreen(false);
                setShowPopup(false);
                setSelectedItems(new Set());
                setFormData({ tipo: '', nombre: '', existingGroup: '', grupo: '' });
                handleIconClick();
                fetchData(currentPage, searchTerm);
                setShowExtraButtons(false);
                setShowUngroupButtons(false);
                fetchParentsEdificio();
            }
        }
        Toastify({
            text: 'Inmueble agrupado.',
            duration: 2500,
            destination: 'https://github.com/apvarun/toastify-js',
            newWindow: true,
            close: false,
            gravity: 'top', // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                borderRadius: '10px',
                backgroundImage: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)',
                textAlign: 'center',
            },
            onClick: function () { }, // Callback after click
        }).showToast();
    };

    const handleSubmitFormUngroup = async (e) => {
        e.preventDefault();
        try {
            setSmallLoadingScreen(true);
            const response = await axios.post('/api/ungroup', { inmuebles: Array.from(selectedItemsUngroup) });
            if (response.data.empty === true) {
                setOrphanInfo(response.data.emptyParents);
                setShowAskForDeleteOrphan(true)
            }
            Toastify({
                text: 'Inmueble desagrupado',
                duration: 2500,
                destination: 'https://github.com/apvarun/toastify-js',
                newWindow: true,
                close: false,
                gravity: 'top', // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    borderRadius: '10px',
                    backgroundImage: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)',
                    textAlign: 'center',
                },
                onClick: function () { }, // Callback after click
            }).showToast();
            setSmallLoadingScreen(false);
            setShowPopupUngroup(false);
            setSelectedItemsUngroup(new Set());
            fetchData(currentPage, searchTerm);
            setShowExtraButtons(false);
            setShowUngroupButtons(false);
        } catch (error) {
            console.error('Error performing operation:', error);
        }
    };

    const handleDeleteOrphan = () => {
        if (!orphanInfo || orphanInfo.length === 0) {
            console.error('Orphan info is empty or undefined');
            return;
        }
        setSmallLoadingScreen(true);
        const orphanIds = orphanInfo.map(orphan => orphan.id);

        axios
            .post('/api/delete_orphan', { orphanIds }) // Use POST request
            .then((response) => {
                if (response.data.status === 'success') {
                    Toastify({
                        text: 'Grupos eliminados',
                        duration: 2500,
                        destination: 'https://github.com/apvarun/toastify-js',
                        newWindow: true,
                        close: false,
                        gravity: 'top', // `top` or `bottom`
                        position: 'center', // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                            borderRadius: '10px',
                            backgroundImage: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)',
                            textAlign: 'center',
                        },
                        onClick: function () { }, // Callback after click
                    }).showToast();
                    setShowAskForDeleteOrphan(false);
                    fetchData(currentPage, searchTerm);
                } else {
                    console.error('Error deleting orphan:', response.data.message);
                    alert('Error deleting orphan: ' + response.data.message);
                    setShowAskForDeleteOrphan(false);
                }
            })
            .catch((error) => {
                console.error('Error deleting orphan:', error);
                alert('Error deleting orphan: ' + error.message);
                setSmallLoadingScreen(false);
            });
        setSmallLoadingScreen(false);

    };

    const handleKeepOrphan = () => {
        // Implement logic to keep the orphan item
        setShowAskForDeleteOrphan(false);
        setOrphanInfo([]);
    };

    const handleKeepDeleteInmueble = () => {
        setShowPopupDeleteInmueble(false);
        setSelectedId(null);
    };

    const handleDeleteInmueble = () => {
        setSmallLoadingScreen(true);
        axios
            .post('/api/delete_inmueble', { // Use POST request
                inmuebles: Array.from(selectedItems),
            })
            .then((response) => {
                if (response.data.status === 'success') {
                    Toastify({
                        text: 'Inmueble eliminado',
                        duration: 2500,
                        destination: 'https://github.com/apvarun/toastify-js',
                        newWindow: true,
                        close: false,
                        gravity: 'top', // `top` or `bottom`
                        position: 'center', // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                            borderRadius: '10px',
                            backgroundImage: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)',
                            textAlign: 'center',
                        },
                        onClick: function () { }, // Callback after click
                    }).showToast();
                    setShowDeleteInmuebleButtons(false);
                    setShowPopupDeleteInmueble(false);
                    fetchData(currentPage, searchTerm);
                    setShowExtraButtons(false);
                    setShowUngroupButtons(false);
                    setSelectedItems(new Set());
                    setKeepChildren(new Set());
                    setParentData([]);
                    setThereAreChildrenDelete(false);
                    setSmallLoadingScreen(false);
                } else {
                    console.error('Error deleting element:', response.data.message);
                    alert('Error deleting element: ' + response.data.message);
                    setShowPopupDeleteInmueble(false);
                    setSmallLoadingScreen(false);
                }
            })
            .catch((error) => {
                console.error('Error deleting orphan:', error);
                alert('Error deleting orphan here: ' + error.message);
            });
    };
    const handleDeleteKeepChildren = () => {
        axios
            .post('/api/delete_keep_children', { // Use POST request
                inmuebles: nestedElements,
            })
            .then((response) => {
                if (response.data.status === 'success') {
                    Toastify({
                        text: 'Grupo eliminado',
                        duration: 2500,
                        destination: 'https://github.com/apvarun/toastify-js',
                        newWindow: true,
                        close: false,
                        gravity: 'top', // `top` or `bottom`
                        position: 'center', // `left`, `center` or `right`
                        stopOnFocus: true, // Prevents dismissing of toast on hover
                        style: {
                            borderRadius: '10px',
                            backgroundImage: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)',
                            textAlign: 'center',
                        },
                        onClick: function () { }, // Callback after click
                    }).showToast();
                    setShowDeleteInmuebleButtons(false);
                    setShowPopupDeleteInmueble(false);
                    fetchData(currentPage, searchTerm);
                    setShowExtraButtons(false);
                    setShowUngroupButtons(false);
                    setSelectedItems(new Set());
                    setKeepChildren(new Set());
                } else {
                    console.error('Error deleting element:', response.data.message);
                    alert('Error deleting element: ' + response.data.message);
                    setShowPopupDeleteInmueble(false);
                }
            })
            .catch((error) => {
                console.error('Error deleting orphan:', error);
                alert('Error deleting orphan here: ' + error.message);
            });
    };

    const handleItemClick = (id) => {
        setSelectedId(id);
        setShowMoreInfo(true); // Set MoreInfo to visible

    };

    const handleClose = useCallback(() => {
        setSelectedId(null);
        setShowMoreInfo(false); // Close MoreInfo
    });

    // Handle toggling the edit table
    const handleEditTable = () => {
        setShowEditTable(!showEditTable); // Toggle the state
        if (showFilters) setShowFilters(false);
        if (screenWidth <= 1280) {
            if (showAnalytics) setShowAnalytics(false);
        }
    };
    // Handle toggling the filters
    const handleShowFilters = () => {
        setShowFilters(!showFilters); // Toggle the <state></state>
        if (showEditTable) setShowEditTable(false);
        if (screenWidth <= 1280) {
            if (showAnalytics) setShowAnalytics(false);
        }
    };

    const handleShowAnalytics = () => {
        setShowAnalytics(!showAnalytics);
        if (screenWidth <= 1280) {
            if (showFilters) setShowFilters(false);
            if (showEditTable) setShowEditTable(false);
        }
    };
    const handleResetFilters = () => {
        setResetFiltersKey(resetFiltersKey + 1);
        setFilters({
            selectedZone: '',
            selectedCategoria: '',
            selectedResponsable: '',
            filterNoticia: null,
            filterEncargo: null,
            superficieMin: 0,
            superficieMax: 20000,
            yearMin: 1800,
            yearMax: new Date().getFullYear(),
            localizado: null,
            garaje: null,
            aireacondicionado: null,
            ascensor: null,
            trastero: null,
            jardin: null,
            terraza: null,
            tipo: undefined,
            banos: undefined,
            habitaciones: undefined,

        });
    };

    const escalerasChildren = (item) => {

        if (item === null) {
            return <p>No hay detalles disponibles</p>;
        }

        return (
            <>
                <div className='w-full gap-2 flex flex-col items-end'>
                    <div className="tableheader relative px-2 py-1 mt-2 rounded-md shadow-lg flex items-center justify-center flex-row bg-slate-600 w-full mb-1">
                        <div className="true flex flex-row justify-between w-full">
                            <div className="flex flex-row justify-center items-center gap-1 w-[100%] py-2 text-white">
                                {paginaBuscador === 'Todos' ? (
                                    <>
                                        <p className={`w-[100%] ${screenWidth > 450 && 'w-[72.5%]'} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center m-0`}>
                                            <strong>Dirección</strong>
                                        </p>
                                        {screenWidth > 1024 && (
                                            <p className="text-center w-[10%] xl:w-[10%] m-0">
                                                <strong>Localizado</strong>
                                            </p>
                                        )}
                                        {screenWidth > 768 && (
                                            <p className="text-center w-[10%] lg:w-[10%] 2xl:w-[7.5%] m-0">
                                                <strong>m²</strong>
                                            </p>
                                        )}
                                        {screenWidth > 1280 && (
                                            <p className="text-center w-[7.5%] m-0">
                                                <strong>Año</strong>
                                            </p>
                                        )}
                                        {screenWidth > 640 && (
                                            <p className="text-center w-[20%] lg:w-[17.5%] 2xl:w-[15%] m-0">
                                                <strong>Zona</strong>
                                            </p>
                                        )}
                                        {screenWidth > 1024 && (
                                            <p className="text-center w-[7.5%] m-0">
                                                <strong>DPV</strong>
                                            </p>
                                        )}
                                        {screenWidth > 1536 && (
                                            <p className="text-center w-[10%] m-0">
                                                <strong>Categoría</strong>
                                            </p>
                                        )}
                                        {screenWidth > 450 && (
                                            <p className="text-center w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] m-0">
                                                <strong>Actividad</strong>
                                            </p>
                                        )}
                                    </>
                                ) : paginaBuscador === 'Noticias' ? (
                                    <>
                                        <p className={`w-[100%] ${screenWidth > 450 && 'w-[72.5%]'} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center m-0`}>
                                            <strong>Dirección</strong>
                                        </p>
                                        {screenWidth > 768 && (
                                            <p className="text-center w-[10%] lg:w-[10%] 2xl:w-[7.5%] m-0">
                                                <strong>m²</strong>
                                            </p>
                                        )}
                                        {screenWidth > 640 && (
                                            <p className="text-center w-[15%] lg:w-[12.5%] 2xl:w-[10%] m-0">
                                                <strong>Zona</strong>
                                            </p>
                                        )}
                                        {screenWidth > 1024 && (
                                            <p className="text-center w-[10%] xl:w-[10%] m-0">
                                                <strong>Prioridad</strong>
                                            </p>
                                        )}

                                        {screenWidth > 1280 && (
                                            <p className="text-center w-[7.5%] m-0">
                                                <strong>Tipo</strong>
                                            </p>
                                        )}

                                        {screenWidth > 1024 && (
                                            <p className="text-center w-[12.5%] m-0">
                                                <strong>Valoración</strong>
                                            </p>
                                        )}
                                        {screenWidth > 1536 && (
                                            <p className="text-center w-[10%] m-0">
                                                <strong>Categoría</strong>
                                            </p>
                                        )}
                                        {screenWidth > 450 && (
                                            <p className="text-center w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] m-0">
                                                <strong>Actividad</strong>
                                            </p>
                                        )}
                                    </>
                                ) : paginaBuscador === 'Encargos' ? (
                                    <>
                                        <p className={`w-[100%] ${screenWidth > 450 && 'w-[72.5%]'} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center m-0`}>
                                            <strong>Dirección</strong>
                                        </p>
                                        {screenWidth > 768 && (
                                            <p className="text-center w-[10%] lg:w-[10%] 2xl:w-[7.5%] m-0">
                                                <strong>Tipo</strong>
                                            </p>
                                        )}
                                        {screenWidth > 640 && (
                                            <p className="text-center w-[15%] lg:w-[12.5%] 2xl:w-[10%] m-0">
                                                <strong>Precio 1</strong>
                                            </p>
                                        )}
                                        {screenWidth > 640 && (
                                            <p className="text-center w-[15%] lg:w-[12.5%] 2xl:w-[10%] m-0">
                                                <strong>Precio 2</strong>
                                            </p>
                                        )}
                                        {screenWidth > 1024 && (
                                            <p className="text-center w-[10%] xl:w-[10%] m-0">
                                                <strong>Comisión Comprador</strong>
                                            </p>
                                        )}
                                        {screenWidth > 1024 && (
                                            <p className="text-center w-[10%] xl:w-[10%] m-0">
                                                <strong>Comisión Encargo</strong>
                                            </p>
                                        )}

                                        {screenWidth > 1536 && (
                                            <p className="text-center w-[10%] m-0">
                                                <strong>Categoría</strong>
                                            </p>
                                        )}
                                        {screenWidth > 450 && (
                                            <p className="text-center w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] m-0">
                                                <strong>Actividad</strong>
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    null
                                )}

                            </div>
                        </div>
                    </div>
                    {item.length > 0 &&
                        item.map((child) => (
                            <div
                                key={child.id}
                                className={`relative px-2 py-4 border border-zinc-400 gap-1 rounded-md h-[4.5rem] flex items-center flex-row w-full ${child.dataUpdateTime === 'green' ? 'bg-green-200 md:hover:bg-emerald-400 md:hover:cursor-pointer' : child.dataUpdateTime === 'red' ? 'bg-red-100 md:hover:bg-red-300 md:hover:cursor-pointer' : child.dataUpdateTime === 'yellow' ? 'bg-yellow-200 md:hover:bg-yellow-400 md:hover:cursor-pointer' : child.dataUpdateTime === 'gray' ? 'bg-white md:hover:cursor-pointer md:hover:bg-slate-300' : 'bg-white hover:bg-slate-300 hover:cursor-pointer'}`}
                                // Dynamically assign the onClick based on showExtraButtons
                                onClick={() => {
                                    if (showExtraButtons) {
                                        handleCheckboxChange(child.id);
                                    } else if (showDeleteInmuebleButtons) {
                                        handleCheckboxChange(child.id);
                                    } else if (showUngroupButtons) {
                                        handleCheckboxChangeUngroup(child.id);
                                    } else {
                                        handleItemClick(child.id);
                                    }
                                }}
                            >
                                <div className="flex flex-row justify-between items-center w-full">
                                    {showUngroupButtons && (
                                        <Checkbox
                                            checked={selectedItemsUngroup.has(child.id)}
                                            onChange={() => handleCheckboxChangeUngroup(child.id)}
                                            className="m-0 h-fit w-fit p-0"
                                        />
                                    )}
                                    {showExtraButtons && (
                                        <Checkbox
                                            checked={selectedItems.has(child.id)}
                                            onChange={() => handleCheckboxChange(child.id)}
                                            className="m-0 h-fit w-fit p-0"
                                        />
                                    )}
                                    {showDeleteInmuebleButtons && (
                                        <Checkbox
                                            checked={selectedItems.has(child.id)}
                                            onChange={() => handleCheckboxChange(child.id)}
                                            className="m-0 h-fit w-fit p-0"
                                        />
                                    )}
                                    <div className="flex flex-row justify-start items-center gap-1 w-[100%] py-2 ">
                                        {paginaBuscador === 'Todos' ? (
                                            <>
                                                <p className={`w-[100%] ${screenWidth > 450 ? 'w-[72.5%]' : ''} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center truncate`} style={{ marginTop: '0px' }}>
                                                    {child.direccion}
                                                </p>
                                                {screenWidth > 1024 && (
                                                    <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                        {child.localizado === false ? (
                                                            <></>
                                                        ) : (
                                                            <div className='flex flex-row justify-center items-center'>
                                                                <p className='text-center text-green-900 bg-green-100 border border-green-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Sí</p>
                                                            </div>
                                                        )}
                                                    </p>
                                                )}
                                                {screenWidth > 768 && (
                                                    <p className={`w-[10%] lg:w-[10%] 2xl:w-[7.5%] text-center truncate mt-0`}>
                                                        {child.superficie} m²
                                                    </p>
                                                )}
                                                {screenWidth > 1280 && (
                                                    <p className={`w-[7.5%] text-center truncate mt-0`}>
                                                        {child.ano_construccion}
                                                    </p>
                                                )}
                                                {screenWidth > 640 && (
                                                    <p className={`w-[20%] lg:w-[17.5%] xl:w-[17.5%] 2xl:w-[15%] text-center truncate mt-0`}>
                                                        {child.zona}
                                                    </p>
                                                )}
                                                {screenWidth > 1024 && (
                                                    <p className={`w-[7.5%] text-center truncate mt-0`}>
                                                        {child.DPV === false ? (
                                                            <></>
                                                        ) : (
                                                            <div className='flex flex-row justify-center items-center'>
                                                                <p className='text-center text-green-900 bg-green-100 border border-green-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Sí</p>
                                                            </div>
                                                        )}
                                                    </p>
                                                )}
                                                {screenWidth > 1536 && (
                                                    <p className={`w-[10%] text-center truncate mt-0`}>
                                                        {child.categoria}
                                                    </p>
                                                )}
                                                {screenWidth > 450 && (
                                                    <div className="flex flex-col gap-2 py-6 w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] h-fit justify-center items-center">
                                                        {child.noticiastate === true && (
                                                            <p className='bg-blue-100 text-center text-blue-900 rounded-md border border-blue-900 w-min px-2 mx-auto my-auto text-sm'>Noticia</p>
                                                        )}
                                                        {child.encargostate === true && (
                                                            <p className='bg-orange-100 text-center text-orange-900 rounded-md border border-orange-900 w-min px-2 mx-auto my-auto text-sm'>Encargo</p>

                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : paginaBuscador === 'Noticias' ? (
                                            <>
                                                <p className={`w-[100%] ${screenWidth > 450 ? 'w-[72.5%]' : ''} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center truncate`} style={{ marginTop: '0px' }}>
                                                    {child.direccion}
                                                </p>
                                                {screenWidth > 768 && (
                                                    <p className={`w-[10%] lg:w-[10%] 2xl:w-[7.5%] text-center truncate mt-0`}>
                                                        {child.superficie} m²
                                                    </p>
                                                )}
                                                {screenWidth > 640 && (
                                                    <p className={`w-[15%] lg:w-[12.5%] xl:w-[12.5%] 2xl:w-[10%] text-center truncate mt-0`}>
                                                        {child.zona}
                                                    </p>
                                                )}
                                                {screenWidth > 1024 && (
                                                    <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                        {child.noticia?.prioridad === 'Baja' ? (
                                                            <>
                                                                <div className='flex flex-row justify-center items-center'>
                                                                    <p className='text-center text-green-900 bg-green-100 border border-green-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Baja</p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className='flex flex-row justify-center items-center'>
                                                                <p className='text-center text-red-900 bg-red-100 border border-red-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Alta</p>
                                                            </div>
                                                        )}
                                                    </p>
                                                )}

                                                {screenWidth > 1280 && (
                                                    <p className={`w-[7.5%] text-center truncate mt-0`}>
                                                        {child.noticia?.tipo_PV}
                                                    </p>
                                                )}

                                                {screenWidth > 1024 && (
                                                    <p className={`w-[12.5%] text-center truncate mt-0`}>
                                                        {child.noticia?.valoracion === 1 ? (
                                                            <>
                                                                {child.noticia.valoracion_establecida?.toLocaleString('es-ES')} €

                                                            </>
                                                        ) : (
                                                            <></>
                                                        )}
                                                    </p>
                                                )}
                                                {screenWidth > 1536 && (
                                                    <p className={`w-[10%] text-center truncate mt-0`}>
                                                        {child.categoria}
                                                    </p>
                                                )}
                                                {screenWidth > 450 && (
                                                    <div className="flex flex-col gap-2 py-6 w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] h-fit justify-center items-center">
                                                        {child.noticiastate === true && (
                                                            <p className='bg-blue-100 text-center text-blue-900 rounded-md border border-blue-900 w-min px-2 mx-auto my-auto text-sm'>Noticia</p>
                                                        )}
                                                        {child.encargostate === true && (
                                                            <p className='bg-orange-100 text-center text-orange-900 rounded-md border border-orange-900 w-min px-2 mx-auto my-auto text-sm'>Encargo</p>

                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : paginaBuscador === 'Encargos' ? (
                                            <>
                                                <p className={`w-[100%] ${screenWidth > 450 ? 'w-[72.5%]' : ''} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center truncate`} style={{ marginTop: '0px' }}>
                                                    {child.direccion}
                                                </p>
                                                {screenWidth > 768 && (
                                                    <p className={`w-[10%] lg:w-[10%] 2xl:w-[7.5%] text-center truncate mt-0`}>
                                                        {child.encargo?.tipo_encargo}
                                                    </p>
                                                )}
                                                {screenWidth > 640 && (
                                                    <p className={`w-[15%] lg:w-[12.5%] xl:w-[12.5%] 2xl:w-[10%] text-center truncate mt-0`}>
                                                        {child.encargo?.precio_1?.toLocaleString('es-ES')} €
                                                    </p>
                                                )}
                                                {screenWidth > 640 && (
                                                    <>
                                                        {child.encargo?.precio_2 ? (
                                                            <p className={`w-[15%] lg:w-[12.5%] xl:w-[12.5%] 2xl:w-[10%] text-center truncate mt-0`}>
                                                                {child.encargo?.precio_2?.toLocaleString('es-ES')} €
                                                            </p>
                                                        ) : (
                                                            <p className={`w-[15%] lg:w-[12.5%] xl:w-[12.5%] 2xl:w-[10%] text-center truncate mt-0`}>

                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                                {screenWidth > 1024 && (
                                                    <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                        {child.encargo?.comisionComprador === 'Porcentaje' ? (
                                                            <>
                                                                <div className='flex flex-col justify-center items-center'>
                                                                    <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                        {child.encargo?.comisionCompradorValue?.toLocaleString('es-ES')}%
                                                                    </p>
                                                                    <div className='h-[1px] w-full my-1 bg-slate-500'></div>
                                                                    <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                        {child.encargo?.comisionCompradorValue?.toLocaleString('es-ES')}€
                                                                    </p>
                                                                </div>
                                                            </>
                                                        ) : child.encargo?.comisionComprador === 'Fijo' ? (
                                                            <>
                                                                <div className='flex flex-col justify-center items-center'>
                                                                    <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                        {child.encargo?.comisionCompradorValue?.toLocaleString('es-ES')}€
                                                                    </p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className='flex flex-row justify-center items-center'>
                                                                    <p className='text-center rounded-md w-min px-2 mx-auto my-auto text-xs'></p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </p>
                                                )}
                                                {screenWidth > 1024 && (
                                                    <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                        {child.encargo?.tipo_comision_encargo === 'Porcentaje' ? (
                                                            <>
                                                                <div className='flex flex-col justify-center items-center'>
                                                                    <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                        {child.encargo?.comision_encargo?.toLocaleString('es-ES')}%
                                                                    </p>
                                                                    <div className='h-[1px] w-full my-1 bg-slate-500'></div>
                                                                    <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                        {(
                                                                            (child.encargo?.precio_2 ?? child.encargo?.precio_1) *
                                                                            (child.encargo?.comision_encargo ?? 0) / 100
                                                                        )?.toLocaleString('es-ES')} €
                                                                    </p>
                                                                </div>
                                                            </>
                                                        ) : child.encargo?.tipo_comision_encargo === 'Fijo' ? (
                                                            <>
                                                                <div className='flex flex-col justify-center items-center'>
                                                                    <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                        {child.encargo?.comision_encargo?.toLocaleString('es-ES')}€
                                                                    </p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className='flex flex-row justify-center items-center'>
                                                                    <p className='text-center rounded-md w-min px-2 mx-auto my-auto text-xs'></p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </p>
                                                )}



                                                {screenWidth > 1536 && (
                                                    <p className={`w-[10%] text-center truncate mt-0`}>
                                                        {child.categoria}
                                                    </p>
                                                )}
                                                {screenWidth > 450 && (
                                                    <div className="flex flex-col gap-2 py-6 w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] h-fit justify-center items-center">
                                                        {child.noticiastate === true && (
                                                            <p className='bg-blue-100 text-center text-blue-900 rounded-md border border-blue-900 w-min px-2 mx-auto my-auto text-sm'>Noticia</p>
                                                        )}
                                                        {child.encargostate === true && (
                                                            <p className='bg-orange-100 text-center text-orange-900 rounded-md border border-orange-900 w-min px-2 mx-auto my-auto text-sm'>Encargo</p>

                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            null
                                        )}

                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </>
        );
    };

    const edifciosChildren = (item) => {


        if (item.nestedinmuebles && item.nestedinmuebles.length === 0 && item.nestedescaleras.length === 0) {
            return <p>No hay detalles disponibles</p>;
        }

        return (

            <div className='w-full gap-2 flex flex-col items-end'>
                <div className="tableheader relative px-2 py-1 mt-2 rounded-md shadow-lg flex items-center justify-center flex-row bg-slate-600 w-full mb-1">
                    <div className="true flex flex-row justify-between w-full">
                        <div className="flex flex-row justify-center items-center gap-1 w-[100%] py-2 text-white">
                            {paginaBuscador === 'Todos' ? (
                                <>
                                    <p className={`w-[100%] ${screenWidth > 450 && 'w-[72.5%]'} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center m-0`}>
                                        <strong>Dirección</strong>
                                    </p>
                                    {screenWidth > 1024 && (
                                        <p className="text-center w-[10%] xl:w-[10%] m-0">
                                            <strong>Localizado</strong>
                                        </p>
                                    )}
                                    {screenWidth > 768 && (
                                        <p className="text-center w-[10%] lg:w-[10%] 2xl:w-[7.5%] m-0">
                                            <strong>m²</strong>
                                        </p>
                                    )}
                                    {screenWidth > 1280 && (
                                        <p className="text-center w-[7.5%] m-0">
                                            <strong>Año</strong>
                                        </p>
                                    )}
                                    {screenWidth > 640 && (
                                        <p className="text-center w-[20%] lg:w-[17.5%] 2xl:w-[15%] m-0">
                                            <strong>Zona</strong>
                                        </p>
                                    )}
                                    {screenWidth > 1024 && (
                                        <p className="text-center w-[7.5%] m-0">
                                            <strong>DPV</strong>
                                        </p>
                                    )}
                                    {screenWidth > 1536 && (
                                        <p className="text-center w-[10%] m-0">
                                            <strong>Categoría</strong>
                                        </p>
                                    )}
                                    {screenWidth > 450 && (
                                        <p className="text-center w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] m-0">
                                            <strong>Actividad</strong>
                                        </p>
                                    )}
                                </>
                            ) : paginaBuscador === 'Noticias' ? (
                                <>
                                    <p className={`w-[100%] ${screenWidth > 450 && 'w-[72.5%]'} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center m-0`}>
                                        <strong>Dirección</strong>
                                    </p>
                                    {screenWidth > 768 && (
                                        <p className="text-center w-[10%] lg:w-[10%] 2xl:w-[7.5%] m-0">
                                            <strong>m²</strong>
                                        </p>
                                    )}
                                    {screenWidth > 640 && (
                                        <p className="text-center w-[15%] lg:w-[12.5%] 2xl:w-[10%] m-0">
                                            <strong>Zona</strong>
                                        </p>
                                    )}
                                    {screenWidth > 1024 && (
                                        <p className="text-center w-[10%] xl:w-[10%] m-0">
                                            <strong>Prioridad</strong>
                                        </p>
                                    )}

                                    {screenWidth > 1280 && (
                                        <p className="text-center w-[7.5%] m-0">
                                            <strong>Tipo</strong>
                                        </p>
                                    )}

                                    {screenWidth > 1024 && (
                                        <p className="text-center w-[12.5%] m-0">
                                            <strong>Valoración</strong>
                                        </p>
                                    )}
                                    {screenWidth > 1536 && (
                                        <p className="text-center w-[10%] m-0">
                                            <strong>Categoría</strong>
                                        </p>
                                    )}
                                    {screenWidth > 450 && (
                                        <p className="text-center w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] m-0">
                                            <strong>Actividad</strong>
                                        </p>
                                    )}
                                </>
                            ) : paginaBuscador === 'Encargos' ? (
                                <>
                                    <p className={`w-[100%] ${screenWidth > 450 && 'w-[72.5%]'} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center m-0`}>
                                        <strong>Dirección</strong>
                                    </p>
                                    {screenWidth > 768 && (
                                        <p className="text-center w-[10%] lg:w-[10%] 2xl:w-[7.5%] m-0">
                                            <strong>Tipo</strong>
                                        </p>
                                    )}
                                    {screenWidth > 640 && (
                                        <p className="text-center w-[15%] lg:w-[12.5%] 2xl:w-[10%] m-0">
                                            <strong>Precio 1</strong>
                                        </p>
                                    )}
                                    {screenWidth > 640 && (
                                        <p className="text-center w-[15%] lg:w-[12.5%] 2xl:w-[10%] m-0">
                                            <strong>Precio 2</strong>
                                        </p>
                                    )}
                                    {screenWidth > 1024 && (
                                        <p className="text-center w-[10%] xl:w-[10%] m-0">
                                            <strong>Comisión Comprador</strong>
                                        </p>
                                    )}
                                    {screenWidth > 1024 && (
                                        <p className="text-center w-[10%] xl:w-[10%] m-0">
                                            <strong>Comisión Encargo</strong>
                                        </p>
                                    )}

                                    {screenWidth > 1536 && (
                                        <p className="text-center w-[10%] m-0">
                                            <strong>Categoría</strong>
                                        </p>
                                    )}
                                    {screenWidth > 450 && (
                                        <p className="text-center w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] m-0">
                                            <strong>Actividad</strong>
                                        </p>
                                    )}
                                </>
                            ) : (
                                null
                            )}
                        </div>
                    </div>
                </div>
                {item.nestedinmuebles && item.nestedinmuebles.length > 0 &&
                    item.nestedinmuebles.map((child) => (
                        <div
                            key={child.id}
                            className={`relative px-2 py-4 border border-zinc-400 gap-1 rounded-md h-[4.5rem] flex items-center flex-row w-full ${child.dataUpdateTime === 'green' ? 'bg-green-200 md:hover:bg-emerald-400 md:hover:cursor-pointer' : child.dataUpdateTime === 'red' ? 'bg-red-100 md:hover:bg-red-300 md:hover:cursor-pointer' : child.dataUpdateTime === 'yellow' ? 'bg-yellow-200 md:hover:bg-yellow-400 md:hover:cursor-pointer' : child.dataUpdateTime === 'gray' ? 'bg-white md:hover:cursor-pointer md:hover:bg-slate-300' : 'bg-white hover:bg-slate-300 hover:cursor-pointer'}`}
                            // Dynamically assign the onClick based on showExtraButtons
                            onClick={() => {
                                if (showExtraButtons) {
                                    handleCheckboxChange(child.id);
                                } else if (showDeleteInmuebleButtons) {
                                    handleCheckboxChange(child.id);
                                } else if (showUngroupButtons) {
                                    handleCheckboxChangeUngroup(child.id);
                                } else {
                                    handleItemClick(child.id);
                                }
                            }}
                        >
                            <div className="flex flex-row justify-between items-center w-full">

                                {showUngroupButtons && (
                                    <Checkbox
                                        checked={selectedItemsUngroup.has(child.id)}
                                        onChange={() => handleCheckboxChangeUngroup(child.id)}
                                        className="mr-4 ml-4 h-fit w-fit p-0"
                                    />
                                )}
                                {showExtraButtons && (
                                    <Checkbox
                                        checked={selectedItems.has(child.id)}
                                        onChange={() => handleCheckboxChange(child.id)}
                                        className="mr-4 ml-4 h-fit w-fit p-0"
                                    />
                                )}
                                {showDeleteInmuebleButtons && (
                                    <Checkbox
                                        checked={selectedItems.has(child.id)}
                                        onChange={() => handleCheckboxChange(child.id)}
                                        className="mr-4 ml-4 h-fit w-fit p-0"
                                    />
                                )}
                                <div className="flex flex-row justify-start items-center gap-1 w-[100%] py-2 ">
                                    {paginaBuscador === 'Todos' ? (
                                        <>
                                            <p className={`w-[100%] ${screenWidth > 450 ? 'w-[72.5%]' : ''} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center truncate`} style={{ marginTop: '0px' }}>
                                                {child.direccion}
                                            </p>
                                            {screenWidth > 1024 && (
                                                <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                    {child.localizado === false ? (
                                                        <></>
                                                    ) : (
                                                        <div className='flex flex-row justify-center items-center'>
                                                            <p className='text-center text-green-900 bg-green-100 border border-green-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Sí</p>
                                                        </div>
                                                    )}
                                                </p>
                                            )}
                                            {screenWidth > 768 && (
                                                <p className={`w-[10%] lg:w-[10%] 2xl:w-[7.5%] text-center truncate mt-0`}>
                                                    {child.superficie} m²
                                                </p>
                                            )}
                                            {screenWidth > 1280 && (
                                                <p className={`w-[7.5%] text-center truncate mt-0`}>
                                                    {child.ano_construccion}
                                                </p>
                                            )}
                                            {screenWidth > 640 && (
                                                <p className={`w-[20%] lg:w-[17.5%] xl:w-[17.5%] 2xl:w-[15%] text-center truncate mt-0`}>
                                                    {child.zona}
                                                </p>
                                            )}
                                            {screenWidth > 1024 && (
                                                <p className={`w-[7.5%] text-center truncate mt-0`}>
                                                    {child.DPV === false ? (
                                                        <></>
                                                    ) : (
                                                        <div className='flex flex-row justify-center items-center'>
                                                            <p className='text-center text-green-900 bg-green-100 border border-green-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Sí</p>
                                                        </div>
                                                    )}
                                                </p>
                                            )}
                                            {screenWidth > 1536 && (
                                                <p className={`w-[10%] text-center truncate mt-0`}>
                                                    {child.categoria}
                                                </p>
                                            )}
                                            {screenWidth > 450 && (
                                                <div className="flex flex-col gap-2 py-6 w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] h-fit justify-center items-center">
                                                    {child.noticiastate === true && (
                                                        <p className='bg-blue-100 text-center text-blue-900 rounded-md border border-blue-900 w-min px-2 mx-auto my-auto text-sm'>Noticia</p>
                                                    )}
                                                    {child.encargostate === true && (
                                                        <p className='bg-orange-100 text-center text-orange-900 rounded-md border border-orange-900 w-min px-2 mx-auto my-auto text-sm'>Encargo</p>

                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : paginaBuscador === 'Noticias' ? (
                                        <>
                                            <p className={`w-[100%] ${screenWidth > 450 ? 'w-[72.5%]' : ''} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center truncate`} style={{ marginTop: '0px' }}>
                                                {child.direccion}
                                            </p>
                                            {screenWidth > 768 && (
                                                <p className={`w-[10%] lg:w-[10%] 2xl:w-[7.5%] text-center truncate mt-0`}>
                                                    {child.superficie} m²
                                                </p>
                                            )}
                                            {screenWidth > 640 && (
                                                <p className={`w-[15%] lg:w-[12.5%] xl:w-[12.5%] 2xl:w-[10%] text-center truncate mt-0`}>
                                                    {child.zona}
                                                </p>
                                            )}
                                            {screenWidth > 1024 && (
                                                <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                    {child.noticia?.prioridad === 'Baja' ? (
                                                        <>
                                                            <div className='flex flex-row justify-center items-center'>
                                                                <p className='text-center text-green-900 bg-green-100 border border-green-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Baja</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className='flex flex-row justify-center items-center'>
                                                            <p className='text-center text-red-900 bg-red-100 border border-red-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Alta</p>
                                                        </div>
                                                    )}
                                                </p>
                                            )}

                                            {screenWidth > 1280 && (
                                                <p className={`w-[7.5%] text-center truncate mt-0`}>
                                                    {child.noticia?.tipo_PV}
                                                </p>
                                            )}

                                            {screenWidth > 1024 && (
                                                <p className={`w-[12.5%] text-center truncate mt-0`}>
                                                    {child.noticia?.valoracion === 1 ? (
                                                        <>
                                                            {child.noticia.valoracion_establecida?.toLocaleString('es-ES')} €

                                                        </>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </p>
                                            )}
                                            {screenWidth > 1536 && (
                                                <p className={`w-[10%] text-center truncate mt-0`}>
                                                    {child.categoria}
                                                </p>
                                            )}
                                            {screenWidth > 450 && (
                                                <div className="flex flex-col gap-2 py-6 w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] h-fit justify-center items-center">
                                                    {child.noticiastate === true && (
                                                        <p className='bg-blue-100 text-center text-blue-900 rounded-md border border-blue-900 w-min px-2 mx-auto my-auto text-sm'>Noticia</p>
                                                    )}
                                                    {child.encargostate === true && (
                                                        <p className='bg-orange-100 text-center text-orange-900 rounded-md border border-orange-900 w-min px-2 mx-auto my-auto text-sm'>Encargo</p>

                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : paginaBuscador === 'Encargos' ? (
                                        <>
                                            <p className={`w-[100%] ${screenWidth > 450 ? 'w-[72.5%]' : ''} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center truncate`} style={{ marginTop: '0px' }}>
                                                {child.direccion}
                                            </p>
                                            {screenWidth > 768 && (
                                                <p className={`w-[10%] lg:w-[10%] 2xl:w-[7.5%] text-center truncate mt-0`}>
                                                    {child.encargo?.tipo_encargo}
                                                </p>
                                            )}
                                            {screenWidth > 640 && (
                                                <p className={`w-[15%] lg:w-[12.5%] xl:w-[12.5%] 2xl:w-[10%] text-center truncate mt-0`}>
                                                    {child.encargo?.precio_1?.toLocaleString('es-ES')} €
                                                </p>
                                            )}
                                            {screenWidth > 640 && (
                                                <>
                                                    {child.encargo?.precio_2 ? (
                                                        <p className={`w-[15%] lg:w-[12.5%] xl:w-[12.5%] 2xl:w-[10%] text-center truncate mt-0`}>
                                                            {child.encargo?.precio_2?.toLocaleString('es-ES')} €
                                                        </p>
                                                    ) : (
                                                        <p className={`w-[15%] lg:w-[12.5%] xl:w-[12.5%] 2xl:w-[10%] text-center truncate mt-0`}>

                                                        </p>
                                                    )}
                                                </>
                                            )}
                                            {screenWidth > 1024 && (
                                                <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                    {child.encargo?.comisionComprador === 'Porcentaje' ? (
                                                        <>
                                                            <div className='flex flex-col justify-center items-center'>
                                                                <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                    {child.encargo?.comisionCompradorValue?.toLocaleString('es-ES')}%
                                                                </p>
                                                                <div className='h-[1px] w-full my-1 bg-slate-500'></div>
                                                                <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                    {child.encargo?.comisionCompradorValue?.toLocaleString('es-ES')}€
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : child.encargo?.comisionComprador === 'Fijo' ? (
                                                        <>
                                                            <div className='flex flex-col justify-center items-center'>
                                                                <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                    {child.encargo?.comisionCompradorValue?.toLocaleString('es-ES')}€
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className='flex flex-row justify-center items-center'>
                                                                <p className='text-center rounded-md w-min px-2 mx-auto my-auto text-xs'></p>
                                                            </div>
                                                        </>
                                                    )}
                                                </p>
                                            )}
                                            {screenWidth > 1024 && (
                                                <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                    {child.encargo?.tipo_comision_encargo === 'Porcentaje' ? (
                                                        <>
                                                            <div className='flex flex-col justify-center items-center'>
                                                                <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                    {child.encargo?.comision_encargo?.toLocaleString('es-ES')}%
                                                                </p>
                                                                <div className='h-[1px] w-full my-1 bg-slate-500'></div>
                                                                <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                    {(
                                                                        (child.encargo?.precio_2 ?? child.encargo?.precio_1) *
                                                                        (child.encargo?.comision_encargo ?? 0) / 100
                                                                    )?.toLocaleString('es-ES')} €
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : child.encargo?.tipo_comision_encargo === 'Fijo' ? (
                                                        <>
                                                            <div className='flex flex-col justify-center items-center'>
                                                                <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                    {child.encargo?.comision_encargo?.toLocaleString('es-ES')}€
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className='flex flex-row justify-center items-center'>
                                                                <p className='text-center rounded-md w-min px-2 mx-auto my-auto text-xs'></p>
                                                            </div>
                                                        </>
                                                    )}
                                                </p>
                                            )}



                                            {screenWidth > 1536 && (
                                                <p className={`w-[10%] text-center truncate mt-0`}>
                                                    {child.categoria}
                                                </p>
                                            )}
                                            {screenWidth > 450 && (
                                                <div className="flex flex-col gap-2 py-6 w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] h-fit justify-center items-center">
                                                    {child.noticiastate === true && (
                                                        <p className='bg-blue-100 text-center text-blue-900 rounded-md border border-blue-900 w-min px-2 mx-auto my-auto text-sm'>Noticia</p>
                                                    )}
                                                    {child.encargostate === true && (
                                                        <p className='bg-orange-100 text-center text-orange-900 rounded-md border border-orange-900 w-min px-2 mx-auto my-auto text-sm'>Encargo</p>

                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        null
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                {item.nestedescaleras && item.nestedescaleras.length > 0 &&
                    item.nestedescaleras.map((child) => (
                        <div
                            key={child.id}
                            className={`relative border border-gray-400 mb-0 p-0 rounded-md shadow-xl flex items-center flex-col w-full bg-gray-100 transition-all duration-[1000ms] ease-in-out`}
                        >
                            <div className="flex flex-row justify-stretch items-stretch gap-2 w-full cursor-pointer" onClick={() => handleToggleEscalera(child.id)}>
                                {showDeleteInmuebleButtons && (
                                    <Checkbox
                                        checked={selectedItems.has(child.id)}
                                        onChange={() => handleCheckboxChange(child.id)}
                                        className="mr-4 ml-4 h-fit w-fit p-0"
                                    />
                                )}
                                <div className="flex flex-row justify-evenly items-center w-full py-2 px-4 h-[4.5rem]">
                                    <span className="flex flex-row justify-start items-center w-[50%] pl-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 5h-5v5h-5v5H7v5H2" />
                                        </svg>
                                        <p className="w-[60%] text-center">{child.direccion}</p>
                                    </span>
                                    <p className="text-start w-[30%]">{child.zona === 'NULL' ? 'N/A' : child.zona}</p>
                                    <div
                                        className={`cursor-pointer flex flex-row justify-center w-[20%] transition-transform duration-[1000ms] ${expandedItemsEscalera[child.id] ? 'rotate-180' : 'rotate-0'}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M18.2 13.3L12 7l-6.2 6.3c-.2.2-.3.5-.3.7s.1.5.3.7c.2.2.4.3.7.3h11c.3 0 .5-.1.7-.3c.2-.2.3-.5.3-.7s-.1-.5-.3-.7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    maxHeight: expandedItemsEscalera[child.id] ? '9000px' : '0px',
                                    width: '100%',
                                }}
                                className={`overflow-hidden transition-max-height duration-[1000ms] ease-in-out`}
                            >
                                <div className="p-2  w-full">
                                    {expandedItemsEscalera[child.id] && <div className="w-full flex escalera-content flex-col justify-center items-center px-2">{escalerasChildren(child.nestedinmuebles)}</div>}
                                </div>
                            </div>
                        </div>


                    ))
                }
            </div >

        );
    };






    return (
        <div className="bg-slate-400 h-full w-full overflow-x-hidden">
            <div className={`${screenWidth >= 990 ? 'w-[calc(100%-5rem)]' : 'w-full'} ml-auto p-4 pb-24`}>
                <form onSubmit={handleSearch} className="mb-4 flex flex-row gap-2 mt-0 w-full justify-center items-center bg-slate-200 rounded-2xl p-4 shadow-2xl">
                    <div className="relative w-[80%]">
                        <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setShowMoreInfo(false); }} placeholder="Buscar una dirección..." className="border border-gray-300 px-3 py-2 w-[100%] rounded-3xl" />
                        <div className="flex gap-2 justify-center items-center flex-row">
                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-3 rounded-3xl flex-row justify-center items-center text-center z-[30] absolute top-0 right-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1664 1664" className>
                                    <path
                                        fill="currentColor"
                                        d="M1152 704q0-185-131.5-316.5T704 256T387.5 387.5T256 704t131.5 316.5T704 1152t316.5-131.5T1152 704m512 832q0 52-38 90t-90 38q-54 0-90-38l-343-342q-179 124-399 124q-143 0-273.5-55.5t-225-150t-150-225T0 704t55.5-273.5t150-225t225-150T704 0t273.5 55.5t225 150t150 225T1408 704q0 220-124 399l343 343q37 37 37 90"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <button type="button" onClick={handleClearSearch} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-1.5 rounded-3xl flex-row justify-center items-center text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m2.59 6L12 10.59L9.41 8L8 9.41L10.59 12L8 14.59L9.41 16L12 13.41L14.59 16L16 14.59L13.41 12L16 9.41z"
                            />
                        </svg>
                    </button>
                </form>

                {showMoreInfo ? (

                    <MoreInfo id={selectedId} onClose={handleClose} showModal={showMoreInfo} setShowModal={setShowMoreInfo} fetchData={fetchData} currentPage={currentPage} searchTerm={searchTerm} admin={admin} screenWidth={screenWidth} />

                ) : (
                    <div className='bg-slate-200 w-full rounded-2xl p-4 shadow-2xl'>
                        {loadingLoader ? (
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
                                <div className='flex flex-row gap-2 items-center justify-center mt-4 pb-4 w-full'>
                                    <BuscadorTabs
                                        paginaBuscador={paginaBuscador}
                                        setPaginaBuscador={setPaginaBuscador}
                                    />
                                </div>
                                <div className="tablesettingscontainer flex flex-row gap-4 pt-2 pb-2 w-full justify-center items-center">
                                    {showFilters && (
                                        <div className="filtercontainer flex flex-row gap-4 pt-2 pb-2 w-fit justify-between">
                                            <div className="flex flex-row gap-4 justify-end items-end w-full">
                                                <button type="button" onClick={handleResetFilters} className={`flex items-center justify-center p-1 rounded-lg shadow-xl hover:bg-blue-950 hover:text-white w-fit ${showExtraButtons ? 'bg-blue-950 text-white' : 'bg-blue-300 text-black'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24">
                                                        <path
                                                            fill="currentColor"
                                                            d="M12 7.5a5.5 5.5 0 1 0 11 0a5.5 5.5 0 0 0-11 0M20.5 4a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h1a2.5 2.5 0 0 0-2-1c-.833 0-1.572.407-2.027 1.036a.5.5 0 0 1-.81-.586A3.5 3.5 0 0 1 17.5 4c.98 0 1.865.403 2.5 1.05V4.5a.5.5 0 0 1 .5-.5M15 9.95v.55a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-1c.456.608 1.183 1 2 1c.766 0 1.452-.344 1.911-.888a.5.5 0 1 1 .764.645A3.5 3.5 0 0 1 17.5 11A3.5 3.5 0 0 1 15 9.95M8 13h6.034a6.5 6.5 0 0 1-2.012-2H8l-.117.007A1 1 0 0 0 8 13M5 6h6.174a6.5 6.5 0 0 0-.155 2H5a1 1 0 0 1-.117-1.993zm4.883 10.007L10 16h4a1 1 0 0 1 .117 1.993L14 18h-4a1 1 0 0 1-.117-1.993"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className="filtercontainer flex flex-row gap-4 pt-2 pb-2 w-fit justify-between">
                                        <div className="flex flex-row gap-4 justify-end items-end w-full">
                                            <button type="button" onClick={handleShowFilters} className={`flex items-center justify-center p-2 rounded-lg shadow-xl hover:bg-blue-950 hover:text-white w-fit ${showExtraButtons ? 'bg-blue-950 text-white' : 'bg-blue-300 text-black'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 512 512">
                                                    <path fill="currentColor" d="M472 168H40a24 24 0 0 1 0-48h432a24 24 0 0 1 0 48m-80 112H120a24 24 0 0 1 0-48h272a24 24 0 0 1 0 48m-96 112h-80a24 24 0 0 1 0-48h80a24 24 0 0 1 0 48" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    {admin && (
                                        <div className={`flex flex-row gap-4 pt-2 pb-2 w-fit justify-between ${showEditTable ? 'edittablecontainertrue' : 'edittablecontainerfalse'}`}>
                                            <div className="flex flex-row gap-4 justify-end items-end w-full">
                                                <button type="button" onClick={handleEditTable} className={`flex items-center justify-center p-2 rounded-lg shadow-xl hover:bg-blue-950 hover:text-white w-fit ${showExtraButtons ? 'bg-blue-950 text-white' : 'bg-blue-300 text-black'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
                                                        <path
                                                            fill="currentColor"
                                                            d="M12.49 19.818c.118-.472.362-.903.707-1.248l5.901-5.901a2.27 2.27 0 0 1 1.392-.659a2.286 2.286 0 0 1 1.841 3.89l-5.902 5.903a2.7 2.7 0 0 1-1.248.706l-1.83.458a1.087 1.087 0 0 1-1.318-1.319zm-2.99 1.18h1.664l.356-1.423c.162-.648.497-1.24.97-1.712L14.353 16H9.499zM15.998 9.5v4.855l2.392-2.392a3.28 3.28 0 0 1 2.607-.95V9.499zm5-1.5V6.25A3.25 3.25 0 0 0 17.748 3h-1.75v5zm-6.5-5h-5v5h5zm-6.5 0H6.25A3.25 3.25 0 0 0 3 6.25V8h5zM3 9.5v4.999h5v-5zm0 6.499v1.75a3.25 3.25 0 0 0 3.25 3.25H8v-5zm11.499-6.5v5h-5v-5z"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    <div className={`flex flex-row gap-4 pt-2 pb-2 w-fit justify-between ${showEditTable ? 'edittablecontainertrue' : 'edittablecontainerfalse'}`}>
                                        <div className="flex flex-row gap-4 justify-end items-end w-full">
                                            <button type="button" onClick={handleShowAnalytics} className={`flex items-center justify-center p-2 rounded-lg shadow-xl hover:bg-blue-950 hover:text-white w-fit ${showExtraButtons ? 'bg-blue-950 text-white' : 'bg-blue-300 text-black'}`}>
                                                <IoAnalytics className='h-[2em] w-[2em]' />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {showAnalytics && screenWidth <= 1280 && <Analytics analyticsData={analyticsData} />}
                                {showFilters && <FilterMenu setFilters={setFilters} currentPage={currentPage} data={data} setData={setData} filters={filters} setCurrentPage={setCurrentPage} setTotalPages={setTotalPages} setLoading={setLoading} resetFiltersKey={resetFiltersKey} screenWidth={screenWidth} paginaBuscador={paginaBuscador} />}
                                {showEditTable && (
                                    <div className={`flex flex-row gap-4 pt-2 pb-2 w-full ${admin === 'true' ? 'justify-center' : 'justify-center'} iconscontainertrue`}>
                                        <div className="flex flex-row gap-4">
                                            <button type="button" onClick={handleIconClick} className={`flex items-center justify-center p-2 rounded shadow-lg hover:bg-blue-950 hover:text-white w-fit ${showExtraButtons ? 'bg-blue-950 text-white' : 'bg-blue-300 text-black'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
                                                    <path fill="currentColor" d="M2 6H1l4-4l4 4H8v3H6V6H4v3H2zm11 4.9l1.3 1.1H16V9h2v3h3V8h1l-5-5l-5 5h1zm.8 11.1c-.5-.9-.8-1.9-.8-3c0-1.6.6-3.1 1.7-4.1L9 10l-7 6h2v6h3v-5h4v5zm4.2-7v3h-3v2h3v3h2v-3h3v-2h-3v-3z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleIconClickUngroup}
                                                className={`flex items-center justify-center p-2 rounded shadow-lg bg-blue-300 hover:bg-blue-950 hover:text-white w-fit ${showUngroupButtons ? 'bg-blue-950 text-white' : 'bg-blue-300 text-black'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
                                                    <path fill="currentColor" d="M2 6H1l4-4l4 4H8v3H6V6H4v3H2zm11 4.9l1.3 1.1H16V9h2v3h3V8h1l-5-5l-5 5h1zm.8 11.1c-.5-.9-.8-1.9-.8-3c0-1.6.6-3.1 1.7-4.1L9 10l-7 6h2v6h3v-5h4v5zm1.2-4v2h8v-2z" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="flex flex-row gap-4">
                                            {admin === 'true' && (
                                                <button
                                                    type="button"
                                                    onClick={handleIconDeleteInmueble}
                                                    className={`flex items-center justify-center p-2 rounded shadow-lg bg-blue-300 hover:bg-blue-950 hover:text-white w-fit ${showDeleteInmuebleButtons ? 'bg-blue-950 text-white' : 'bg-blue-300 text-black'}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 16 16">
                                                        <g fill="currentColor">
                                                            <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z" />
                                                            <path d="m8 3.293l4.712 4.712A4.5 4.5 0 0 0 8.758 15H3.5A1.5 1.5 0 0 1 2 13.5V9.293z" />
                                                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7M11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 1 1 0-1" />
                                                        </g>
                                                    </svg>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleIconAddInmueble}
                                                className={`flex items-center justify-center p-2 rounded shadow-lg bg-blue-300 hover:bg-blue-950 hover:text-white w-fit ${showAddInmuebleButtons ? 'bg-blue-950 text-white' : 'bg-blue-300 text-black'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 16 16">
                                                    <g fill="currentColor">
                                                        <path d="M12.5 16a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7m.5-5v1h1a.5.5 0 0 1 0 1h-1v1a.5.5 0 1 1-1 0v-1h-1a.5.5 0 1 1 0-1h1v-1a.5.5 0 0 1 1 0" />
                                                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z" />
                                                        <path d="m8 3.293l4.712 4.712A4.5 4.5 0 0 0 8.758 15H3.5A1.5 1.5 0 0 1 2 13.5V9.293z" />
                                                    </g>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {showExtraButtons && (
                                    <div className="flex gap-4 mt-4 pb-4 w-full justify-center">
                                        <button type="button" onClick={handlePopupToggle} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                            Agrupar
                                        </button>
                                        <button type="button" onClick={() => setShowExtraButtons(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                            Cerrar
                                        </button>
                                    </div>
                                )}
                                {showUngroupButtons && (
                                    <div className="flex gap-4 mt-4 pb-4 w-full justify-center">
                                        <button type="button" onClick={handlePopupToggleUngroup} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                            Desagrupar
                                        </button>
                                        <button type="button" onClick={() => setShowUngroupButtons(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                            Cerrar
                                        </button>
                                    </div>
                                )}
                                {showDeleteInmuebleButtons && admin && (
                                    <div className="flex gap-4 mt-4 pb-4 w-full justify-center">
                                        <button type="button" onClick={handlePopupToggleDeleteInmueble} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                            Eliminar
                                        </button>
                                        <button type="button" onClick={() => setShowDeleteInmuebleButtons(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                            Cerrar
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <p className="text-center font-sans text-lg text-slate-800 font-bold">
                                        Total de inmuebles: <br />
                                        {loadingTotalItems ? (
                                            <div>
                                                <Skeleton width={120} height={30}>
                                                    Analizando...
                                                </Skeleton>
                                            </div>
                                        ) : (
                                            <span>{totalItems}</span>
                                        )}
                                    </p>
                                </div>

                                <div className={`w-full flex flex-row ${(screenWidth >= 990 && showAnalytics) ? 'gap-3' : 'gap-0'} mt-5`}>
                                    <div className={`flex flex-col gap-2 w-full ${showAnalytics ? 'xl:w-[60%]' : 'xl:w-[100%]'} bg-slate-100 rounded-xl p-4 shadow-lg h-min pt-5 items-center transition-all duration-[1000ms] ease-in-out`}>
                                        <div className="tableheader relative px-2 py-1 mt-2 rounded-md shadow-lg flex items-center justify-center flex-row bg-blue-950 w-full mb-1">
                                            <div className="true flex flex-row justify-between w-full">
                                                <div className="flex flex-row justify-center items-center gap-1 w-[100%] py-2 text-white">
                                                    {paginaBuscador === 'Todos' ? (
                                                        <>
                                                            <p className={`w-[100%] ${screenWidth > 450 && 'w-[72.5%]'} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center m-0`}>
                                                                <strong>Dirección</strong>
                                                            </p>
                                                            {screenWidth > 1024 && (
                                                                <p className="text-center w-[10%] xl:w-[10%] m-0">
                                                                    <strong>Localizado</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 768 && (
                                                                <p className="text-center w-[10%] lg:w-[10%] 2xl:w-[7.5%] m-0">
                                                                    <strong>m²</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 1280 && (
                                                                <p className="text-center w-[7.5%] m-0">
                                                                    <strong>Año</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 640 && (
                                                                <p className="text-center w-[20%] lg:w-[17.5%] 2xl:w-[15%] m-0">
                                                                    <strong>Zona</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 1024 && (
                                                                <p className="text-center w-[7.5%] m-0">
                                                                    <strong>DPV</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 1536 && (
                                                                <p className="text-center w-[10%] m-0">
                                                                    <strong>Categoría</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 450 && (
                                                                <p className="text-center w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] m-0">
                                                                    <strong>Actividad</strong>
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : paginaBuscador === 'Noticias' ? (
                                                        <>
                                                            <p className={`w-[100%] ${screenWidth > 450 && 'w-[72.5%]'} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center m-0`}>
                                                                <strong>Dirección</strong>
                                                            </p>
                                                            {screenWidth > 768 && (
                                                                <p className="text-center w-[10%] lg:w-[10%] 2xl:w-[7.5%] m-0">
                                                                    <strong>m²</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 640 && (
                                                                <p className="text-center w-[15%] lg:w-[12.5%] 2xl:w-[10%] m-0">
                                                                    <strong>Zona</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 1024 && (
                                                                <p className="text-center w-[10%] xl:w-[10%] m-0">
                                                                    <strong>Prioridad</strong>
                                                                </p>
                                                            )}

                                                            {screenWidth > 1280 && (
                                                                <p className="text-center w-[7.5%] m-0">
                                                                    <strong>Tipo</strong>
                                                                </p>
                                                            )}

                                                            {screenWidth > 1024 && (
                                                                <p className="text-center w-[12.5%] m-0">
                                                                    <strong>Valoración</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 1536 && (
                                                                <p className="text-center w-[10%] m-0">
                                                                    <strong>Categoría</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 450 && (
                                                                <p className="text-center w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] m-0">
                                                                    <strong>Actividad</strong>
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : paginaBuscador === 'Encargos' ? (
                                                        <>
                                                            <p className={`w-[100%] ${screenWidth > 450 && 'w-[72.5%]'} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center m-0`}>
                                                                <strong>Dirección</strong>
                                                            </p>
                                                            {screenWidth > 768 && (
                                                                <p className="text-center w-[10%] lg:w-[10%] 2xl:w-[7.5%] m-0">
                                                                    <strong>Tipo</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 640 && (
                                                                <p className="text-center w-[15%] lg:w-[12.5%] 2xl:w-[10%] m-0">
                                                                    <strong>Precio 1</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 640 && (
                                                                <p className="text-center w-[15%] lg:w-[12.5%] 2xl:w-[10%] m-0">
                                                                    <strong>Precio 2</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 1024 && (
                                                                <p className="text-center w-[10%] xl:w-[10%] m-0">
                                                                    <strong>Comisión Comprador</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 1024 && (
                                                                <p className="text-center w-[10%] xl:w-[10%] m-0">
                                                                    <strong>Comisión Encargo</strong>
                                                                </p>
                                                            )}

                                                            {screenWidth > 1536 && (
                                                                <p className="text-center w-[10%] m-0">
                                                                    <strong>Categoría</strong>
                                                                </p>
                                                            )}
                                                            {screenWidth > 450 && (
                                                                <p className="text-center w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] m-0">
                                                                    <strong>Actividad</strong>
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        null
                                                    )}



                                                </div>
                                            </div>
                                        </div>

                                        {loadingPage ? (
                                            <div className="skeleton flex flex-col gap-6 w-full pt-1 pb-4">
                                                {Array.from({ length: 20 }).map((_, index) => (
                                                    <Skeleton
                                                        key={index} // Always provide a unique key when rendering a list
                                                        count={1}
                                                        height={56}
                                                        className="shadow-lg"
                                                        style={{ borderRadius: '6px' }}
                                                    />
                                                ))}
                                            </div>

                                        ) : (


                                            Array.isArray(data) && data.length > 0 ? (
                                                data.map((item) =>
                                                    item.tipoagrupacion === 1 ? (
                                                        <div
                                                            key={item.id}
                                                            className={`relative px-2 py-4 border border-zinc-400 gap-1 rounded-md h-[4.5rem] flex items-center flex-row w-full ${item.dataUpdateTime === 'green'
                                                                ? 'bg-green-200 md:hover:bg-emerald-400 md:hover:cursor-pointer'
                                                                : item.dataUpdateTime === 'red'
                                                                    ? 'bg-red-100 md:hover:bg-red-300 md:hover:cursor-pointer'
                                                                    : item.dataUpdateTime === 'yellow'
                                                                        ? 'bg-yellow-200 md:hover:bg-yellow-400 md:hover:cursor-pointer'
                                                                        : item.dataUpdateTime === 'gray'
                                                                            ? 'bg-white md:hover:cursor-pointer md:hover:bg-slate-300'
                                                                            : 'bg-white hover:bg-slate-300 hover:cursor-pointer'
                                                                }`}
                                                            // Dynamically assign the onClick based on showExtraButtons
                                                            onClick={() => {
                                                                if (showExtraButtons) {
                                                                    handleCheckboxChange(item.id);
                                                                } else if (showDeleteInmuebleButtons) {
                                                                    handleCheckboxChange(item.id);
                                                                } else {
                                                                    handleItemClick(item.id);
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex flex-row justify-between w-full items-center">
                                                                {showExtraButtons && (
                                                                    <Checkbox
                                                                        checked={selectedItems.has(item.id)}
                                                                        onChange={() => handleCheckboxChange(item.id)}
                                                                        className="mr-4 ml-4 h-fit w-fit p-0"
                                                                    />
                                                                )}
                                                                {showDeleteInmuebleButtons && (
                                                                    <Checkbox
                                                                        checked={selectedItems.has(item.id)}
                                                                        onChange={() => handleCheckboxChange(item.id)}
                                                                        className="mr-4 ml-4 h-fit w-fit p-0"
                                                                    />
                                                                )}
                                                                <div className="flex flex-row justify-start items-center gap-1 w-[100%] py-2 ">
                                                                    {paginaBuscador === 'Todos' ? (
                                                                        <>
                                                                            <p className={`w-[100%] ${screenWidth > 450 ? 'w-[72.5%]' : ''} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center truncate`} style={{ marginTop: '0px' }}>
                                                                                {item.direccion}
                                                                            </p>
                                                                            {screenWidth > 1024 && (
                                                                                <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                                                    {item.localizado === false ? (
                                                                                        <></>
                                                                                    ) : (
                                                                                        <div className='flex flex-row justify-center items-center'>
                                                                                            <p className='text-center text-green-900 bg-green-100 border border-green-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Sí</p>
                                                                                        </div>
                                                                                    )}
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 768 && (
                                                                                <p className={`w-[10%] lg:w-[10%] 2xl:w-[7.5%] text-center truncate mt-0`}>
                                                                                    {item.superficie} m²
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 1280 && (
                                                                                <p className={`w-[7.5%] text-center truncate mt-0`}>
                                                                                    {item.ano_construccion}
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 640 && (
                                                                                <p className={`w-[20%] lg:w-[17.5%] xl:w-[17.5%] 2xl:w-[15%] text-center truncate mt-0`}>
                                                                                    {item.zona}
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 1024 && (
                                                                                <p className={`w-[7.5%] text-center truncate mt-0`}>
                                                                                    {item.DPV === false ? (
                                                                                        <></>
                                                                                    ) : (
                                                                                        <div className='flex flex-row justify-center items-center'>
                                                                                            <p className='text-center text-green-900 bg-green-100 border border-green-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Sí</p>
                                                                                        </div>
                                                                                    )}
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 1536 && (
                                                                                <p className={`w-[10%] text-center truncate mt-0`}>
                                                                                    {item.categoria}
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 450 && (
                                                                                <div className="flex flex-col gap-2 py-6 w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] h-fit justify-center items-center">
                                                                                    {item.noticiastate === true && (
                                                                                        <p className='bg-blue-100 text-center text-blue-900 rounded-md border border-blue-900 w-min px-2 mx-auto my-auto text-sm'>Noticia</p>
                                                                                    )}
                                                                                    {item.encargostate === true && (
                                                                                        <p className='bg-orange-100 text-center text-orange-900 rounded-md border border-orange-900 w-min px-2 mx-auto my-auto text-sm'>Encargo</p>

                                                                                    )}
                                                                                </div>
                                                                            )}

                                                                        </>
                                                                    ) : paginaBuscador === 'Noticias' ? (
                                                                        <>
                                                                            <p className={`w-[100%] ${screenWidth > 450 ? 'w-[72.5%]' : ''} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center truncate`} style={{ marginTop: '0px' }}>
                                                                                {item.direccion}
                                                                            </p>
                                                                            {screenWidth > 768 && (
                                                                                <p className={`w-[10%] lg:w-[10%] 2xl:w-[7.5%] text-center truncate mt-0`}>
                                                                                    {item.superficie} m²
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 640 && (
                                                                                <p className={`w-[15%] lg:w-[12.5%] xl:w-[12.5%] 2xl:w-[10%] text-center truncate mt-0`}>
                                                                                    {item.zona}
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 1024 && (
                                                                                <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                                                    {item.noticia?.prioridad === 'Baja' ? (
                                                                                        <>
                                                                                            <div className='flex flex-row justify-center items-center'>
                                                                                                <p className='text-center text-green-900 bg-green-100 border border-green-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Baja</p>
                                                                                            </div>
                                                                                        </>
                                                                                    ) : (
                                                                                        <div className='flex flex-row justify-center items-center'>
                                                                                            <p className='text-center text-red-900 bg-red-100 border border-red-900 rounded-md w-min px-2 mx-auto my-auto text-xs'>Alta</p>
                                                                                        </div>
                                                                                    )}
                                                                                </p>
                                                                            )}

                                                                            {screenWidth > 1280 && (
                                                                                <p className={`w-[7.5%] text-center truncate mt-0`}>
                                                                                    {item.noticia?.tipo_PV}
                                                                                </p>
                                                                            )}

                                                                            {screenWidth > 1024 && (
                                                                                <p className={`w-[12.5%] text-center truncate mt-0`}>
                                                                                    {item.noticia?.valoracion === 1 ? (
                                                                                        <>
                                                                                            {item.noticia.valoracion_establecida?.toLocaleString('es-ES')} €

                                                                                        </>
                                                                                    ) : (
                                                                                        <></>
                                                                                    )}
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 1536 && (
                                                                                <p className={`w-[10%] text-center truncate mt-0`}>
                                                                                    {item.categoria}
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 450 && (
                                                                                <div className="flex flex-col gap-2 py-6 w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] h-fit justify-center items-center">
                                                                                    {item.noticiastate === true && (
                                                                                        <p className='bg-blue-100 text-center text-blue-900 rounded-md border border-blue-900 w-min px-2 mx-auto my-auto text-sm'>Noticia</p>
                                                                                    )}
                                                                                    {item.encargostate === true && (
                                                                                        <p className='bg-orange-100 text-center text-orange-900 rounded-md border border-orange-900 w-min px-2 mx-auto my-auto text-sm'>Encargo</p>

                                                                                    )}
                                                                                </div>
                                                                            )}

                                                                        </>
                                                                    ) : paginaBuscador === 'Encargos' ? (
                                                                        <>
                                                                            <p className={`w-[100%] ${screenWidth > 450 ? 'w-[72.5%]' : ''} sm:w-[55%] md:w-[45%] lg:w-[40%] xl:w-[37.5%] 2xl:w-[35%] text-center truncate`} style={{ marginTop: '0px' }}>
                                                                                {item.direccion}
                                                                            </p>
                                                                            {screenWidth > 768 && (
                                                                                <p className={`w-[10%] lg:w-[10%] 2xl:w-[7.5%] text-center truncate mt-0`}>
                                                                                    {item.encargo?.tipo_encargo}
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 640 && (
                                                                                <p className={`w-[15%] lg:w-[12.5%] xl:w-[12.5%] 2xl:w-[10%] text-center truncate mt-0`}>
                                                                                    {item.encargo?.precio_1?.toLocaleString('es-ES')} €
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 640 && (
                                                                                <>
                                                                                    {item.encargo?.precio_2 ? (
                                                                                        <p className={`w-[15%] lg:w-[12.5%] xl:w-[12.5%] 2xl:w-[10%] text-center truncate mt-0`}>
                                                                                            {item.encargo?.precio_2?.toLocaleString('es-ES')} €
                                                                                        </p>
                                                                                    ) : (
                                                                                        <p className={`w-[15%] lg:w-[12.5%] xl:w-[12.5%] 2xl:w-[10%] text-center truncate mt-0`}>

                                                                                        </p>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                            {screenWidth > 1024 && (
                                                                                <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                                                    {item.encargo?.comisionComprador === 'Porcentaje' ? (
                                                                                        <>
                                                                                            <div className='flex flex-col justify-center items-center'>
                                                                                                <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                                                    {item.encargo?.comisionCompradorValue?.toLocaleString('es-ES')}%
                                                                                                </p>
                                                                                                <div className='h-[1px] w-full my-1 bg-slate-500'></div>
                                                                                                <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                                                    {item.encargo?.comisionCompradorValue?.toLocaleString('es-ES')}€
                                                                                                </p>
                                                                                            </div>
                                                                                        </>
                                                                                    ) : item.encargo?.comisionComprador === 'Fijo' ? (
                                                                                        <>
                                                                                            <div className='flex flex-col justify-center items-center'>
                                                                                                <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                                                    {item.encargo?.comisionCompradorValue?.toLocaleString('es-ES')}€
                                                                                                </p>
                                                                                            </div>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <div className='flex flex-row justify-center items-center'>
                                                                                                <p className='text-center rounded-md w-min px-2 mx-auto my-auto text-xs'></p>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 1024 && (
                                                                                <p className={`w-[10%] xl:w-[10%] text-center truncate mt-0`}>
                                                                                    {item.encargo?.tipo_comision_encargo === 'Porcentaje' ? (
                                                                                        <>
                                                                                            <div className='flex flex-col justify-center items-center'>
                                                                                                <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                                                    {item.encargo?.comision_encargo?.toLocaleString('es-ES')}%
                                                                                                </p>
                                                                                                <div className='h-[1px] w-full my-1 bg-slate-500'></div>
                                                                                                <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                                                    {(
                                                                                                        (item.encargo?.precio_2 ?? item.encargo?.precio_1) *
                                                                                                        (item.encargo?.comision_encargo ?? 0) / 100
                                                                                                    )?.toLocaleString('es-ES')} €
                                                                                                </p>
                                                                                            </div>
                                                                                        </>
                                                                                    ) : item.encargo?.tipo_comision_encargo === 'Fijo' ? (
                                                                                        <>
                                                                                            <div className='flex flex-col justify-center items-center'>
                                                                                                <p className='text-center w-min px-2 mx-auto my-auto text-xs'>
                                                                                                    {item.encargo?.comision_encargo?.toLocaleString('es-ES')}€
                                                                                                </p>
                                                                                            </div>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <div className='flex flex-row justify-center items-center'>
                                                                                                <p className='text-center rounded-md w-min px-2 mx-auto my-auto text-xs'></p>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </p>
                                                                            )}



                                                                            {screenWidth > 1536 && (
                                                                                <p className={`w-[10%] text-center truncate mt-0`}>
                                                                                    {item.categoria}
                                                                                </p>
                                                                            )}
                                                                            {screenWidth > 450 && (
                                                                                <div className="flex flex-col gap-2 py-6 w-[22.5%] sm:w-[20%] lg:w-[20%] xl:w-[17.5%] 2xl:w-[15%] h-fit justify-center items-center">
                                                                                    {item.noticiastate === true && (
                                                                                        <p className='bg-blue-100 text-center text-blue-900 rounded-md border border-blue-900 w-min px-2 mx-auto my-auto text-sm'>Noticia</p>
                                                                                    )}
                                                                                    {item.encargostate === true && (
                                                                                        <p className='bg-orange-100 text-center text-orange-900 rounded-md border border-orange-900 w-min px-2 mx-auto my-auto text-sm'>Encargo</p>

                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        null
                                                                    )}


                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        item.tipoagrupacion === 2 && (
                                                            <div
                                                                className={`edificioagrupacion relative border border-gray-400 mb-0 p-0 rounded-md shadow-xl flex items-center flex-col w-full bg-gray-100 transition-all duration-300 ease-in-out`}
                                                            >
                                                                <div
                                                                    onClick={() => handleToggle(item.id)}
                                                                    className="flex flex-row justify-stretch items-center gap-2 w-full cursor-pointer"
                                                                >
                                                                    {showDeleteInmuebleButtons && (
                                                                        <Checkbox
                                                                            checked={selectedItems.has(item.id)}
                                                                            onChange={() => handleCheckboxChange(item.id)}
                                                                            className="mr-4 ml-4 h-fit w-fit p-0"
                                                                        />
                                                                    )}
                                                                    <div className="flex flex-row justify-evenly items-center w-full py-2 px-4 h-[4.5rem]">
                                                                        <span className="flex flex-row justify-start items-center w-[50%] pl-1">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                                                                                <g fill="none">
                                                                                    <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                                                                                    <path fill="currentColor" d="M3 19h1V6.36a1.5 1.5 0 0 1 1.026-1.423l8-2.666A1.5 1.5 0 0 1 15 3.694V19h1V9.99a.5.5 0 0 1 .598-.49l2.196.44A1.5 1.5 0 0 1 20 11.41V19h1a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2" />
                                                                                </g>
                                                                            </svg>
                                                                            <p className="w-[60%] text-center">{item.direccion}</p>
                                                                        </span>
                                                                        <p className="text-start w-[30%] ">{item.zona === 'NULL' ? 'N/A' : item.zona}</p>
                                                                        <div
                                                                            className={`cursor-pointer flex flex-row justify-center w-[20%] transition-transform duration-[1000ms] ${expandedItems[item.id] ? 'rotate-180' : 'rotate-0'}`}
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24">
                                                                                <path fill="currentColor" d="M18.2 13.3L12 7l-6.2 6.3c-.2.2-.3.5-.3.7s.1.5.3.7c.2.2.4.3.7.3h11c.3 0 .5-.1.7-.3c.2-.2.3-.5.3-.7s-.1-.5-.3-.7" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    ref={contentRef}
                                                                    style={{
                                                                        maxHeight: expandedItems[item.id] ? `10000px` : '0',
                                                                        width: '100%',
                                                                    }}
                                                                    className={`overflow-hidden transition-max-height duration-[1000ms] ease-in-out`}
                                                                >
                                                                    <div className="p-2 w-full">
                                                                        {expandedItems[item.id] && edifciosChildren(item)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    ),
                                                )
                                            ) : (
                                                <div className="flex mt-4 pb-4 w-full flex-row items-center justify-center">
                                                    <p>No hay resultados</p>
                                                </div>
                                            )

                                        )}

                                        {data.length > 0 && (

                                            <div className="flex mt-4 pb-4 w-full xl:w-[60%] flex-row items-center justify-center">
                                                <div className="flex flex-row justify-center items-center gap-3">

                                                    <button type="button" onClick={handlePrevious} disabled={currentPage === 1 || loadingPage} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[100px]">
                                                        Anterior
                                                    </button>


                                                    <div className="text-gray-700 font-semibold">
                                                        Página {currentPage} de {totalPages}
                                                    </div>


                                                    <button type="button" onClick={handleNext} disabled={currentPage === totalPages || loadingPage} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[100px]">
                                                        Siguiente
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                    <div className={`${showAnalytics ? 'xl:w-[40%]' : 'xl:w-[0%]'} transition-all duration-[1000ms] ease-in-out`}>
                                        {screenWidth >= 1280 && showAnalytics && (
                                            <>
                                                <Analytics analyticsData={analyticsData} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )
                }

                <Modal open={showPopup} onClose={handlePopupToggle} size="md" backdrop>
                    <Modal.Header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', marginTop: '10px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                        <Modal.Title>{!showFormType ? 'Agrupar Inmueble' : showFormType === 'new' ? 'Crear nuevo grupo' : 'Asignar a grupo existente'}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {!showFormType && (
                            <>
                                <div className="flex flex-col gap-4 text-center mx-auto w-fit mt-4">
                                    <Button appearance="primary" onClick={() => setShowFormType('new')} block>
                                        Crear nuevo grupo
                                    </Button>
                                    <Button appearance="primary" onClick={() => setShowFormType('existing')} block>
                                        Asignar a grupo existente
                                    </Button>
                                    <Button appearance="subtle" onClick={handlePopupToggle} block>
                                        Cerrar
                                    </Button>
                                </div>
                            </>
                        )}

                        {showFormType === 'new' && (
                            <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
                                <Button appearance="default" onClick={() => setShowFormType('')} icon={<i className="rs-icon rs-icon-arrow-left-line" />} className='flex flex-row gap-2 w-fit mx-auto'>
                                    <FaArrowLeft />
                                    <p>Volver atrás</p>
                                </Button>
                                <div className='flex flex-col gap-4 w-fit mx-auto'>
                                    <p className='text-slate-900 text-center font-sans'>Elige el tipo de agrupación:</p>
                                    <RadioGroup name="tipo" onChange={(value) => setFormData({ ...formData, tipo: value })} value={formData.tipo} style={{ gap: '35px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                                        <Radio value="Edificio" className={`${formData.tipo === 'Edificio' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 border-2 border-slate-500'} rounded-xl w-[fit] md:hover:bg-slate-800 md:hover:text-white md:hover:border-slate-800 md:hover:cursor-pointer flex flex-row gap-2 items-center justify-center crearnuevogruporadio`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
                                                <g fill="none">
                                                    <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                                                    <path fill="currentColor" d="M3 19h1V6.36a1.5 1.5 0 0 1 1.026-1.423l8-2.666A1.5 1.5 0 0 1 15 3.694V19h1V9.99a.5.5 0 0 1 .598-.49l2.196.44A1.5 1.5 0 0 1 20 11.41V19h1a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2" />
                                                </g>
                                            </svg> Edificio</Radio>


                                        <Radio value="Escalera" className={`${formData.tipo === 'Escalera' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 border-2 border-slate-500'} rounded-xl w-[fit] md:hover:bg-slate-800 md:hover:text-white md:hover:border-slate-800 md:hover:cursor-pointer flex flex-row gap-2 items-center justify-center crearnuevogruporadio`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
                                                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 5h-5v5h-5v5H7v5H2" />
                                            </svg> Escalera</Radio>

                                    </RadioGroup>
                                </div>

                                {formData.tipo && (
                                    <>
                                        <div className='flex flex-col gap-4 w-2/4 mx-auto mt-4'>
                                            <label>Nombre:</label>
                                            <input type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} className="rs-input" placeholder={`Dirección de ${formData.tipo}`} />

                                            {formData.tipo === 'Escalera' && (
                                                <div className='flex flex-col gap-4 w-full mx-auto mt-4'>
                                                    <label>Grupo:</label>
                                                    <SelectPicker
                                                        data={optionsNuevoGrupoEscalera}
                                                        value={formData.grupo}
                                                        onChange={(value) => setFormData({ ...formData, grupo: value })}
                                                        placeholder="Seleccione un grupo"
                                                        searchable
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-center gap-4 mt-4">
                                    <Button type="submit" appearance="primary">Crear</Button>
                                    <Button onClick={handlePopupToggle} appearance="subtle">Cerrar</Button>
                                </div>
                            </form>
                        )}

                        {showFormType === 'existing' && (
                            <form className="flex flex-col gap-4">
                                <Button appearance="default" onClick={() => setShowFormType('')} icon={<i className="rs-icon rs-icon-arrow-left-line" />} className='flex flex-row gap-2 w-fit mx-auto'>
                                    <FaArrowLeft />
                                    <p>Volver atrás</p>
                                </Button>
                                <div className='flex flex-col gap-4 w-fit mx-auto'>
                                    <p className='text-slate-900 text-center font-sans'>Elige el tipo de agrupación:</p>
                                    <RadioGroup name="tipo" onChange={(value) => setSelectedType(value)} value={selectedType} className='radiogroupselector'>

                                        <Radio value="Edificio" className={`${selectedType === 'Edificio' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 border-2 border-slate-500'} rounded-xl w-[fit] md:hover:bg-slate-800 md:hover:text-white md:hover:border-slate-800 md:hover:cursor-pointer flex flex-row gap-2 items-center justify-center crearnuevogruporadio`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
                                                <g fill="none">
                                                    <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                                                    <path fill="currentColor" d="M3 19h1V6.36a1.5 1.5 0 0 1 1.026-1.423l8-2.666A1.5 1.5 0 0 1 15 3.694V19h1V9.99a.5.5 0 0 1 .598-.49l2.196.44A1.5 1.5 0 0 1 20 11.41V19h1a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2" />
                                                </g>
                                            </svg> Edificio</Radio>


                                        <Radio value="Escalera" className={`${selectedType === 'Escalera' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 border-2 border-slate-500'} rounded-xl w-[fit] md:hover:bg-slate-800 md:hover:text-white md:hover:border-slate-800 md:hover:cursor-pointer flex flex-row gap-2 items-center justify-center crearnuevogruporadio`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
                                                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 5h-5v5h-5v5H7v5H2" />
                                            </svg> Escalera</Radio>

                                    </RadioGroup>
                                </div>
                                {selectedType && (
                                    <>
                                        <div className='flex flex-col gap-4 w-2/4 mx-auto mt-4'>
                                            <label>Elige {selectedType}:</label>
                                            <SelectPicker
                                                data={options}
                                                value={formData.existingGroup}
                                                onChange={handleChangeExistingGroup}
                                                placeholder={`Selecciona ${selectedType}`}
                                                searchable
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-center gap-4 mt-4">
                                    <Button type="submit" appearance="primary" onClick={handleSubmitForm}>Asignar</Button>
                                    <Button onClick={handlePopupToggle} appearance="subtle">Cerrar</Button>
                                </div>
                            </form>
                        )}
                    </Modal.Body>
                </Modal>

                <Modal open={showPopupUngroup} onClose={handlePopupToggleUngroup} backdrop size="xs">
                    <Modal.Header>
                        <Modal.Title style={{ fontSize: '1.5rem', textAlign: 'center' }}>Desagrupar</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div className="text-center py-10">
                            <p className='text-slate-900 text-lg'>Se van a desagrupar los elementos seleccionados.</p>
                            <p className='text-slate-900 text-lg'>¿Está seguro?</p>
                        </div>
                    </Modal.Body>

                    <Modal.Footer className="flex justify-center gap-4">
                        <Button onClick={handleSubmitFormUngroup} appearance="primary" className="w-[120px]">
                            Desagrupar
                        </Button>
                        <Button onClick={handlePopupToggleUngroup} appearance="default" className="w-[120px]">
                            Cancelar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div >


            <Modal open={showAskForDeleteOrphan} onClose={handleKeepOrphan} backdrop size="xs">
                <Modal.Header>
                    <Modal.Title style={{ fontSize: '1.5rem', textAlign: 'center' }}>Grupo vacío</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className='flex flex-col justify-center items-center gap-4 w-full py-8'>
                        <p className='font-sans text-slate-900 text-lg text-center'>Los siguientes grupos se han quedado vacíos:</p>
                        {orphanInfo.map((info, index) => (
                            <p className='font-sans text-slate-900 text-lg text-center' key={index}>{info.direccion}</p>
                        ))}
                        <p className='font-sans text-slate-900 text-lg text-center'>¿Desea eliminarlos?</p>
                    </div>
                </Modal.Body>

                <Modal.Footer className="flex justify-center gap-4">
                    <Button appearance="primary" onClick={handleKeepOrphan} className="w-[120px]">
                        Mantener
                    </Button>
                    <Button appearance="primary" color="red" onClick={handleDeleteOrphan} className="w-[120px]">
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal open={showPopupDeleteInmueble} onClose={handleKeepDeleteInmueble} backdrop={true} size="xs">
                <Modal.Header>
                    <Modal.Title style={{ fontSize: '1.5rem', textAlign: 'center' }}>Eliminar elemento</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {thereAreChildrenDelete ? (
                        <div className="flex flex-col gap-4 w-full justify-center items-center text-center">
                            <div className='py-10 flex flex-col gap-4 w-full justify-center items-center text-center'>
                                <p className='font-sans text-slate-900 text-lg'>Alguno de los elementos seleccionados contiene elementos agrupados.</p>
                                <p className='font-sans text-slate-900 text-lg'>¿Desea eliminar los elementos agrupados o mantenerlos?</p>
                            </div>
                            <div className="flex flex-row justify-center items-center gap-4 mb-6">
                                <Button appearance="primary" color="red" onClick={handleDeleteInmueble}>
                                    Eliminar
                                </Button>
                                <Button appearance="primary" onClick={handleDeleteKeepChildren}>
                                    Mantener
                                </Button>
                            </div>
                            <Button appearance="default" onClick={handleKeepDeleteInmueble} className="bg-red-500 hover:bg-red-700 text-white">
                                Cancelar
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 w-full justify-center items-center text-center">
                            <div className='py-10'>
                                <p className='font-sans text-slate-900 text-lg'>¿Está seguro?</p>
                            </div>
                            <div className="flex justify-center gap-4">
                                <Button appearance="primary" onClick={handleDeleteInmueble}>
                                    Eliminar
                                </Button>
                                <Button appearance="default" onClick={handleKeepDeleteInmueble}>
                                    Cancelar
                                </Button>
                            </div>

                        </div>
                    )}
                </Modal.Body>
            </Modal>
            {
                showAddNewInmueble && (
                    <AddNewInmueble
                        showAddNewInmueble={showAddNewInmueble}
                        setShowAddNewInmueble={setShowAddNewInmueble}
                        fetchData={fetchData}
                        currentPage={currentPage}
                        searchTerm={searchTerm}
                        handleIconAddInmueble={handleIconAddInmueble}
                        screenWidth={screenWidth}
                    />
                )
            }
        </div >
    );
};

export default Table;
