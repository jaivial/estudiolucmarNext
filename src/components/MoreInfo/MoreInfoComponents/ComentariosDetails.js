import React, { useState, useEffect } from 'react';
import { AiOutlineDown, AiOutlineUp, AiOutlineDelete } from 'react-icons/ai';
import axios from 'axios';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS

const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day} / ${month} / ${year}`;

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    return `${formattedDate} ${formattedTime}`;
};

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

const commentTypes = {
    'Contacto Directo': 'bg-blue-500',
    Llamada: 'bg-green-600',
    Cita: 'bg-yellow-500',
};

const ComentariosDetails = ({ data }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [comentarios, setComentarios] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [commentType, setCommentType] = useState('Contacto Directo');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const fetchComments = async () => {
        try {
            const response = await axios.get('http://localhost:8000/backend/comentarios/getcomentarios.php', {
                params: {
                    id: data.inmueble.id,
                },
            });

            if (response.data.success) {
                setComentarios(response.data.comments);
            } else {
                showToast(response.data.message, 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            showToast('Error fetching comments', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    useEffect(() => {
        fetchComments();
    }, [data.inmueble.id]);

    const toggleOpen = () => setIsOpen(!isOpen);

    // Utility function to get a cookie by name
    const getCookieByName = (name) => {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.split('=');
            acc[key.trim()] = decodeURIComponent(value.trim());
            return acc;
        }, {});
        return cookies[name] || '';
    };

    const handleAddComment = async () => {
        if (newComment.trim() === '') {
            showToast('Debes escribir un comentario', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return;
        }

        if (commentType === 'Llamada') {
            const phoneNumberValid = /^[0-9]{9}$/.test(phoneNumber);

            if (!phoneNumber.trim()) {
                showToast('Añade el teléfono del cliente', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
                return;
            }

            if (!phoneNumberValid) {
                showToast('El teléfono debe ser numérico y de 9 dígitos', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
                return;
            }
        }

        if (commentType === 'Cita') {
            if (!selectedDate) {
                showToast('Debes seleccionar una fecha', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
                return;
            }

            if (!selectedTime) {
                showToast('Debes seleccionar una hora', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
                return;
            }
        }

        // Retrieve user_id from cookies
        const userId = getCookieByName('userID');

        try {
            const response = await axios.get('http://localhost:8000/backend/comentarios/insertarcomentario.php', {
                params: {
                    id: data.inmueble.id,
                    comentario: newComment,
                    tipo: commentType,
                    telefono: phoneNumber,
                    fecha: selectedDate, // Pass the selected date
                    hora: selectedTime, // Pass the selected time
                    user_id: userId, // Pass the user_id
                },
            });

            if (response.data.success) {
                await fetchComments();
                setNewComment('');
                setPhoneNumber('');
                setSelectedDate('');
                setSelectedTime('');
                showToast('Comentario añadido', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            } else {
                showToast(response.data.message, 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast('Error adding comment', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await axios.get('http://localhost:8000/backend/comentarios/deletecomment.php', {
                params: {
                    id: commentId,
                },
            });

            if (response.data.success) {
                await fetchComments();
                showToast('Comentario eliminado', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            } else {
                showToast(response.data.message, 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            showToast('Error deleting comment', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    useEffect(() => {
        const adminStatus = document.cookie.includes('admin=1');
        setIsAdmin(adminStatus);
    }, []);

    return (
        <div className="p-4">
            <div className="bg-white border border-gray-300 rounded-md">
                <div onClick={toggleOpen} className="flex items-center justify-between p-4 cursor-pointer bg-gray-100 rounded-t-md">
                    <h2 className="font-bold text-xl">Comentarios</h2>
                    {isOpen ? <AiOutlineUp className="text-2xl" /> : <AiOutlineDown className="text-2xl" />}
                </div>
                {isOpen && (
                    <div className="py-4 px-2">
                        {comentarios.length > 0 && (
                            <div>
                                {comentarios.map((comentario) => (
                                    <div key={comentario.id} className="comentariocontainer py-2 my-3 relative flex items-start justify-between bg-blue-100 rounded-md">
                                        <div className="pl-2 pb-2">
                                            <p className="text-sm text-gray-600 pb-2 -mt-1">{formatDateTime(comentario.date_time)}</p>
                                            <p className="text-base text-gray-950 py-1">{comentario.texto}</p>
                                        </div>
                                        <div className="absolute top-0 right-0 flex flex-row items-center space-x-2">
                                            <div className={`px-2 py-1 text-white text-xs rounded-md ${commentTypes[comentario.TipoComentario]}`}>{comentario.TipoComentario}</div>
                                            {comentario.TipoComentario === 'Cita' && comentario.date_time && <div className="px-2 py-1 text-white text-xs rounded-md bg-yellow-600">{formatDateTime(comentario.date_time)}</div>}
                                            {comentario.TipoComentario === 'Llamada' && comentario.telefono && <div className="px-2 py-1 text-white text-xs rounded-md bg-green-600">{comentario.telefono}</div>}
                                        </div>
                                        {isAdmin && <AiOutlineDelete className="absolute bottom-1 right-0.5 text-xl text-red-500 cursor-pointer" onClick={() => handleDeleteComment(comentario.id)} />}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 flex flex-col justify-center items-center gap-2">
                            <div className="w-full flex flex-row items-start gap-2">
                                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} rows="6" className="w-1/2 border border-gray-300 p-2 rounded-md" placeholder="Escribe tu comentario aquí..." />
                                <div className="w-1/2">
                                    <select
                                        value={commentType}
                                        onChange={(e) => {
                                            setCommentType(e.target.value);
                                            if (e.target.value !== 'Llamada') {
                                                setPhoneNumber('');
                                            }
                                            if (e.target.value !== 'Cita') {
                                                setSelectedDate('');
                                                setSelectedTime('');
                                            }
                                        }}
                                        className="border border-gray-300 p-2 rounded bg-white w-full"
                                    >
                                        <option value="Contacto Directo">Contacto Directo</option>
                                        <option value="Llamada">Llamada</option>
                                        <option value="Cita">Cita</option>
                                    </select>

                                    {commentType === 'Llamada' && <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full border border-gray-300 p-2 rounded mt-2" placeholder="Número de teléfono..." />}
                                    {commentType === 'Cita' && (
                                        <div className="w-full flex flex-col gap-2 mt-2">
                                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full border border-gray-300 p-2 rounded" />
                                            <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full border border-gray-300 p-2 rounded" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={handleAddComment} className="bg-blue-500 text-white p-2 rounded mt-2">
                                Añadir Comentario
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComentariosDetails;
