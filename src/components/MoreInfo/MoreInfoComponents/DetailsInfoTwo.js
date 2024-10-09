import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Toastify from 'toastify-js';
import { AiOutlineEdit, AiOutlineCheck } from 'react-icons/ai';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS

// Function to show a Toastify notification
const showToast = (message, backgroundColor) => {
    Toastify({
        text: message,
        duration: 2500,
        gravity: 'top', // `top` or `bottom`
        position: 'center', // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            borderRadius: '10px',
            backgroundImage: backgroundColor,
            textAlign: 'center',
        },
        onClick: function () { }, // Callback after click
    }).showToast();
};

const DetailsInfoTwo = ({ data, descripcion, setDescripcion, newDescripcion, setNewDescripcion, screenWidth }) => {
    const [isEditing, setIsEditing] = useState(false);



    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setNewDescripcion(descripcion); // Reset newDescripcion to the original descripcion
    };

    // Function to handle save button click
    const handleSaveClick = async () => {
        const inmuebleId = data.inmueble.id;
        try {
            // Make a PUT request to the new API endpoint
            const response = await axios.get('/api/updateDescripcionInmueble', {
                params: {
                    id: inmuebleId,
                    descripcion: newDescripcion,
                },
            });

            if (response.data.status === 'success') {
                setDescripcion(newDescripcion); // Update descripcion state with newDescripcion
                setIsEditing(false);
                showToast('Descripción actualizada', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            } else {
                showToast(response.data.message, 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            }
        } catch (error) {
            console.error('Error updating description:', error);
            showToast('Error updating description', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    // Function to handle input change
    const handleInputChange = (e) => {
        setNewDescripcion(e.target.value);
    };

    // Function to convert newlines to <br> tags
    const formatDescription = (text) => {
        if (!text) return '';
        return text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                <br />
            </React.Fragment>
        ));
    };

    return (
        <div className={`${screenWidth >= 640 ? 'pl-4 pr-0' : 'p-4'} w-full`}>
            {descripcion !== '' && descripcion !== null ? (
                <div className="relative px-2">
                    <div className="font-bold text-lg pb-2">
                        <h1 className='text-start text-2xl'>Descripción del inmueble</h1>
                    </div>
                    {isEditing ? (
                        <>
                            <textarea value={newDescripcion} onChange={handleInputChange} maxLength="900" className="w-full p-2 border border-gray-300 rounded-md" rows="8" />
                            <div className="flex justify-center gap-2 mt-2">
                                <button onClick={handleSaveClick} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                    <AiOutlineCheck className="inline mr-1" /> Guardar
                                </button>
                                <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded-md">
                                    Cancelar
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-justify py-2">{formatDescription(descripcion)}</p>
                            <button onClick={handleEditClick} className="absolute top-1 right-3 text-blue-500 hover:text-blue-700">
                                <AiOutlineEdit className="text-2xl" />
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="bg-gray-100 p-2 border border-gray-300 rounded-md">
                    <textarea value={newDescripcion} onChange={handleInputChange} maxLength="900" className="w-full p-2 border border-gray-300 rounded-md" rows="8" placeholder="Escribe una descripción para el inmueble..." />
                    <div className="flex justify-center gap-2 mt-2">
                        <button onClick={handleSaveClick} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                            Enviar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailsInfoTwo;
