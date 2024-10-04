import GeneralLayout from "../components/layouts/GeneralLayout.js";
import imageCompression from 'browser-image-compression';
import { use, useEffect, useState } from "react";
import axios from 'axios';
import { Button, Input, Container, Form, Uploader, Avatar, Panel, PanelGroup, InputGroup, Toggle, Progress, Notification, useToaster, InlineEdit, Modal } from 'rsuite';
import { Icon } from '@iconify/react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import clientPromise from '../lib/mongodb.js';
import 'rsuite/dist/rsuite.min.css';
import '../app/globals.css';
import '../components/ProgressCircle/progresscircle.css';
import LoadingScreen from "../components/LoadingScreen/LoadingScreen.js";
import Cookies from 'js-cookie';  // Import js-cookie to access cookies


export const getServerSideProps = async (context) => {
    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');
        const adminCookie = context.req.cookies['admin'] === 'true';
        // Serialize the loggedInUser object to JSON
        const serializedData = JSON.stringify({ isAdmin: adminCookie });
        // Calculate the size in bytes
        const sizeInBytes = Buffer.byteLength(serializedData, 'utf8');
        // Convert bytes to KB
        const sizeInKB = sizeInBytes / 1024;

        console.log('Serialized props size:', sizeInBytes, 'bytes');
        console.log('Serialized props size:', sizeInKB.toFixed(2), 'KB');

        return {
            props: {
                isAdmin: adminCookie,  // Passing the admin status to props
            },
        };
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        return {
            props: {
                isAdmin: false,
            },
        };
    }
};

