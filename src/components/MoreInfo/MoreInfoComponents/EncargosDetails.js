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
import { BiSolidPurchaseTag } from 'react-icons/bi';
import { MdOutlinePriceCheck } from 'react-icons/md';
import { MdAttachMoney } from 'react-icons/md';
import { TbPigMoney } from 'react-icons/tb';
import { FaUserTag } from 'react-icons/fa';
import esES from 'rsuite/locales/es_ES';
import { Accordion, Panel, Modal, Button, InputNumber, DatePicker, CustomProvider, SelectPicker, InputPicker } from 'rsuite'; // Import Accordion and Panel from rsuite


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

const EncargosDetails = ({ data, setOnAddEncargoRefreshKey, onAddEncargoRefreshKey, fetchData, currentPage, searchTerm }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [encargos, setEncargos] = useState([]);
    const [tipoEncargo, setTipoEncargo] = useState('');
    const [selectedAsesor, setSelectedAsesor] = useState(null);
    const [asesorOptions, setAsesorOptions] = useState([]);
    const [precio, setPrecio] = useState('');
    const [tipoComision, setTipoComision] = useState('');
    const [comision, setComision] = useState('');
    const [fecha, setFecha] = useState('');
    const [draggableValue, setDraggableValue] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEncargoId, setCurrentEncargoId] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [clienteOptions, setClienteOptions] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [matchingCliente, setMatchingCliente] = useState([null]);
    const [nombreCliente, setNombreCliente] = useState('');


    const fetchEncargos = async () => {
        if (data.inmueble.encargoState === false) {
            return;
        } else {
            try {
                const inmuebleId = data.inmueble.id;
                const response = await axios.get('/api/encargosFetch', {
                    params: { id: inmuebleId },
                });
                if (response.data !== null) {
                    const encargo = response.data;
                    if (encargo) {
                        setEncargos([encargo]);
                    } else {
                        console.error('No encargo data available');
                        setEncargos([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching encargos:', error);
                setEncargos([]);
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

    const fetchClientes = async () => {
        try {
            const response = await axios.get('/api/seleccionaClienteEncargos');
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
    };

    useEffect(() => {
        fetchEncargos();
        fetchAsesores();
        fetchClientes();
    }, [data]);

    // Function to find the matching clienteOption
    const findNombreCliente = () => {
        if (!clienteOptions || !Array.isArray(clienteOptions)) {
            console.error('Invalid inputs');
            return '';
        }

        const matchingOption = clienteOptions.find((option) => option.id === encargos.encargo_id);
        setMatchingCliente(matchingOption);
        return matchingOption ? matchingOption.label : '';
    };

    useEffect(() => {
        const nombre = findNombreCliente();
        setNombreCliente(nombre);
    }, [encargos, clienteOptions]);

    const handlePopupClose = () => {
        setTipoEncargo('');
        setSelectedAsesor(null);
        setPrecio('');
        setTipoComision('');
        setComision('');
        setFecha('');
        setDraggableValue(0);
        setSelectedCliente(null);
        setIsPopupOpen(false);
    };

    const handleAddEncargo = async () => {
        if (!tipoEncargo) {
            showToast('Selecciona el tipo de encargo', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }

        if (!selectedAsesor) {
            showToast('Selecciona un asesor', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }

        if (!precio) {
            showToast('Introduce el precio', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }

        const params = {
            encargo_id: isEditing ? encargos[0].encargo_id : data.inmueble.id,
            tipoEncargo: tipoEncargo,
            comercial: selectedAsesor,
            cliente: selectedCliente?.value || '',
            precio: precio,
            tipoComision: tipoComision,
            comision: comision,
            fecha: fecha || new Date(),
        };

        console.log('params', params);

        try {
            const endpoint = isEditing ? '/api/updateEncargo' : '/api/agregarEncargo';

            const response = await axios.post(endpoint, params);

            if (response.data) {
                showToast(isEditing ? 'Encargo actualizado' : 'Encargo añadido', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                handlePopupClose();
                await fetchEncargos();
                setOnAddEncargoRefreshKey(onAddEncargoRefreshKey + 1);
                fetchData(currentPage, searchTerm);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error adding/updating encargo:', error);
        }
    };

    const handleEditEncargo = (encargo, asesorOptions, clienteOptions) => {
        console.log('encargo', encargo);
        console.log('asesorOptions', asesorOptions);
        console.log('clienteOptions', clienteOptions);
        // Assuming encargo is the object with the details of the encargo you want to edit
        setTipoEncargo(encargo[0].tipo_encargo);
        setSelectedAsesor({ label: encargo[0].comercial_encargo, value: encargo[0].comercial_encargo });
        setPrecio(encargo[0].precio_1 || '');
        setTipoComision(encargo[0].tipo_comision_encargo || '');
        setComision(encargo[0].comision_encargo || '');
        setFecha(encargo[0].encargo_fecha || '');
        setSelectedCliente({ label: encargo[0].label, value: encargo[0].value });
        setIsEditing(true);
        setCurrentEncargoId(encargo.encargo_id);
        setIsPopupOpen(true);
    };
    useEffect(() => {
        console.log('selectedAsesror', selectedAsesor);
        console.log('selectedCliente', selectedCliente);



    }, [selectedAsesor, selectedCliente]);
    const handleDeleteEncargo = async () => {
        if (!isEditing || !currentEncargoId || !encargos.length) {
            console.error('Encargo ID is missing, not in editing mode, or encargos array is empty.');
            return;
        }

        try {
            const encargoIdToDelete = encargos[0].encargo_id;

            // Make DELETE request to API endpoint with encargo_id as a query parameter
            const response = await axios.delete('/api/deleteEncargo', {
                params: {
                    id: encargoIdToDelete,
                },
            });

            if (response.data.success) {
                showToast('Encargo eliminado correctamente', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');

                // Optional: Filter out the deleted encargo from the array
                const updatedEncargos = encargos.filter(encargo => encargo.encargo_id !== encargoIdToDelete);

                // Update state with the new list of encargos
                setEncargos(updatedEncargos);

                handlePopupClose();
                setIsEditing(false);
                setOnAddEncargoRefreshKey(onAddEncargoRefreshKey + 1);
                fetchData(currentPage, searchTerm);
            } else {
                alert('Error al eliminar el encargo.');
            }
        } catch (error) {
            console.error('Error deleting encargo:', error);
        }
    };

    const formatDate = (dateString) => {
        return moment(dateString).format('DD/MM/YYYY');
    };

    // Helper function to format date to Spanish format
    const formatDateTwo = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD');
    };
    return (
        data.inmueble.noticiastate === true && (
            <CustomProvider locale={esES}>
                <Accordion defaultActiveKey={1} bordered style={{ margin: '0px 16px', marginTop: '20px' }}>
                    <Accordion.Panel style={{ backgroundColor: '#f4f4f5', padding: '0px' }} header={
                        <h2 className="font-bold text-xl">Encargos</h2>
                    } eventKey="1">
                        <div className="p-4">
                            <div className="py-1 px-2 relative">
                                {encargos.length > 0 ? (
                                    <div className="py-2 my-3 flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-2 flex-col w-full">
                                            <IoCalendarNumber className="text-gray-900 text-3xl" />
                                            <p className="text-base text-gray-950 py-1 text-center">{formatDate(encargos[0].encargo_fecha)}</p>
                                            <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-col w-full">
                                            <BiSolidPurchaseTag className="text-gray-900 text-3xl" />
                                            <p className="text-base text-gray-950 py-1 text-center">{encargos[0].tipo_encargo}</p>
                                            <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-col w-full">
                                            <FaUserTag className="text-gray-900 text-3xl" />
                                            <p className="text-base text-gray-950 py-1 text-center">Cliente: {nombreCliente}</p>
                                            <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-col w-full">
                                            <MdAttachMoney className="text-gray-900 text-3xl" />
                                            <p className="text-base text-gray-950 py-1 text-center">Precio: {encargos[0].precio_1} €</p>
                                            <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                        </div>
                                        {encargos[0].tipo_comision_encargo === 'Porcentaje' ? (
                                            <div className="flex items-center gap-2 flex-col w-full">
                                                <TbPigMoney className="text-gray-900 text-3xl" />
                                                <p className="text-base text-gray-950 py-1 text-center"> Comisión</p>
                                                <div className="flex flex-row items-center gap-2">
                                                    <p className="text-base text-gray-950 py-1 text-center">{encargos[0].comision_encargo}%</p>
                                                    <p>|</p>
                                                    <p className="text-base text-gray-950 py-1 text-center">{(encargos[0].precio_1 * encargos[0].comision_encargo) / 100} €</p>
                                                </div>
                                                <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 flex-col w-full">
                                                <TbPigMoney className="text-gray-900 text-3xl" />
                                                <p className="text-base text-gray-950 py-1 text-center">{encargos[0].precio_1} €</p>
                                                <div className="border-b border-gray-300 w-4/6 -mt-1"></div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 flex-col w-full">
                                            <FaUserTie className="text-gray-900 text-3xl" />
                                            <p className="text-base text-gray-950 py-1 text-center">Asesor: {encargos[0].comercial_encargo}</p>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <FiEdit className="text-2xl cursor-pointer text-blue-500" onClick={() => handleEditEncargo(encargos, asesorOptions, clienteOptions)} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center py-3">
                                        <AiOutlinePlus className="text-4xl cursor-pointer text-blue-500" onClick={() => setIsPopupOpen(true)} />
                                    </div>
                                )}
                            </div>

                            <Modal open={isPopupOpen} onClose={handlePopupClose} size="md" overflow={false} backdrop={true} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0px 2px' }}>
                                <Modal.Header style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', marginTop: '10px' }}>
                                    <Modal.Title style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>{isEditing ? 'Editar Encargo' : 'Añadir Encargo'}</Modal.Title>
                                </Modal.Header>
                                <Modal.Body style={{ padding: '10px 25px', fontSize: '1rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', width: '100%' }}>
                                    <div className="flex flex-col gap-4 w-full">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2" htmlFor="tipoEncargo">
                                                Tipo de Encargo
                                            </label>
                                            <Select
                                                id="tipoEncargo"
                                                options={[
                                                    { value: 'Venta', label: 'Venta' },
                                                    { value: 'Alquiler', label: 'Alquiler' },
                                                    { value: 'Comercial', label: 'Comercial' },
                                                ]}
                                                value={tipoEncargo ? { value: tipoEncargo, label: tipoEncargo } : null}
                                                onChange={(option) => setTipoEncargo(option?.value || '')}
                                                placeholder="Selecciona el tipo de encargo"
                                                className='z-[900]'
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2" htmlFor="asesor">
                                                Asesor
                                            </label>
                                            <SelectPicker
                                                data={asesorOptions}
                                                value={selectedAsesor ? selectedAsesor.value : undefined}
                                                onChange={(value, item) => setSelectedAsesor(value)}
                                                placeholder="Asesor"
                                                className="basic-single z-[900]"
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2" htmlFor="cliente">
                                                Cliente
                                            </label>
                                            <SelectPicker
                                                id="cliente"
                                                data={clienteOptions}
                                                value={selectedCliente ? selectedCliente.label : undefined}
                                                onChange={(value, item) => setSelectedCliente(value)}
                                                placeholder="Cliente"
                                                className="basic-single z-[800]"
                                                searchable={true}
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2" htmlFor="precio">
                                                Precio
                                            </label>
                                            <InputNumber
                                                id="precio"
                                                min={0}
                                                value={precio}
                                                onChange={setPrecio}
                                                placeholder="Introduce el precio"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2" htmlFor="tipoComision">
                                                Tipo de Comisión
                                            </label>
                                            <Select
                                                id="tipoComision"
                                                options={[
                                                    { value: 'Porcentaje', label: 'Porcentaje' },
                                                    { value: 'Fijo', label: 'Fijo' },
                                                ]}
                                                value={tipoComision ? { value: tipoComision, label: tipoComision } : null}
                                                onChange={(option) => setTipoComision(option?.value || '')}
                                                placeholder="Selecciona el tipo de comisión"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2" htmlFor="comision">
                                                Comisión
                                            </label>
                                            <InputNumber
                                                id="comision"
                                                min={0}
                                                value={comision}
                                                onChange={setComision}
                                                placeholder="Introduce la comisión"
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium mb-2" htmlFor="fecha">
                                                Fecha
                                            </label>
                                            <DatePicker
                                                id="fecha"
                                                format="dd/MM/yyyy"
                                                value={fecha ? new Date(fecha) : new Date()}
                                                onChange={(value) => setFecha(formatDateTwo(value))}
                                                placeholder="Fecha"
                                                oneTap
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button onClick={handlePopupClose} appearance="subtle">
                                        Cerrar
                                    </Button>
                                    {isEditing && (
                                        <Button onClick={handleDeleteEncargo} color="red" appearance="primary">
                                            Eliminar
                                        </Button>
                                    )}
                                    <Button onClick={handleAddEncargo} appearance="primary">
                                        {isEditing ? 'Actualizar' : 'Añadir'}
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                    </Accordion.Panel>
                </Accordion>
            </CustomProvider>
        )
    );
};

export default EncargosDetails;
