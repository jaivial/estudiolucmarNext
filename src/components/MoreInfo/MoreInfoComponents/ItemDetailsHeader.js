import React, { useState, useEffect, useRef, use } from 'react';
import axios from 'axios';
import { AiOutlineCamera, AiOutlinePlus, AiOutlineLoading, AiOutlineDelete } from 'react-icons/ai';
import Toastify from 'toastify-js';
import { Modal, Button } from 'rsuite';
import 'rsuite/dist/rsuite.min.css'; // Import the rsuite CSS
import './ItemsDetailsHeader.css';
import EditButton from './EditButton';
import imageCompression from 'browser-image-compression';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons

const ItemDetailsHeader = ({ inmuebleId, onClose, address, setImages, setIsSliderLoading, isVisible, setIsVisible }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadStatus, setUploadStatus] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [hoveredSlot, setHoveredSlot] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const modalRef = useRef(null);
    const containerRef = useRef(null);
    const getFileRef = useRef(null);
    const buttonUploadRef = useRef(null);
    const slotRefs = useRef([]);
    const [getImageRefreshKey, setGetImageRefreshKey] = useState(1);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [isImageValid, setIsImageValid] = useState(true);


    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    useEffect(() => {
        const loadImages = async () => {
            try {
                const response = await axios.get('/api/getImages', {
                    params: { inmueble_id: inmuebleId },
                });
                console.log('response', response);
                if (response.data.status === 'success') {
                    const images = response.data.images || [];
                    setUploadedImages(images);
                    setImages(images); // Pass the images to the parent component
                } else {
                    console.error('Error fetching images:', response.data.message);
                }
            } catch (error) {
                console.error('Error fetching images:', error);
            } finally {
                setIsSliderLoading(false);
            }
        };

        if (inmuebleId) {
            setIsSliderLoading(true);
            loadImages();
        }
    }, [inmuebleId, getImageRefreshKey]);

    const handleFileChange = async (event) => {
        setSelectedFiles(event.target.files);
    };

    useEffect(() => {
        console.log('uploadedImages', selectedFiles);
        console.log('selectedFiles', selectedFiles);
    }, [selectedFiles]);


    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            Toastify({
                text: 'Selecciona un archivo',
                duration: 2500,
                gravity: 'top',
                position: 'center',
                style: {
                    borderRadius: '10px',
                    backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                    textAlign: 'center',
                },
            }).showToast();
            return;
        }

        setIsUploading(true);

        const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const compressedFiles = [];

        for (const file of selectedFiles) {
            if (!supportedFormats.includes(file.type)) {
                Toastify({
                    text: 'Unsupported file format',
                    duration: 2500,
                    gravity: 'top',
                    position: 'center',
                    style: {
                        borderRadius: '10px',
                        backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                        textAlign: 'center',
                    },
                }).showToast();
                setIsImageValid(false);
                return;
            }

            setIsImageValid(true);

            try {
                // Compress the image
                const options = {
                    maxSizeMB: 0.15, // 0.15 MB = 150KB
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);

                // Convert compressed file to base64
                const base64Data = await imageCompression.getDataUrlFromFile(compressedFile);

                compressedFiles.push({
                    name: compressedFile.name,
                    data: base64Data.split(',')[1], // Remove the "data:image/jpeg;base64," part
                    mimetype: compressedFile.type,
                });
            } catch (error) {
                console.error('Error during compression:', error);
                setUploadStatus('Error during compression.');
                Toastify({
                    text: 'Error during compression.',
                    duration: 2500,
                    gravity: 'top',
                    position: 'center',
                    style: {
                        borderRadius: '10px',
                        backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                        textAlign: 'center',
                    },
                }).showToast();
                setIsUploading(false);
                return;
            }
        }

        console.log('images', compressedFiles);
        console.log('inmuebleId', inmuebleId);

        try {
            const response = await axios.post('/api/uploadImages', {
                inmueble_id: inmuebleId,
                images: compressedFiles
            });
            console.log('response', response);

            if (response.data.status === 'success') {
                setUploadStatus('Images uploaded successfully!');
                setUploadedImages((prevImages) => [...prevImages]);
                Toastify({
                    text: 'Fotos subidas correctamente',
                    duration: 2500,
                    gravity: 'top',
                    position: 'center',
                    style: {
                        borderRadius: '10px',
                        backgroundImage: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)',
                        textAlign: 'center',
                    },
                }).showToast();
                setGetImageRefreshKey(getImageRefreshKey + 1);
            } else {
                setUploadStatus('Error uploading images.');
                Toastify({
                    text: 'Error uploading images.',
                    duration: 2500,
                    gravity: 'top',
                    position: 'center',
                    style: {
                        borderRadius: '10px',
                        backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                        textAlign: 'center',
                    },
                }).showToast();
            }
        } catch (error) {
            setUploadStatus('Error uploading images.');
            console.error('Error uploading images:', error);
            Toastify({
                text: 'Error uploading images.',
                duration: 2500,
                gravity: 'top',
                position: 'center',
                style: {
                    borderRadius: '10px',
                    backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                    textAlign: 'center',
                },
            }).showToast();
        } finally {
            setIsUploading(false);
            setSelectedFiles([]);
        }
    };

    const handleDeleteImage = async (index) => {
        try {
            console.log('handleDeleteImage', inmuebleId, uploadedImages[index].id);
            const response = await axios.post('/api/deleteImageInmueble', {
                inmueble_id: inmuebleId,
                image_id: uploadedImages[index].id,
            });

            if (response.data.status === 'success') {
                Toastify({
                    text: 'Image deleted successfully',
                    duration: 2500,
                    gravity: 'top',
                    position: 'center',
                    style: {
                        borderRadius: '10px',
                        backgroundImage: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)',
                        textAlign: 'center',
                    },
                }).showToast();

                setUploadedImages((prevImages) => {
                    const newImages = [...prevImages];
                    newImages[index] = null;
                    return newImages;
                });
                setGetImageRefreshKey((prevKey) => prevKey + 1);
            } else {
                Toastify({
                    text: 'Failed to delete image',
                    duration: 2500,
                    gravity: 'top',
                    position: 'center',
                    style: {
                        borderRadius: '10px',
                        backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                        textAlign: 'center',
                    },
                }).showToast();
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            Toastify({
                text: 'Error occurred while deleting image',
                duration: 2500,
                gravity: 'top',
                position: 'center',
                style: {
                    borderRadius: '10px',
                    backgroundImage: 'linear-gradient(to right top, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)',
                    textAlign: 'center',
                },
            }).showToast();
        }
    };
    const openEditModal = () => setEditModalOpen(true);
    const closeEditModal = () => setEditModalOpen(false);


    const renderSlots = () => {
        const slots = [];
        for (let i = 0; i < 12; i++) {
            const image = uploadedImages[i];
            const isEmpty = !image || !image.data;
            const isImageSlot = !isEmpty;

            slots.push(
                <div
                    key={i}
                    className={`relative w-24 h-24 flex items-center justify-center rounded-lg ${isImageSlot ? 'border border-gray-300' : 'cursor-pointer'} ${hoveredSlot === i ? (isImageSlot ? 'bg-blue-300 opacity-100' : 'bg-gray-100 opacity-50') : ''}`}
                    onMouseEnter={() => setHoveredSlot(i)}
                    onMouseLeave={() => setHoveredSlot(null)}
                    onClick={() => {
                        if (isImageSlot) {
                            handleDeleteImage(i);
                        } else {
                            setSelectedSlot(i);
                            openFileInput(); // Open file input for empty slot
                        }
                    }}
                    ref={(el) => (slotRefs.current[i] = el)}
                >
                    {isImageSlot ? <img src={`data:${image.type};base64,${image.data}`} alt={`Slot ${i}`} className="w-full h-full object-cover rounded-lg" /> : <AiOutlineCamera className={`text-gray-500 text-2xl ${hoveredSlot === i ? 'hidden' : ''}`} />}

                    {isImageSlot && hoveredSlot === i && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg cursor-pointer bg-red-500 opacity-100">
                            <AiOutlineDelete className="text-white text-3xl" />
                        </div>
                    )}
                    {!isImageSlot && hoveredSlot === i && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-200 opacity-100 cursor-pointer">
                            <AiOutlinePlus className="text-gray-500 text-2xl" />
                        </div>
                    )}
                </div>,
            );
        }
        return slots;
    };
    const openFileInput = () => getFileRef.current.click(); // Function to open file input

    return (
        <div className="header-container">
            {isModalOpen && <EditModal closeModal={closeModal} />}
            <div className='flex flex-row justify-center gap-3 pb-6'>
                <EditButton onClick={() => setIsModalOpen(true)} />
                <div>
                    <button onClick={openEditModal} className="p-3 rounded-full border border-gray-300 hover:bg-gray-100">
                        <AiOutlineCamera className="text-gray-500 text-2xl" />
                    </button>
                </div>
                <div>
                    <button
                        onClick={toggleVisibility}
                        className="p-3 rounded-full border border-gray-300 hover:bg-gray-100"
                    >
                        {isVisible ? <FaEye size={24} /> : <FaEyeSlash size={24} />}
                    </button>
                </div>
            </div>
            <Modal open={editModalOpen} onClose={closeEditModal} size="lg" overflow={false} backdrop="static" style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '0px 2px' }}>
                <Modal.Header>
                    <Modal.Title className='text-center'>Subir imágenes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="modal-body p-6">
                        {isUploading ? (
                            <div className="flex w-full flex-row items-center justify-center h-80">
                                <AiOutlineLoading className="text-blue-500 text-5xl animate-spin" />
                                <span className="ml-3 text-gray-800 font-sans text-lg font-semibold">Subiendo imágenes...</span>
                            </div>
                        ) : (
                            <div ref={containerRef} className="grid grid-cols-3 gap-5 mb-4">
                                {renderSlots()}
                            </div>
                        )}
                        {selectedSlot !== null && (
                            <>
                                <div className="flex mb-4 flex-col justify-center items-center w-full gap-4">
                                    <input
                                        ref={getFileRef}
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden" // Hide the file input
                                    />
                                    {isProcessing && (
                                        <div className="flex items-center ml-4 text-white py-2 px-4 rounded">
                                            <AiOutlineLoading className="text-blue-500 text-4xl animate-spin" />
                                            <span className="ml-2 text-gray-800 font-sans font-semibold">Cargando imágenes...</span>
                                        </div>
                                    )}
                                </div>

                                {!isProcessing && !isUploading && selectedFiles.length > 0 && (
                                    <div className="flex flex-col items-center justify-center w-full">
                                        <button
                                            ref={buttonUploadRef}
                                            onClick={handleUpload}
                                            className={`bg-blue-500 text-white py-2 px-4 rounded ${isUploading ? 'cursor-wait' : ''}`}
                                            disabled={isUploading}
                                        >
                                            Subir Imágenes
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex flex-row justify-center gap-4">
                    <Button onClick={() => setEditModalOpen(false)} appearance="subtle">
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ItemDetailsHeader;
