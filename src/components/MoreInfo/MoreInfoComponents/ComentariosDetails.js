import React, { useState, useEffect } from 'react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai'; // Importar el icono de editar
import { Accordion, Panel, Divider, Checkbox } from 'rsuite';
import { CustomProvider } from 'rsuite';
import 'rsuite/dist/rsuite.min.css'; // Import rsuite styles
import axios from 'axios';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import Cookies from 'js-cookie';
import { DatePicker, Stack, Toggle } from 'rsuite';
import { FaClock } from 'react-icons/fa';
import Select from 'react-select';
import esES from 'rsuite/locales/es_ES';
import './comentarios.css';

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

const ComentariosDetails = ({ data, fetchClientPhoneNumberRefreshKey, screenWidth, inmuebleId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [comentarios, setComentarios] = useState([]);
    const [isAdmin, setIsAdmin] = useState(Cookies.get('admin'));
    const [commentType, setCommentType] = useState('Contacto Directo');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [phoneOptions, setPhoneOptions] = useState([]);

    // Estado de edición
    const [editMode, setEditMode] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [comentarioProgramado, setComentarioProgramado] = useState(false);

    const getPhoneNumbers = async () => {
        try {
            const response = await axios.get('/api/fetchClientPhoneNumber', { params: { inmuebleId: inmuebleId } });
            console.log('data phone options', response.data);
            setPhoneOptions(response.data);
        } catch (error) {
            console.error('Error fetching phone numbers:', error);
        }
    };
    useEffect(() => {
        getPhoneNumbers();
    }, []);

    useEffect(() => {
        getPhoneNumbers();
    }, [fetchClientPhoneNumberRefreshKey]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleTimeChange = (time) => {
        setSelectedTime(time);
    };

    const fetchComments = async () => {
        try {
            const response = await axios.get('/api/getComentarios', {
                params: {
                    id: inmuebleId,
                },
            });

            if (response.data.success) {
                setComentarios(response.data.comments);
                console.log('comentarios', response.data.comments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            showToast('Error fetching comments', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    useEffect(() => {
        fetchComments();
    }, [inmuebleId]);



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

        const userId = Cookies.get('user_id');

        try {
            // If selectedDate is undefined, set it to the current date
            const currentDate = new Date().toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
            const dateToUse = selectedDate ? selectedDate : currentDate;
            const response = await axios.get('/api/insertarComentario', {
                params: {
                    id: inmuebleId,
                    comentario: newComment,
                    tipo: commentType,
                    telefono: phoneNumber,
                    fecha: dateToUse, // Pass the selected date
                    hora: selectedTime, // Pass the selected time
                    user_id: userId, // Pass the user_id
                    comentarioProgramado: comentarioProgramado,
                },
            });

            if (response.data.success) {
                await fetchComments();
                setNewComment('');
                setPhoneNumber('');
                setSelectedDate(null);
                setSelectedTime(null);
                setComentarioProgramado(false);
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
            const response = await axios.delete(`/api/deleteComment`, {
                params: {
                    id: commentId,
                },
            });

            if (response.data.success) {
                setComentarios(comentarios.filter(comment => comment._id !== commentId));
                showToast('Comentario eliminado', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            } else {
                showToast(response.data.message, 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            showToast('Error deleting comment', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    const handleCheckboxChange = async (commentId) => {
        try {
            const response = await axios.post('/api/updateCommentStatus', {
                id: commentId,
                completed: true
            });

            if (response.data.success) {
                await fetchComments();
                showToast('Comentario marcado como completado', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            } else {
                showToast(response.data.message, 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            }
        } catch (error) {
            console.error('Error updating comment status:', error);
            showToast('Error updating comment status', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };

    const handleEditComment = (commentId, text) => {
        setEditMode(true);
        setEditingCommentId(commentId);
        setEditCommentText(text);
    };

    const handleUpdateComment = async () => {
        try {
            const response = await axios.put('/api/updateComentEdit', {
                id: editingCommentId,        // ID of the comment to update
                comentario: editCommentText  // New text for the comment
            });

            if (response.data.success) {
                await fetchComments(); // Refresh comments list
                setEditMode(false);   // Exit edit mode
                setEditingCommentId(null); // Clear editing ID
                setEditCommentText('');   // Clear comment text
                showToast('Comentario actualizado', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            } else {
                showToast(response.data.message, 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            }
        } catch (error) {
            console.error('Error updating comment:', error);
            showToast('Error updating comment', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        }
    };


    const handleCancelEdit = () => {
        setEditMode(false);
        setEditingCommentId(null);
        setEditCommentText('');
    };

    const programados = comentarios.filter(comment => comment.comentarioProgramado === true);
    const completados = comentarios.filter(comment => comment.comentarioProgramado === false);

    return (
        <CustomProvider locale={esES}>
            <Accordion defaultActiveKey={1} bordered style={{ margin: '0px', width: '100%' }}>
                <Accordion.Panel style={{ backgroundColor: 'rgb(248 250 252)', padding: '0px', width: '100%' }} header={'Comentarios'} eventKey={1}>
                    <div className={`mt-4 flex flex-col justify-center items-center gap-2 -mx-3`}>
                        <div className={`w-full flex ${screenWidth >= 640 ? 'flex-col' : 'flex-row items-start'}  gap-2`}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows="6"
                                className={`${screenWidth >= 640 ? 'w-full' : 'w-1/2'} border border-gray-300 p-2 rounded-md`}
                                placeholder="Escribe tu comentario aquí..."
                            />
                            <div className={`${screenWidth >= 640 ? 'w-full' : 'w-1/2'}`}>
                                <Select
                                    value={{ label: commentType, value: commentType }}
                                    onChange={(option) => {
                                        setCommentType(option.value);
                                        if (option.value !== 'Llamada') {
                                            setPhoneNumber('');
                                        }
                                        if (option.value !== 'Cita') {
                                            setSelectedDate(null);
                                            setSelectedTime(null);
                                        }
                                    }}
                                    options={[
                                        { label: 'Contacto Directo', value: 'Contacto Directo' },
                                        { label: 'Llamada', value: 'Llamada' },
                                        { label: 'Cita', value: 'Cita' }
                                    ]}
                                    className="border border-gray-300 rounded bg-white w-full"
                                />

                                {commentType === 'Contacto Directo' && (
                                    <>
                                        <DatePicker
                                            value={selectedDate || new Date()}
                                            onChange={handleDateChange}
                                            className="w-full border border-gray-300 mt-2 mb-1 rounded"
                                            placeholder="Fecha"
                                            format="dd.MM.yyyy"
                                            placement='topEnd'
                                            isoWeek
                                        />
                                        <DatePicker
                                            value={selectedTime || new Date()}
                                            onChange={handleTimeChange}
                                            className="w-full border border-gray-300 my-1 rounded"
                                            placeholder="Hora"
                                            format="HH:mm"
                                            caretAs={FaClock}
                                            placement='topEnd'
                                        />
                                        <Toggle
                                            checked={comentarioProgramado}
                                            onChange={(checked) => setComentarioProgramado(checked)}
                                            className={`${screenWidth >= 640 ? 'mt-2 w-full text-center' : 'mt-2'}`}
                                        >
                                            {comentarioProgramado ? 'Programado' : 'Realizado'}
                                        </Toggle>
                                    </>
                                )}
                                {commentType === 'Llamada' && (
                                    <>
                                        <Select
                                            value={phoneNumber ? { label: phoneNumber, value: phoneNumber } : null}
                                            onChange={(option) => setPhoneNumber(option?.value || '')}
                                            options={phoneOptions}
                                            className="w-full border border-gray-300 rounded mt-2"
                                            placeholder="Teléfono"
                                            isSearchable
                                        />

                                        <DatePicker
                                            value={selectedDate || new Date()}
                                            onChange={handleDateChange}
                                            className="w-full border border-gray-300 mt-2 mb-1 rounded"
                                            placeholder="Fecha"
                                            format="dd.MM.yyyy"
                                            placement='topEnd'
                                            isoWeek
                                        />
                                        <DatePicker
                                            value={selectedDate || new Date()}
                                            onChange={handleTimeChange}
                                            className="w-full border border-gray-300 my-1 rounded"
                                            placeholder="Hora"
                                            format="HH:mm"
                                            caretAs={FaClock}
                                            placement='topEnd'
                                        />
                                        <Toggle
                                            checked={comentarioProgramado}
                                            onChange={(checked) => setComentarioProgramado(checked)}
                                            className="mt-2"
                                        >
                                            {comentarioProgramado ? 'Programado' : 'Realizado'}
                                        </Toggle>
                                    </>
                                )}

                                {commentType === 'Cita' && (
                                    <>
                                        <DatePicker
                                            value={selectedDate || new Date()}
                                            onChange={handleDateChange}
                                            className="w-full border border-gray-300 mt-2 mb-1 rounded"
                                            placeholder="Fecha"
                                            format="dd.MM.yyyy"
                                            placement='topEnd'
                                            isoWeek
                                        />
                                        <DatePicker
                                            value={selectedDate || new Date()}
                                            onChange={handleTimeChange}
                                            className="w-full border border-gray-300 my-1 rounded"
                                            placeholder="Hora"
                                            format="HH:mm"
                                            caretAs={FaClock}
                                            placement='topEnd'
                                        />
                                        <Toggle
                                            checked={comentarioProgramado}
                                            onChange={(checked) => setComentarioProgramado(checked)}
                                            className="mt-2"
                                        >
                                            {comentarioProgramado ? 'Realizado' : 'Programado'}
                                        </Toggle>
                                    </>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleAddComment}
                            className="bg-blue-500 text-white p-2 rounded mt-2"
                        >
                            Añadir Comentario
                        </button>
                    </div>
                    {programados.length > 0 && (
                        <div>
                            <h3 className="font-bold text-base underline -mb-1">Programados</h3>
                            <div className="py-2 -mx-2">
                                {programados.map((comentario) => (
                                    <div key={comentario._id} className="py-2 my-3 relative flex items-start justify-between bg-blue-100 rounded-md">
                                        <div className="px-2 pb-10 w-full">
                                            <p className="text-sm text-gray-600 pb-2 -mt-1">{formatDateTime(comentario.date_time)}</p>
                                            {editMode && editingCommentId === comentario._id ? (
                                                <div className='w-full'>
                                                    <textarea
                                                        value={editCommentText}
                                                        onChange={(e) => setEditCommentText(e.target.value)}
                                                        rows="3"
                                                        className="w-full border border-gray-300 p-2 rounded-md"
                                                        placeholder="Edita tu comentario aquí..."
                                                    />
                                                    <div className="mt-2 w-full flex flex-row justify-center items-center">
                                                        <button
                                                            onClick={handleUpdateComment}
                                                            className="bg-blue-500 text-white p-2 rounded mr-2"
                                                        >
                                                            Actualizar
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="bg-gray-500 text-white p-2 rounded"
                                                        >
                                                            Cerrar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-base text-gray-950 py-1">{comentario.texto}</p>
                                                    <div className="absolute flex flex-row-reverse justify-center items-center gap-4 bottom-1 right-1 bg-slate-50 rounded-md pr-2">
                                                        <AiOutlineEdit
                                                            className="text-xl text-blue-500 cursor-pointer"
                                                            onClick={() => handleEditComment(comentario._id, comentario.texto)}
                                                        />
                                                        {isAdmin === "true" && (
                                                            <AiOutlineDelete
                                                                className="text-xl text-red-500 cursor-pointer"
                                                                onClick={() => handleDeleteComment(comentario._id)}
                                                            />
                                                        )}
                                                        <Checkbox
                                                            className="text-black"
                                                            onChange={() => handleCheckboxChange(comentario._id)}
                                                            color='green'
                                                        >
                                                            Completado
                                                        </Checkbox>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div className="absolute top-0 right-0 flex flex-row items-center space-x-2">
                                            <div className={`px-2 py-1 text-white text-xs rounded-md ${commentTypes[comentario.TipoComentario]}`}>
                                                {comentario.TipoComentario}
                                            </div>
                                            {comentario.TipoComentario === 'Cita' && comentario.date_time && (
                                                <div className="px-2 py-1 text-white text-xs rounded-md bg-yellow-600">
                                                    {formatDateTime(comentario.date_time)}
                                                </div>
                                            )}
                                            {comentario.TipoComentario === 'Llamada' && comentario.telefono && (
                                                <div className="px-2 py-1 text-white text-xs rounded-md bg-green-600">
                                                    {comentario.telefono}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {completados.length > 0 && (
                        <div>
                            {programados.length > 0 && <Divider />}

                            <h3 className="font-bold text-base underline -mb-3">Realizados</h3>
                            <div className="py-4 -mx-2">
                                {completados.map((comentario) => (
                                    <div key={comentario._id} className="py-2 my-3 relative flex items-start justify-between bg-zinc-200 rounded-md">
                                        <div className="px-2 pb-10 w-full">
                                            <p className="text-sm text-gray-600 pb-2 -mt-1">{formatDateTime(comentario.date_time)}</p>
                                            {editMode && editingCommentId === comentario._id ? (
                                                <div className='w-full'>
                                                    <textarea
                                                        value={editCommentText}
                                                        onChange={(e) => setEditCommentText(e.target.value)}
                                                        rows="3"
                                                        className="w-full border border-gray-300 p-2 rounded-md"
                                                        placeholder="Edita tu comentario aquí..."
                                                    />
                                                    <div className="mt-2 w-full flex flex-row justify-center items-center">
                                                        <button
                                                            onClick={handleUpdateComment}
                                                            className="bg-blue-500 text-white p-2 rounded mr-2"
                                                        >
                                                            Actualizar
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="bg-gray-500 text-white p-2 rounded"
                                                        >
                                                            Cerrar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-base text-gray-950 py-1">{comentario.texto}</p>

                                                    <div className="absolute flex flex-row-reverse justify-center items-center gap-4 bottom-1 right-1 bg-slate-50 rounded-md px-4 py-2">
                                                        <AiOutlineEdit
                                                            className="text-xl text-blue-500 cursor-pointer"
                                                            onClick={() => handleEditComment(comentario._id, comentario.texto)}
                                                        />
                                                        {isAdmin === "true" && (
                                                            <AiOutlineDelete
                                                                className="text-xl text-red-500 cursor-pointer"
                                                                onClick={() => handleDeleteComment(comentario._id)}
                                                            />
                                                        )}
                                                    </div>

                                                </>
                                            )}
                                        </div>
                                        <div className="absolute top-0 right-0 flex flex-row items-center space-x-2">
                                            <div className={`px-2 py-1 text-white text-xs rounded-md ${commentTypes[comentario.TipoComentario]}`}>
                                                {comentario.TipoComentario}
                                            </div>
                                            {comentario.TipoComentario === 'Cita' && comentario.date_time && (
                                                <div className="px-2 py-1 text-white text-xs rounded-md bg-yellow-600">
                                                    {formatDateTime(comentario.date_time)}
                                                </div>
                                            )}
                                            {comentario.TipoComentario === 'Llamada' && comentario.telefono && (
                                                <div className="px-2 py-1 text-white text-xs rounded-md bg-green-600">
                                                    {comentario.telefono}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                </Accordion.Panel>
            </Accordion>
        </CustomProvider>
    );
};

export default ComentariosDetails;
