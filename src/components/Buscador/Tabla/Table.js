import React from 'react';
import TableHeader from './TableHeader.js';
import TableBody from './TableBody.js';
import TableFooter from './TableFooter.js';
import MoreInfo from '../../MoreInfo/MoreInfo.js';
import BuscadorTabs from '../TabsBuscador.js';
import Analytics from '../Analytics.js';
import FilterMenu from '../FilterMenu.js';
import AddNewInmueble from '../AddNewInmueble.js';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { IoAnalytics } from "react-icons/io5";
import Select from 'react-select';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


const Table = ({ parentsEdificioProps, admin, screenWidth, loadingLoader }) => {
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
    const [expandedItems, setExpandedItems] = useState({});
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
        console.log('habitacionesValue', habitacionesValue);
        console.log('typeof habitacionesValue', typeof habitacionesValue);


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
                console.log('searchInmuebles Response:', data); // Log the entire API response
                setData(data.results);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
                console.log('analyticsData', data.analyitics[0]);
                setAnalyticsData(data.analyitics[0]);
                setTotalItems(data.analyitics[0].totalInmuebles);
                console.log('totalItems', data.analyitics[0].totalInmuebles);
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
            console.log('parents edificio', data);

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
    // Handle the change event for react-select
    const handleChangeExistingGroup = (selectedOption) => {
        handleFormChange({
            target: {
                name: 'existingGroup',
                value: selectedOption ? selectedOption.value : '',
            },
        });
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
        console.log('analyticsData', analyticsData);
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

    const handleToggle = (itemId) => {
        setExpandedItems((prev) => ({
            ...prev,
            [itemId]: !prev[itemId],
        }));
    };

    const handleCheckboxChange = (itemId) => {
        setSelectedItems((prev) => {
            const newSelectedItems = new Set(prev);
            newSelectedItems.has(itemId) ? newSelectedItems.delete(itemId) : newSelectedItems.add(itemId);
            return newSelectedItems;
        });
        console.log('selectedItems', selectedItems);
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
        console.log('showAddNewInmueble', showAddNewInmueble);
        console.log('showAddInmuebleButtons', showAddInmuebleButtons);
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
            console.log('selectedItems', selectedItems);
            const response = await axios.post('/api/check_children_nested', {
                inmuebles: Array.from(selectedItems) // Transform Set to Array
            });

            console.log('response', response.data);

            if (response.data.empty) {
                setShowPopupDeleteInmueble(!showPopupDeleteInmueble);
            } else {
                setShowPopupDeleteInmueble(!showPopupDeleteInmueble);
                setThereAreChildrenDelete(true);
                setNestedElements(response.data.nestedElements);
                console.log('nested Elements HERE', response.data.nestedElements);
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
        console.log(formData);
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

                        console.log('response data', response.data); // Debugging line

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
                    console.log('selectedItems', selectedItems);
                    const { data, error } = await axios.post('/api/create_new_escalera_agrupacion', {
                        name: formData.nombre,
                        selectedInmuebles: Array.from(selectedItems),
                        grupo: parseInt(formData.grupo, 10), // Convert grupo to an integer
                    });
                    console.log('data', data); // Debugging line

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
                console.log('data', data);
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
            console.log(response.data);
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
            console.log('orphanInfo', orphanInfo);
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
                console.log(response.data);
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
        console.log('handleDeleteInmueble', Array.from(selectedItems));
        setSmallLoadingScreen(true);
        axios
            .post('/api/delete_inmueble', { // Use POST request
                inmuebles: Array.from(selectedItems),
            })
            .then((response) => {
                console.log(response.data);
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
                console.log(response.data);
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

    const handleClose = () => {
        setSelectedId(null);
        setShowMoreInfo(false); // Close MoreInfo
    };

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
        console.log('escalerasChildren', item);

        if (item === null) {
            return <p>No hay detalles disponibles</p>;
        }

        return (
            <>
                {item.length > 0 &&
                    item.map((child) => (
                        <div
                            key={child.id}
                            className={`relative border py-4 mb-6 rounded-xl shadow-xl flex items-center justify-between flex-row w-full ${child.dataUpdateTime === 'red' ? 'bg-red-100' : child.dataUpdateTime === 'yellow' ? 'bg-yellow-100' : 'bg-green-100'}`}
                        >
                            {showUngroupButtons && <input type="checkbox" checked={selectedItemsUngroup.has(child.id)} onChange={() => handleCheckboxChangeUngroup(child.id)} className="mr-4 ml-4 w-[25px] h-[25px]" />}
                            {showExtraButtons && <input type="checkbox" checked={selectedItems.has(child.id)} onChange={() => handleCheckboxChange(child.id)} className="mr-4 ml-4 w-[25px] h-[25px]" />}
                            {showDeleteInmuebleButtons && <input type="checkbox" checked={selectedItems.has(child.id)} onChange={() => handleCheckboxChange(child.id)} className="mr-4 ml-4 w-[25px] h-[25px]" />}
                            <div className="flex flex-row justify-evenly items-center w-[60%] py-2">
                                <p className="w-[70%] text-center ">{child.direccion}</p>
                                <p className="text-center w-[30%] ">{child.zona === 'NULL' ? 'N/A' : child.zona}</p>
                            </div>
                            <div className="flex flex-row justify-end items-center gap-3 w-[40%]">
                                {child.noticiastate === true && (
                                    <Icon icon="material-symbols:work-alert" />
                                )}
                                {child.encargostate === true && (
                                    <Icon icon="fluent:real-estate-24-filled" />
                                )}
                                <div onClick={() => handleItemClick(child.id)} className="cursor-pointer w-[20%] mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="2.1em" height="2.1em" viewBox="0 0 16 16" className="text-cyan-800 bg-white rounded-full hover:w-[2.5em] hover:h-[2.5em] hover:shadow-lg hover:text-cyan-600">
                                        <path fill="currentColor" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0m1.062 4.312a1 1 0 1 0-2 0v2.75h-2.75a1 1 0 0 0 0 2h2.75v2.75a1 1 0 1 0 2 0v-2.75h2.75a1 1 0 1 0 0-2h-2.75Z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
            </>
        );
    };

    const edifciosChildren = (item) => {

        console.log('edifciosChildren', item.nestedescaleras);

        if (item.nestedinmuebles && item.nestedinmuebles.length === 0 && item.nestedescaleras.length === 0) {
            return <p>No hay detalles disponibles</p>;
        }

        return (
            <>
                {item.nestedinmuebles && item.nestedinmuebles.length > 0 &&
                    item.nestedinmuebles.map((child) => (
                        <div
                            key={child.id}
                            className={`relative border py-4 mb-6 rounded-xl shadow-xl flex items-center justify-between flex-row w-full ${child.dataupdatetime === 'red' ? 'bg-red-100' : child.dataupdatetime === 'yellow' ? 'bg-yellow-100' : 'bg-green-100'}`}
                        >
                            {showUngroupButtons && (
                                <input
                                    type="checkbox"
                                    checked={selectedItemsUngroup.has(child.id)}
                                    onChange={() => handleCheckboxChangeUngroup(child.id)}
                                    className="mr-4 ml-4 w-[25px] h-[25px]"
                                />
                            )}
                            {showExtraButtons && (
                                <input
                                    type="checkbox"
                                    checked={selectedItems.has(child.id)}
                                    onChange={() => handleCheckboxChange(child.id)}
                                    className="mr-4 ml-4 w-[25px] h-[25px]"
                                />
                            )}
                            {showDeleteInmuebleButtons && (
                                <input
                                    type="checkbox"
                                    checked={selectedItems.has(child.id)}
                                    onChange={() => handleCheckboxChange(child.id)}
                                    className="mr-4 ml-4 w-[25px] h-[25px]"
                                />
                            )}
                            <div className="flex flex-row justify-evenly items-center w-[60%] py-2">
                                <p className="w-[70%] text-center">{child.direccion}</p>
                                <p className="text-center w-[30%]">{child.zona === 'NULL' ? 'N/A' : child.zona}</p>
                            </div>
                            <div className="flex flex-row justify-end items-center gap-3 w-[40%]">
                                {child.noticiastate === true && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="2.1em" height="2.1em" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M10 7h4V5.615q0-.269-.173-.442T13.385 5h-2.77q-.269 0-.442.173T10 5.615zm8 15q-1.671 0-2.835-1.164Q14 19.67 14 18t1.165-2.835T18 14t2.836-1.165T22 18t-1.164 2.836T18 22M4.615 20q-.69 0-1.153-.462T3 18.384V8.616q0-.691.463-1.153T4.615 7H9V5.615q0-.69.463-1.153T10.616 4h2.769q.69 0 1.153.462T15 5.615V7h4.385q.69 0 1.152.463T21 8.616v4.198q-.683-.414-1.448-.614T18 12q-2.496 0-4.248 1.752T12 18q0 .506.086 1.009t.262.991zM18 20.423q.2 0 .33-.13t.132-.331t-.131-.331t-.331-.13t-.33.13t-.132.332t.131.33t.331.131m-.385-1.846h.77v-3h-.77z"
                                        />
                                    </svg>
                                )}
                                {child.encargostate === true && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 20 20">
                                        <path
                                            fill="currentColor"
                                            d="M2 3a1 1 0 0 1 2 0h13a1 1 0 1 1 0 2H4v12.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 5 13.5zm3 7a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-2.55a1 1 0 0 0-.336-.748L11.332 8.13a.5.5 0 0 0-.664 0L8.336 10.2a1 1 0 0 0-.336.75z"
                                        />
                                    </svg>
                                )}
                                <div onClick={() => handleItemClick(child.id)} className="cursor-pointer w-[20%] mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="2.1em" height="2.1em" viewBox="0 0 16 16" className="text-cyan-800 bg-white rounded-full hover:w-[2.5em] hover:h-[2.5em] hover:shadow-lg hover:text-cyan-600">
                                        <path fill="currentColor" d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0m1.062 4.312a1 1 0 1 0-2 0v2.75h-2.75a1 1 0 0 0 0 2h2.75v2.75a1 1 0 1 0 2 0v-2.75h2.75a1 1 0 1 0 0-2h-2.75Z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}

                {item.nestedescaleras && item.nestedescaleras.length > 0 &&
                    item.nestedescaleras.map((child) => (
                        <div
                            key={child.id}
                            className={`relative border py-2 mb-6 rounded-xl shadow-xl flex items-center flex-col w-full border-zinc-400 bg-zinc-100`}
                        >
                            <div className="flex flex-row justify-start items-center gap-2 w-full cursor-pointer" onClick={() => handleToggle(child.id)}>
                                {showDeleteInmuebleButtons && (
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.has(child.id)}
                                        onChange={() => handleCheckboxChange(child.id)}
                                        className="mr-4 ml-4 w-[25px] h-[25px]"
                                    />
                                )}
                                <div className="flex flex-row justify-start items-center w-[80%] py-2">
                                    <span className="flex flex-row justify-start items-center w-[100%] pl-5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 5h-5v5h-5v5H7v5H2" />
                                        </svg>
                                        <p className="w-[100%] text-center">{child.direccion}</p>
                                    </span>
                                </div>
                                <div className="cursor-pointer flex flex-row justify-center w-[30%]">
                                    {!expandedItems[child.id] && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24">
                                            <path fill="currentColor" fillRule="evenodd" d="M7 9a1 1 0 0 0-.707 1.707l5 5a1 1 0 0 0 1.414 0l5-5A1 1 0 0 0 17 9z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {expandedItems[child.id] && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M18.2 13.3L12 7l-6.2 6.3c-.2.2-.3.5-.3.7s.1.5.3.7c.2.2.4.3.7.3h11c.3 0 .5-.1.7-.3c.2-.2.3-.5.3-.7s-.1-.5-.3-.7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            {expandedItems[child.id] && (
                                console.log('child.nestedInmuebles', child.nestedinmuebles)
                            )}
                            {expandedItems[child.id] && <div className="w-full flex flex-col justify-center items-center px-2">{escalerasChildren(child.nestedinmuebles)}</div>}
                        </div>

                    ))}
            </>
        );
    };


    return (
        <div className="bg-slate-400 h-full w-full overflow-x-hidden">
            <div className="container mx-auto p-4 pb-24 md:p-6 lg:p-8 xl:p-10 2xl:p-12">
                <TableHeader
                    handleSearch={handleSearch}
                    handleClearSearch={handleClearSearch}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    screenWidth={screenWidth}
                />
                <BuscadorTabs
                    paginaBuscador={paginaBuscador}
                    setPaginaBuscador={setPaginaBuscador}
                />
                <TableBody
                    data={data}
                    loadingPage={loadingPage}
                    screenWidth={screenWidth}
                    handleToggle={handleToggle}
                    expandedItems={expandedItems}
                    showExtraButtons={showExtraButtons}
                    showUngroupButtons={showUngroupButtons}
                    showDeleteInmuebleButtons={showDeleteInmuebleButtons}
                    selectedItems={selectedItems}
                    selectedItemsUngroup={selectedItemsUngroup}
                    handleCheckboxChange={handleCheckboxChange}
                    handleCheckboxChangeUngroup={handleCheckboxChangeUngroup}
                    handleItemClick={handleItemClick}
                />
                <TableFooter
                    currentPage={currentPage}
                    totalPages={totalPages}
                    handlePrevious={handlePrevious}
                    handleNext={handleNext}
                    loadingPage={loadingPage}
                />
                {showMoreInfo && (
                    <MoreInfo
                        id={selectedId}
                        onClose={handleClose}
                        showModal={showMoreInfo}
                        setShowModal={setShowMoreInfo}
                        fetchData={fetchData}
                        currentPage={currentPage}
                        searchTerm={searchTerm}
                        admin={admin}
                        screenWidth={screenWidth}
                    />
                )}
                {showAnalytics && screenWidth >= 1280 && (
                    <Analytics analyticsData={analyticsData} />
                )}
                {showFilters && (
                    <FilterMenu
                        setFilters={setFilters}
                        currentPage={currentPage}
                        data={data}
                        setData={setData}
                        filters={filters}
                        setCurrentPage={setCurrentPage}
                        setTotalPages={setTotalPages}
                        setLoading={setLoading}
                        resetFiltersKey={resetFiltersKey}
                        screenWidth={screenWidth}
                        paginaBuscador={paginaBuscador}
                    />
                )}
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
                {showAddInmuebleButtons && (
                    <div className="flex gap-4 mt-4 pb-4 w-full justify-center">

                    </div>
                )}
                {showPopup && (
                    <div className="popup-container fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        <div className="popup-content bg-white p-4 shadow-lg flex flex-col justify-center items-center gap-4 rounded-lg w-4/6">
                            {!showFormType && (
                                <>
                                    <h2 className="text-lg font-bold w-[80%] text-center flex justify-center">Agrupar Inmueble</h2>
                                    <div className="flex flex-col gap-4 w-full justify-center items-center text-center mt-4">
                                        <button onClick={() => setShowFormType('new')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
                                            Crear nuevo grupo
                                        </button>
                                        <button onClick={() => setShowFormType('existing')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
                                            Asignar a grupo existente
                                        </button>
                                        <button type="button" onClick={handlePopupToggle} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                            Cerrar
                                        </button>
                                    </div>
                                </>
                            )}
                            {showFormType === 'new' && (
                                <div className="relative pt-0 flex flex-col justify-center items-center w-[80%]">
                                    <div
                                        className="absolute top-0 -left-7 text-gray-700"
                                        onClick={() => {
                                            setShowFormType('');
                                            setFormData({ tipo: '', nombre: '', existingGroup: '' });
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="2.3em" height="2.3em" viewBox="0 0 20 20">
                                            <path fill="currentColor" fill-rule="evenodd" d="M9.707 16.707a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 1.414L5.414 9H17a1 1 0 1 1 0 2H5.414l4.293 4.293a1 1 0 0 1 0 1.414" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-bold w-[80%] text-center flex justify-center">Crear nuevo grupo</h2>
                                    <form onSubmit={handleSubmitForm} className="flex flex-col gap-4 mt-4">
                                        <div className="flex flex-col gap-3 justify-center items-center mb-2">
                                            <label className="block">Tipo:</label>
                                            <div className="flex gap-4">
                                                <label className="flex flex-row gap-2">
                                                    <input type="radio" name="tipo" value="Edificio" checked={formData.tipo === 'Edificio'} onChange={handleFormChange} />
                                                    Edificio
                                                </label>
                                                <label className="flex flex-row gap-2">
                                                    <input type="radio" name="tipo" value="Escalera" checked={formData.tipo === 'Escalera'} onChange={handleFormChange} />
                                                    Escalera
                                                </label>
                                            </div>
                                        </div>
                                        {formData.tipo === 'Edificio' ? (
                                            <div>
                                                <div>
                                                    <label className="block mb-2">Nombre:</label>
                                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} className="border p-2 rounded w-full" placeholder="Dirección del edificio" />
                                                </div>
                                            </div>
                                        ) : formData.tipo === 'Escalera' ? (
                                            <div className="flex flex-col gap-3 w-full">
                                                <div>
                                                    <label className="block">Nombre:</label>
                                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} className="border p-2 rounded w-full" placeholder="Dirección de la escalera" />{' '}
                                                </div>
                                                <label className="block">Grupo:</label>
                                                <Select
                                                    name="grupo"
                                                    value={optionsNuevoGrupoEscalera.find(option => option.value === formData.grupo) || null} onChange={handleChange}
                                                    options={optionsNuevoGrupoEscalera}
                                                    className="w-full"
                                                    classNamePrefix="react-select"
                                                    placeholder="Seleccione un grupo"
                                                    isClearable
                                                    isSearchable
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block mb-2">Nombre:</label>
                                                <input type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} className="border p-2 rounded w-full" placeholder="Dirección del edificio" />
                                            </div>
                                        )}
                                        <div className="flex gap-4 mt-4 flex-row justify-center items-center">
                                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                                Crear
                                            </button>
                                            <button type="button" onClick={handlePopupToggle} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                                Cerrar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                            {showFormType === 'existing' && (
                                <div className="relative pt-0 flex flex-col justify-center items-center w-[80%]">
                                    <div
                                        className="absolute top-0 -left-7 text-gray-700"
                                        onClick={() => {
                                            setShowFormType('');
                                            setFormData({ tipo: '', nombre: '', existingGroup: '' });
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="2.3em" height="2.3em" viewBox="0 0 20 20">
                                            <path fill="currentColor" fill-rule="evenodd" d="M9.707 16.707a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 1.414L5.414 9H17a1 1 0 1 1 0 2H5.414l4.293 4.293a1 1 0 0 1 0 1.414" clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <h2 className="text-lg font-bold mb-4 w-[70%] text-center flex justify-center">Asignar a grupo existente</h2>
                                    <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-3 justify-center items-center mb-2">
                                            <label className="block">Tipo:</label>
                                            <div className="flex gap-4">
                                                <label className="flex flex-row gap-2">
                                                    <input
                                                        type="radio"
                                                        name="tipo"
                                                        value="Edificio"
                                                        checked={selectedType === 'Edificio'}
                                                        onChange={(e) => {
                                                            setSelectedType('Edificio');
                                                            handleFormChange(e);
                                                        }}
                                                    />
                                                    Edificio
                                                </label>
                                                <label className="flex flex-row gap-2">
                                                    <input
                                                        type="radio"
                                                        name="tipo"
                                                        value="Escalera"
                                                        checked={selectedType === 'Escalera'}
                                                        onChange={(e) => {
                                                            setSelectedType('Escalera');
                                                            handleFormChange(e);
                                                        }}
                                                    />
                                                    Escalera
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block mb-2">Elige un grupo:</label>
                                            <Select
                                                name="existingGroup"
                                                value={options.find(option => option.value === formData.existingGroup) || null}
                                                onChange={handleChangeExistingGroup}
                                                options={options}
                                                className="w-full"
                                                classNamePrefix="react-select"
                                                placeholder="Seleccione un grupo"
                                                isClearable
                                                isSearchable
                                            />
                                        </div>
                                        <div className="flex gap-4 mt-4 flex-row justify-center items-center">
                                            <button type="button" onClick={handlePopupToggle} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                                                Cerrar
                                            </button>
                                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                                Asignar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {showPopupUngroup && (
                    <div className="popup-container fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        <div className="popup-content bg-white p-4 shadow-lg flex flex-col justify-center items-center gap-4 rounded-lg w-4/6">
                            <div className="relative pt-0 flex flex-col justify-center items-center">
                                <div className="absolute top-0 -left-1 text-gray-700" onClick={handlePopupToggleUngroup}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="2.3em" height="2.3em" viewBox="0 0 20 20">
                                        <path fill="currentColor" fill-rule="evenodd" d="M9.707 16.707a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 1.414L5.414 9H17a1 1 0 1 1 0 2H5.414l4.293 4.293a1 1 0 0 1 0 1.414" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-bold mb-4 w-[60%] text-center flex justify-center">Desagrupar</h2>
                                <form onSubmit={handleSubmitFormUngroup} className="flex flex-col justify-center items-center gap-4">
                                    <div className="flex flex-col justify-center items-center gap-4 w-[75%]">
                                        <h2 className="text-center">Se van a desagrupar los elementos seleccionados.</h2>
                                        <h2>¿Está seguro?</h2>
                                        <div className="flex flex-row justify-center items-center gap-4">
                                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center w-[120px]">
                                                Desagrupar
                                            </button>
                                            <button type="button" onClick={handlePopupToggleUngroup} className="bg-red-500 hover:bg-red-700 text-white font-bold text-center py-2 px-4 rounded w-[120px]">
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {showAskForDeleteOrphan && (
                    <div className="popup-container fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        <div className="popup-content bg-white p-4 shadow-lg flex flex-col justify-center items-center gap-4 rounded-lg w-4/6">
                            <h2 className="text-lg font-bold w-[80%] text-center flex justify-center">Los siguientes grupos se han quedado vacíos:</h2>
                            {orphanInfo.map((info, index) => (
                                <p key={index}>{info.direccion}</p>
                            ))}
                            <p>¿Desea eliminarlos?</p>
                            <div className="flex justify-center gap-4">
                                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[120px]" onClick={handleKeepOrphan}>
                                    Mantener
                                </button>
                                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-[120px]" onClick={handleDeleteOrphan}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {showPopupDeleteInmueble && (
                    <div className="popup-container fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
                        <div className="popup-content bg-white p-4 shadow-lg flex flex-col justify-center items-center gap-4 rounded-lg w-4/6">
                            <h2 className="text-lg font-bold w-[80%] text-center flex justify-center">Eliminar elemento</h2>
                            {thereAreChildrenDelete ? (
                                <div className="flex flex-col gap-4 w-fit justify-center items-center">
                                    <p className="text-center w-full">Alguno de los elementos seleccionados contiene elementos agrupados.</p>
                                    <p className="text-center w-full">¿Desea eliminar los elementos agrupados o mantenerlos?</p>
                                    <div className="flex flex-row justify-center items-center gap-4">
                                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleDeleteInmueble}>
                                            Eliminar
                                        </button>
                                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleDeleteKeepChildren}>
                                            Mantener
                                        </button>
                                    </div>
                                    <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleKeepDeleteInmueble}>
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 w-full justify-center items-center text-center">
                                    <p>¿Está seguro?</p>
                                    <div className="flex justify-center gap-4">
                                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleDeleteInmueble}>
                                            Eliminar
                                        </button>
                                        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleKeepDeleteInmueble}>
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {showAddNewInmueble && (
                    <AddNew Inmueble
                        showAddNewInmueble={showAddNewInmueble}
                        setShowAddNewInmueble={setShowAddNewInmueble}
                        fetchData={fetchData}
                        currentPage={currentPage}
                        searchTerm={searchTerm}
                        handleIconAddInmueble={handleIconAddInmueble}
                    />
                )}
            </div>
        </div>
    );
};

export default Table;