export default function Settings({ isAdmin: initialIsAdmin }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [newUserPasswordVisible, setNewUserPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeKey, setActiveKey] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState([]);
    const [otherUsers, setOtherUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [Loading, setLoading] = useState(true);

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

    useEffect(() => {
        const fetchLoggedInUser = async () => {
            try {
                // Get the user_id cookie
                const userId = Cookies.get('user_id');

                if (!userId) {
                    throw new Error('User ID cookie not found');
                }

                // Make the API request with user_id as a query parameter
                const response = await axios.get(`/api/fetch_loggedIn_user`, {
                    params: {
                        user_id: userId,
                    },
                });

                console.log('loggedInUser', response.data.loggedInUser);
                setLoggedInUser(response.data.loggedInUser);
            } catch (error) {
                console.error('Error fetching logged-in user:', error);
            }
        };

        const fetchOtherUsers = async () => {
            try {
                const response = await axios.get('/api/fetch_other_users');
                setOtherUsers(response.data);
                setFilteredUsers(response.data);
            } catch (error) {
                console.error('Error fetching other users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLoggedInUser();
        fetchOtherUsers();
    }, []);

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

    const handleImageUploadEdit = async (fileList) => {
        if (fileList.length > 0) {
            const file = fileList[0].blobFile;

            const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!supportedFormats.includes(file.type)) {
                handleUnsupportedFile();
                setIsImageValid(false);
                return;
            }

            setIsImageValid(true);

            try {
                // Compress the image
                const options = {
                    maxSizeMB: 0.1, // 0.1 MB = 100KB
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);

                // Log and store the size of the compressed file
                const compressedSizeKB = compressedFile.size / 1024;
                console.log('Compressed file size:', compressedSizeKB, 'KB');

                // Convert the compressed image to Base64
                const reader = new FileReader();
                reader.onload = (e) => {
                    setProfilePhoto(e.target.result);
                    const base64 = e.target.result;
                    // Calculate the size of the Base64 string
                    const stringLength = base64.length;
                    const sizeInBytes = 4 * Math.ceil((stringLength / 3)) * 0.5624896334383812; // Size in bytes

                    console.log('Base64 encoded image:', base64);
                    console.log('Base64 encoded image size:', sizeInBytes / 1024, 'KB');

                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error('Error during compression:', error);
            }
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

                // Calculate the size of the response data from /api/fetch_other_users
                const responseData = JSON.stringify(updatedUsers.data);
                const sizeInBytes = new TextEncoder().encode(responseData).length;
                const sizeInKB = sizeInBytes / 1024;

                console.log('API response size for /api/fetch_other_users:', sizeInBytes, 'bytes');
                console.log('API response size for /api/fetch_other_users:', sizeInKB.toFixed(2), 'KB');
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
                    }, 100);
                }
            });

            if (response.status === 201) {

                // Calculate the size of the response data from /api/fetch_other_users
                const responseAddNewUser = JSON.stringify(response.data);
                const sizeInBytesAddNewUser = new TextEncoder().encode(responseAddNewUser).length;
                const sizeInKBAddNewUser = sizeInBytesAddNewUser / 1024;
                console.log('API response size for /api/add_new_user:', sizeInBytesAddNewUser, 'bytes');
                console.log('API response size for /api/add_new_user:', sizeInKBAddNewUser.toFixed(2), 'KB');
                setIsLoading(false);
                setShowSuccess(false);
                setUploadProgress(0);
                resetForm();
                setActiveKey(null);

                showToast('Usuario agregado.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');

                const updatedUsers = await axios.get('/api/fetch_other_users');

                // Calculate the size of the response data from /api/fetch_other_users
                const responseData = JSON.stringify(updatedUsers.data);
                const sizeInBytes = new TextEncoder().encode(responseData).length;
                const sizeInKB = sizeInBytes / 1024;

                console.log('API response size for /api/fetch_other_users:', sizeInBytes, 'bytes');
                console.log('API response size for /api/fetch_other_users:', sizeInKB.toFixed(2), 'KB');
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
            {Loading && <LoadingScreen />}
            {isLoading && (
                <div className="fixed inset-0 bg-slate-800 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl bg-opacity-100 shadow-xl flex flex-col items-center justify-center p-6 transition-opacity duration-1000">
                        <Progress.Circle
                            percent={uploadProgress}
                            status={showSuccess ? 'success' : 'active'}
                            strokeWidth={8}
                            strokeColor={showSuccess ? "#28a745" : "#ffc107"}
                            style={{ width: 100, height: 100 }}
                        />
                    </div>
                </div>
            )}
            <div className="h-full w-full flex flex-col items-center justify-start pt-20 overflow-y-scroll bg-gradient-to-t from-slate-400 via-slate-300 to-slate-200">
                <h1 className="text-3xl font-bold text-center font-sans w-80 mb-8">Administración de Usuarios</h1>

                <CustomModal
                    show={showLogoutModal}
                    onClose={() => setShowLogoutModal(false)}
                    onConfirm={handleConfirmEdit}
                />

                {/* Sección del usuario logueado */}
                <div className="p-4 pt-8 w-[90%]">
                    <PanelGroup accordion bordered defaultActiveKey={0} onSelect={() => setActiveKey(0)}>
                        <Panel header="Tu Perfil" eventKey={0} defaultExpanded={true} className="bg-slate-50 rounded-lg shadow-xl">
                            <div className="relative flex flex-col items-center gap-4 py-3 w-full">
                                <div className="absolute top-0 right-0">
                                    <Icon
                                        icon={isEditing?.user_id === loggedInUser.user_id ? "pajamas:close-xs" : "fa-regular:edit"}
                                        onClick={() => toggleEditMode(loggedInUser)}
                                        style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                                    />
                                </div>
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
                                        {isAdministrador && (
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
                                            </>
                                        )}
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
                                            {isAdministrador && (
                                                <>
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
                                                </>
                                            )}
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
                </div>


                {/* Sección de gestionar usuarios y agregar nuevo usuario, solo si es admin */}
                {isAdministrador && (
                    <>
                        <div className="p-4 w-[90%]">
                            <PanelGroup accordion bordered defaultActiveKey={1}>
                                <Panel header="Gestionar Usuarios" eventKey={1} defaultExpanded={true} className="bg-slate-50 rounded-lg shadow-xl" onSelect={() => setActiveKey(1)}>
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
                        </div>


                        <div className="p-4 mb-32 w-[90%]">
                            <PanelGroup accordion bordered defaultActiveKey={2} onSelect={() => setActiveKey(2)}>
                                <Panel header="Agregar Nuevo Usuario" eventKey={2} defaultExpanded={true} className="bg-slate-50 rounded-lg shadow-xl">
                                    <Form fluid onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                        <Form.Group style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '10px', marginTop: '0px', marginRight: '0px', gap: '5px' }}>
                                            <Form.ControlLabel>Foto de Perfil</Form.ControlLabel>
                                            <Uploader
                                                action=""
                                                autoUpload={false}
                                                listType="picture"
                                                onChange={async (fileList) => {
                                                    if (fileList.length > 0) {
                                                        const file = fileList[0].blobFile;

                                                        const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                                        if (!supportedFormats.includes(file.type)) {
                                                            handleUnsupportedFile();
                                                            setIsImageValid(false);
                                                            return;
                                                        }

                                                        setIsImageValid(true);

                                                        try {
                                                            // Compress the image
                                                            const options = {
                                                                maxSizeMB: 0.08, // 0.08 MB = 80KB
                                                                maxWidthOrHeight: 1920,
                                                                useWebWorker: true,
                                                            };
                                                            const compressedFile = await imageCompression(file, options);
                                                            // Convert the compressed image to Base64
                                                            const reader = new FileReader();
                                                            reader.onload = (e) => {
                                                                setProfilePhoto(e.target.result);
                                                            };
                                                            reader.readAsDataURL(compressedFile);
                                                        } catch (error) {
                                                            console.error('Error during compression:', error);
                                                        }
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
                                                value={isAdmin}
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
                        </div>
                    </>
                )}
            </div>
        </GeneralLayout >
    );
}
