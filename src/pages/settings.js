import GeneralLayout from "../components/layouts/GeneralLayout.js";
import { useEffect, useState } from "react";
import axios from 'axios';
import { Button, Input, Container, Form, Uploader, Avatar, Panel, PanelGroup, InputGroup, Toggle, Progress, Notification, useToaster, InlineEdit, Modal } from 'rsuite';
import { Icon } from '@iconify/react';
import Toastify from 'toastify-js';
import clientPromise from '../lib/mongodb.js';
import 'rsuite/dist/rsuite.min.css';
import '../app/globals.css';
import '../components/ProgressCircle/progresscircle.css';


export const getServerSideProps = async (context) => {
    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        const userIdCookie = context.req.cookies['user_id'];
        const adminCookie = context.req.cookies['admin'] === 'true';  // Leer la cookie 'admin'

        const loggedInUser = await db.collection('users').findOne(
            { user_id: parseInt(userIdCookie) },
            { projection: { _id: 0, user_id: 1, nombre: 1, apellido: 1, email: 1, password: 1, admin: 1, profile_photo: 1 } }
        );

        const otherUsers = await db.collection('users').find(
            { user_id: { $ne: parseInt(userIdCookie) } },
            { projection: { _id: 0, user_id: 1, nombre: 1, apellido: 1, email: 1, password: 1, admin: 1, profile_photo: 1 } }
        ).toArray();

        return {
            props: {
                loggedInUser: loggedInUser,
                otherUsers: otherUsers,
                isAdmin: adminCookie,  // Pasar el valor de la cookie como prop
            },
        };
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        return {
            props: {
                loggedInUser: null,
                otherUsers: [],
                isAdmin: false,
            },
        };
    }
};

export default function Settings({ loggedInUser, otherUsers, isAdmin: initialIsAdmin }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(otherUsers);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [newUserPasswordVisible, setNewUserPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeKey, setActiveKey] = useState(null);

    const [isAdmin, setIsAdmin] = useState(false);
    const [isAdministrador, setIsAdministrador] = useState(initialIsAdmin);

    // State for edit mode
    const [isEditing, setIsEditing] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // User data states
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [isImageValid, setIsImageValid] = useState(true);
    const [editUserId, setEditUserId] = useState(null); // Store the user_id of the user being edited

    const toaster = useToaster();

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
        }).showToast();
    };

    const handleUnsupportedFile = () => {
        toaster.push(
            <Notification type="error" header="Formato no soportado">
                <p>Por favor, sube una imagen en formato .jpg, .jpeg, .png, .webp, etc.</p>
            </Notification>,
            { placement: 'topCenter', duration: 5000 }
        );
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        const filtered = otherUsers.filter(user =>
            `${user.nombre} ${user.apellido}`.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const toggleNewUserPasswordVisibility = () => {
        setNewUserPasswordVisible(!newUserPasswordVisible);
    };

    const renderPassword = (password, isVisible) => {
        if (!password) {
            return '';
        }
        return isVisible ? password : '•'.repeat(password.length);
    };

    const getRole = (admin) => {
        return admin ? 'Administrador' : 'Asesor';
    };

    const resetForm = () => {
        setNombre('');
        setApellido('');
        setEmail('');
        setPassword('');
        setProfilePhoto(null);
        setIsAdmin(false);
    };

    const toggleEditMode = (user) => {
        setIsEditing((prevUser) => prevUser && prevUser.user_id === user.user_id ? null : user);
        if (user) {
            // Set the form data with the user's current information
            setNombre(user.nombre);
            setApellido(user.apellido);
            setEmail(user.email);
            setPassword(user.password);
            setIsAdmin(user.admin);
            setProfilePhoto(user.profile_photo);
            setEditUserId(user.user_id);
            setIsImageValid(true); // Reset the image validation state
        }
    };

    // Handle image upload and validation during edit mode
    const handleImageUploadEdit = (fileList) => {
        if (fileList.length > 0) {
            const file = fileList[0].blobFile;

            const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!supportedFormats.includes(file.type)) {
                handleUnsupportedFile();
                setIsImageValid(false);
                return;
            }

            setIsImageValid(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePhoto(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setProfilePhoto(null);
            setIsImageValid(true);
        }
    };


    const handleUpdateUser = async () => {
        try {
            const updatedUser = {
                user_id: editUserId,
                nombre,
                apellido,
                email,
                password,
                admin: isAdmin,
                profilePhoto,
            };

            const response = await axios.post('/api/update_user_information', updatedUser);
            if (response.status === 200) {
                showToast('Usuario actualizado.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                setIsEditing(null);
                const updatedUsers = await axios.get('/api/fetch_other_users');
                setFilteredUsers(updatedUsers.data);
            }
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            showToast('Error al actualizar el usuario.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
        }
    };

    // Añade esta función para comprobar si el email ya existe
    const checkIfEmailExists = async (email) => {
        try {
            const response = await axios.post('/api/check_email_exists', { email });
            return response.data.exists; // Supone que la API devuelve { exists: true/false }
        } catch (error) {
            console.error('Error al verificar el email:', error);
            return false;
        }
    };

    const handleAddUser = async (e) => {

        if (!isImageValid) {
            toaster.push(
                <Notification type="error" header="Formato no soportado">
                    <p>Por favor, sube una imagen en formato .jpg, .jpeg, .png, .webp, etc.</p>
                </Notification>,
                { placement: 'topCenter', duration: 5000 }
            );
            return;
        }


        // Verifica si el email ya existe
        const emailExists = await checkIfEmailExists(email);
        if (emailExists) {
            setIsLoading(false);
            showToast('Usuario con el mismo email ya existente', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        setIsLoading(true);
        setShowSuccess(false);

        const newUser = {
            nombre,
            apellido,
            email,
            password,
            admin: isAdmin,
            profilePhoto,
        };

        try {
            const response = await axios.post('/api/add_new_user', newUser, {
                onUploadProgress: progressEvent => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                    setTimeout(() => {
                        if (percentCompleted === 100) {
                            setShowSuccess(true);
                        }
                    }, 400);
                }
            });

            if (response.status === 201) {
                setTimeout(() => {
                    setIsLoading(false);
                    setShowSuccess(false);
                    setUploadProgress(0);
                    resetForm();
                    setActiveKey(null);
                }, 100);

                showToast('Usuario agregado.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');

                const updatedUsers = await axios.get('/api/fetch_other_users');
                setFilteredUsers(updatedUsers.data);
            }

        } catch (error) {
            console.error('Error al agregar el usuario:', error);
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    // Function to show the modal when editing the logged-in user's information
    const handleEditLoggedInUser = () => {
        setShowLogoutModal(true);
    };

    // Function to handle user confirmation to edit their own information
    const handleConfirmEdit = async () => {
        await handleUpdateUser(); // Call the update function
        // Call the logout function
        await handleLogout();
    };

    // Function to handle user logout
    const handleLogout = async () => {
        try {
            // Make the API call to update the information and log out
            const response = await axios.post('/api/update_user_information_logged', {
                user_id: loggedInUser.user_id,
                nombre,
                apellido,
                email,
                password,
                admin: isAdmin,
                profilePhoto,
            });

            if (response.status === 200) {
                // Clear cookies
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

                // Redirect to the homepage
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const CustomModal = ({ show, onClose, onConfirm }) => {
        if (!show) return null;

        return (
            <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-80">
                    <div className="mb-4">
                        <p className="text-lg text-center">La edición de los datos del usuario con sesión iniciada requiere volver a iniciar sesión.</p>
                        <p className="text-lg text-center">¿Está de acuerdo?</p>
                    </div>
                    <div className="flex justify-center mt-4 gap-4">

                        <button
                            onClick={onConfirm}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                        >
                            Aceptar
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await axios.delete('/api/delete_user', {
                data: { user_id: userId },
            });

            if (response.status === 200) {
                // Show success notification or remove the user from the UI
                showToast('Usuario eliminado.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                setFilteredUsers(filteredUsers.filter(user => user.user_id !== userId));
            }
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            alert('Error al eliminar el usuario');
        }
    };



    return (
        <GeneralLayout title="Configuración de Usuarios" description="Panel de administración de usuarios">
            <div className="h-full w-full flex flex-col items-center justify-start pt-20 overflow-y-scroll bg-gradient-to-t from-slate-400 via-slate-300 to-slate-200">
                <h1 className="text-3xl font-bold text-center font-sans w-80 mb-8">Administración de Usuarios</h1>

                <CustomModal
                    show={showLogoutModal}
                    onClose={() => setShowLogoutModal(false)}
                    onConfirm={handleConfirmEdit}
                />

                {/* Sección del usuario logueado */}
                <Container className="p-4 pt-8 w-[90%]">
                    <PanelGroup accordion bordered activeKey={activeKey} onSelect={setActiveKey}>
                        <Panel header="Tu Perfil" eventKey="0" className="bg-slate-50 rounded-lg shadow-xl">
                            <div className="relative flex flex-col items-center gap-4 py-3 w-full">
                                {isAdministrador && (
                                    <div className="absolute top-0 right-0">
                                        <Icon
                                            icon={isEditing?.user_id === loggedInUser.user_id ? "pajamas:close-xs" : "fa-regular:edit"}
                                            onClick={() => toggleEditMode(loggedInUser)}
                                            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                                        />
                                    </div>
                                )}
                                {!isEditing || isEditing.user_id !== loggedInUser.user_id ? (
                                    <>
                                        {loggedInUser.profile_photo ? (
                                            <Avatar src={loggedInUser.profile_photo} size="xl" circle className="mt-4" />
                                        ) : (
                                            <p><strong>Foto de perfil:</strong> Sin imagen</p>
                                        )}
                                        <p className="w-full text-center"><strong>Nombre:</strong> <br /> {loggedInUser.nombre} {loggedInUser.apellido}</p>
                                        <p className="w-full text-center"><strong>Email:</strong> <br /> {loggedInUser.email}</p>
                                        <div className="w-[80%] flex flex-col gap-2 text-center"><strong>Contraseña:</strong>
                                            <InputGroup inside>
                                                <Input value={renderPassword(loggedInUser.password, passwordVisible)} type="text" readOnly />
                                                <InputGroup.Button onClick={togglePasswordVisibility} >
                                                    <Icon icon={passwordVisible ? "codicon:eye-closed" : "codicon:eye"} />
                                                </InputGroup.Button>
                                            </InputGroup>
                                        </div>
                                        <p className="w-full text-center"><strong>Rol:</strong> <br /> {getRole(loggedInUser.admin)}</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-[100%] rounded-lg shadow-xl flex flex-col items-center gap-4 py-6 px-4 mb-4 mt-2">
                                            <Form.Group className="w-[100%] flex flex-col items-center gap-4">
                                                <Form.ControlLabel>Foto de Perfil</Form.ControlLabel>
                                                {profilePhoto && <Avatar src={profilePhoto} size="lg" circle className="mt-4" />}
                                                <Uploader
                                                    action=""
                                                    autoUpload={false}
                                                    listType="picture"
                                                    onChange={handleImageUploadEdit}
                                                >
                                                    <Button appearance="ghost" style={{ width: '100%', padding: '0.9rem', backgroundColor: '#edebeb' }}>Seleccionar archivo</Button>
                                                </Uploader>
                                            </Form.Group>

                                            <InlineEdit value={nombre} onChange={setNombre} placeholder="Nombre" />
                                            <InlineEdit value={apellido} onChange={setApellido} placeholder="Apellido" />
                                            <InlineEdit value={email} onChange={setEmail} placeholder="Email" />
                                        </div>
                                        <div className="w-[100%] rounded-lg shadow-xl flex flex-col items-center gap-8 py-6 px-4 mb-4 mt-2">
                                            <div className="w-[100%] flex flex-col items-center gap-1">
                                                <strong>Contraseña:</strong>
                                                <InputGroup inside>
                                                    <Input
                                                        name="password"
                                                        type={newUserPasswordVisible ? "text" : "password"}
                                                        placeholder="Introduce la contraseña"
                                                        required
                                                        value={password}
                                                        onChange={(value) => setPassword(value)}
                                                    />
                                                    <InputGroup.Button onClick={() => setNewUserPasswordVisible(!newUserPasswordVisible)}>
                                                        <Icon icon={newUserPasswordVisible ? "codicon:eye-closed" : "codicon:eye"} />
                                                    </InputGroup.Button>
                                                </InputGroup>
                                            </div>
                                            <Form.Group className="w-[100%] flex flex-col items-center gap-1">
                                                <Form.ControlLabel>Rol</Form.ControlLabel>
                                                <Toggle
                                                    checked={isAdmin}
                                                    onChange={setIsAdmin}
                                                    checkedChildren="Administrador"
                                                    unCheckedChildren="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Asesor&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                                                    size="lg"
                                                />
                                            </Form.Group>
                                        </div>

                                        <div className="flex flex-col gap-4 justify-end mt-4">
                                            <Button onClick={() => setShowLogoutModal(true)} appearance="primary">
                                                Guardar Cambios
                                            </Button>
                                            <Button onClick={() => setIsEditing(null)} appearance="subtle">
                                                Cancelar
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Panel>
                    </PanelGroup>
                </Container>


                {/* Sección de gestionar usuarios y agregar nuevo usuario, solo si es admin */}
                {isAdministrador && (
                    <>
                        <Container className="p-4 w-[90%]">
                            <PanelGroup accordion bordered>
                                <Panel header="Gestionar Usuarios" eventKey="1" className="bg-slate-50 rounded-lg shadow-xl">
                                    <Form layout="inline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                        <Form.Group style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '10px', marginTop: '0px', marginRight: '0px', gap: '5px' }}>
                                            <Form.ControlLabel>Buscar:</Form.ControlLabel>
                                            <Form.Control
                                                name="search"
                                                value={searchTerm}
                                                onChange={(value) => handleSearch(value)}
                                                placeholder="Buscar por nombre o apellido..."
                                                style={{ width: '250px' }}
                                            />
                                        </Form.Group>
                                        <Button appearance="primary" style={{ marginRight: '0px', marginLeft: '0px' }}>
                                            Buscar
                                        </Button>
                                    </Form>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map(user => (
                                            <Panel key={user.user_id} header={`${user.nombre} ${user.apellido}`} bordered className="mb-4 bg-slate-300 bg-opacity-60">
                                                <div className="relative flex flex-col items-center gap-4 py-3 w-full">
                                                    {isAdministrador && (
                                                        <div className="absolute top-0 right-0">
                                                            <Icon
                                                                icon={isEditing?.user_id === user.user_id ? "pajamas:close-xs" : "fa-regular:edit"}
                                                                onClick={() => toggleEditMode(user)}
                                                                style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                                                            />
                                                        </div>
                                                    )}
                                                    {!isEditing || isEditing.user_id !== user.user_id ? (
                                                        <>
                                                            {user.profile_photo ? (
                                                                <Avatar src={user.profile_photo} size="xl" circle className="mt-4" />
                                                            ) : (
                                                                <p><strong>Foto de perfil:</strong> Sin imagen</p>
                                                            )}
                                                            <p className="w-full text-center"><strong>Nombre:</strong> <br /> {user.nombre} {user.apellido}</p>
                                                            <p className="w-full text-center"><strong>Email:</strong><br /> {user.email}</p>
                                                            <div className="w-[80%] flex flex-col gap-2 text-center"><strong>Contraseña:</strong>
                                                                <InputGroup inside>
                                                                    <Input value={renderPassword(user.password, passwordVisible)} type="text" readOnly />
                                                                    <InputGroup.Button onClick={togglePasswordVisibility}>
                                                                        <Icon icon={passwordVisible ? "codicon:eye-closed" : "codicon:eye"} />
                                                                    </InputGroup.Button>
                                                                </InputGroup>
                                                            </div>
                                                            <p className="w-full text-center"><strong>Rol:</strong><br /> {getRole(user.admin)}</p>

                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-[100%] rounded-lg shadow-xl flex flex-col items-center gap-4 py-6 px-4 mb-4 mt-4 bg-slate-50">
                                                                <Form.Group className="w-[100%] flex flex-col items-center gap-4">
                                                                    <Form.ControlLabel>Foto de Perfil</Form.ControlLabel>
                                                                    {profilePhoto && <Avatar src={profilePhoto} size="lg" circle className="mt-4" />}
                                                                    <Uploader
                                                                        action=""
                                                                        autoUpload={false}
                                                                        listType="picture"
                                                                        onChange={handleImageUploadEdit}
                                                                    >
                                                                        <Button appearance="ghost" style={{ width: '100%', padding: '0.6rem', backgroundColor: '#edebeb' }}>Seleccionar archivo</Button>
                                                                    </Uploader>

                                                                </Form.Group>
                                                                <InlineEdit value={nombre} onChange={setNombre} placeholder="Nombre" />
                                                                <InlineEdit value={apellido} onChange={setApellido} placeholder="Apellido" />
                                                                <InlineEdit value={email} onChange={setEmail} placeholder="Email" />
                                                            </div>
                                                            <div className="w-[100%] rounded-lg shadow-xl flex flex-col items-center gap-8 py-6 px-4 mb-4 mt-2 bg-slate-50">
                                                                <div className="w-[100%] flex flex-col items-center gap-1">
                                                                    <strong>Contraseña:</strong>
                                                                    <InputGroup inside>
                                                                        <Input
                                                                            name="password"
                                                                            type={newUserPasswordVisible ? "text" : "password"}
                                                                            placeholder="Introduce la contraseña"
                                                                            required
                                                                            value={password}
                                                                            onChange={(value) => setPassword(value)}
                                                                        />
                                                                        <InputGroup.Button onClick={() => setNewUserPasswordVisible(!newUserPasswordVisible)}>
                                                                            <Icon icon={newUserPasswordVisible ? "codicon:eye-closed" : "codicon:eye"} />
                                                                        </InputGroup.Button>
                                                                    </InputGroup>
                                                                </div>
                                                                <Form.Group className="w-[100%] flex flex-col items-center gap-1">
                                                                    <Form.ControlLabel>Rol</Form.ControlLabel>
                                                                    <Toggle
                                                                        checked={isAdmin}
                                                                        onChange={setIsAdmin}
                                                                        checkedChildren="Administrador"
                                                                        unCheckedChildren="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Asesor&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                                                                        size="lg"
                                                                    />
                                                                </Form.Group>
                                                            </div>

                                                            <div className="flex flex-col gap-4 justify-center mt-4">
                                                                <Button onClick={handleUpdateUser} appearance="primary">
                                                                    Guardar Cambios
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleDeleteUser(user.user_id)}
                                                                    appearance="default"
                                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                                >
                                                                    <Icon icon="mdi:trash-can-outline" className="mr-2" />
                                                                    Eliminar
                                                                </Button>
                                                                <Button onClick={() => setIsEditing(null)} appearance="subtle">
                                                                    Cancelar
                                                                </Button>
                                                            </div>

                                                        </>
                                                    )}
                                                </div>
                                            </Panel>
                                        ))
                                    ) : (
                                        <p className="text-danger">No se encontraron usuarios.</p>
                                    )}
                                </Panel>
                            </PanelGroup>
                        </Container>


                        <Container className="p-4 mb-32 w-[90%]">
                            <PanelGroup accordion bordered activeKey={activeKey} onSelect={setActiveKey} >
                                <Panel header="Agregar Nuevo Usuario" eventKey="2" className="bg-slate-50 rounded-lg shadow-xl">
                                    <Form fluid onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                        <Form.Group style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '10px', marginTop: '0px', marginRight: '0px', gap: '5px' }}>
                                            <Form.ControlLabel>Foto de Perfil</Form.ControlLabel>
                                            <Uploader
                                                action=""
                                                autoUpload={false}
                                                listType="picture"
                                                onChange={(fileList) => {
                                                    if (fileList.length > 0) {
                                                        const file = fileList[0].blobFile;

                                                        const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                                        if (!supportedFormats.includes(file.type)) {
                                                            handleUnsupportedFile();
                                                            setIsImageValid(false);
                                                            return;
                                                        }

                                                        setIsImageValid(true);
                                                        const reader = new FileReader();
                                                        reader.onload = (e) => {
                                                            setProfilePhoto(e.target.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    } else {
                                                        setProfilePhoto(null);
                                                        setIsImageValid(true);
                                                    }
                                                }}
                                            >
                                                <Button appearance="ghost" style={{ width: '100%', paddingTop: '0.2rem', paddingBottom: '0.2rem', paddingLeft: '0.6rem', paddingRight: '0.6rem', backgroundColor: '#edebeb' }}>Seleccionar archivo</Button>
                                            </Uploader>
                                        </Form.Group>
                                        <Form.Group style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '10px', marginTop: '0px', marginRight: '0px', gap: '5px' }}>
                                            <Form.ControlLabel>Nombre</Form.ControlLabel>
                                            <Form.Control
                                                name="nombre"
                                                type="text"
                                                placeholder="Introduce el nombre"
                                                required
                                                value={nombre}
                                                onChange={(value) => setNombre(value)}
                                            />
                                        </Form.Group>
                                        <Form.Group style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '10px', marginTop: '0px', marginRight: '0px', gap: '5px' }}>
                                            <Form.ControlLabel>Apellido</Form.ControlLabel>
                                            <Form.Control
                                                name="apellido"
                                                type="text"
                                                placeholder="Introduce el apellido"
                                                required
                                                value={apellido}
                                                onChange={(value) => setApellido(value)}
                                            />
                                        </Form.Group>
                                        <Form.Group style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '10px', marginTop: '0px', marginRight: '0px', gap: '5px' }}>
                                            <Form.ControlLabel>Email</Form.ControlLabel>
                                            <Form.Control
                                                name="email"
                                                type="email"
                                                placeholder="Introduce el correo electrónico"
                                                required
                                                value={email}
                                                onChange={(value) => setEmail(value)}
                                            />
                                        </Form.Group>
                                        <Form.Group style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '10px', marginTop: '0px', marginRight: '0px', gap: '5px' }}>
                                            <Form.ControlLabel>Contraseña</Form.ControlLabel>
                                            <InputGroup inside>
                                                <Input
                                                    name="password"
                                                    type={newUserPasswordVisible ? "text" : "password"}
                                                    placeholder="Introduce la contraseña"
                                                    required
                                                    value={password}
                                                    onChange={(value) => setPassword(value)}
                                                />
                                                <InputGroup.Button onClick={() => setNewUserPasswordVisible(!newUserPasswordVisible)}>
                                                    <Icon icon={newUserPasswordVisible ? "codicon:eye-closed" : "codicon:eye"} />
                                                </InputGroup.Button>
                                            </InputGroup>
                                        </Form.Group>
                                        <Form.Group style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '10px', marginTop: '0px', marginRight: '0px', gap: '5px' }}>
                                            <Form.ControlLabel>Rol</Form.ControlLabel>
                                            <Toggle
                                                name="admin"
                                                checked={isAdmin}
                                                onChange={setIsAdmin}
                                                checkedChildren="Administrador"
                                                unCheckedChildren="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Asesor&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                                                size="lg"
                                            />
                                        </Form.Group>

                                        <Button appearance="primary" type="submit" style={{ marginTop: '20px', marginBottom: '10px' }}>
                                            Agregar Usuario
                                        </Button>
                                    </Form>
                                </Panel>
                            </PanelGroup>
                        </Container>
                    </>
                )}
            </div>
        </GeneralLayout >
    );
}
