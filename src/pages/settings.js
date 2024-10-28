import GeneralLayout from "../components/layouts/GeneralLayout.js";
import imageCompression from 'browser-image-compression';
import { use, useEffect, useState } from "react";
import axios from 'axios';
import { Button, Input, Container, Form, Uploader, Avatar, Panel, PanelGroup, InputGroup, Toggle, Progress, Notification, useToaster, AutoComplete, Modal, Tabs, Placeholder } from 'rsuite';
import { Icon } from '@iconify/react';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import clientPromise from '../lib/mongodb.js';
import 'rsuite/dist/rsuite.min.css';
import '../app/globals.css';
import '../components/ProgressCircle/progresscircle.css';
import LoadingScreen from "../components/LoadingScreen/LoadingScreen.js";
import Cookies from 'js-cookie';  // Import js-cookie to access cookies
import { checkLogin } from "../lib/mongodb/login/checkLogin.js";


export const getServerSideProps = async (context) => {
    const { req } = context;
    let user = null;

    try {
        user = await checkLogin(req); // Pass the request object to checkActiveUser
        if (!user || user.length === 0) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }
    } catch (error) {
        console.error('Error during server-side data fetching:', error.message);
    }
    const cookies = context.req.cookies; // Corrected to access cookies from the request
    const user_id = cookies.user_id;
    let userData = null;
    if (user_id) {
        try {
            // Construct the URL
            const response = await fetch(`http://localhost:3000/api/fetchuserinformation`, {
                method: 'POST', // Specify the method
                headers: {
                    'Content-Type': 'application/json', // Specify the content type
                },
                body: JSON.stringify({ user_id }) // Pass user_id in the body
            });

            if (response.status === 200) {
                userData = await response.json();
            } else {
                console.error('Error fetching user data:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    let isAdmin = null;
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


        isAdmin = adminCookie;  // Passing the admin status to props

    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        isAdmin = false;
    }
    return {
        props: {
            isAdmin,
            userData,
        },
    };
};

export default function Settings({ isAdmin: initialIsAdmin, userData }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [newUserPasswordVisible, setNewUserPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeKey, setActiveKey] = useState('perfil');
    const [loggedInUser, setLoggedInUser] = useState([]);
    const [otherUsers, setOtherUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [Loading, setLoading] = useState(true);
    const [fileList, setFileList] = useState([]);
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
    const [name, setName] = useState(loggedInUser.nombre);

    const [loggedInUserInfo, setLoggedInUserInfo] = useState(
        {
            nombre: '',
            apellido: '',
            email: '',
            password: '',
            profilePhoto: '',
            _id: '',
            profilePhoto: '',
            user_id: '',
            admin: null,
        }
    );
    const [loggedInUserInfoUpdate, setLoggedInUserInfoUpdate] = useState(
        {
            nombre: '',
            apellido: '',
            email: '',
            password: '',
            profilePhoto: '',
            _id: '',
            profilePhoto: '',
            user_id: '',
            admin: null,
        }
    );

    const [newUser, setNewUser] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        profilePhoto: '', // Stores the Base64 or URL of the uploaded photo
        admin: false,     // Default role as non-admin (Asesor)
    });


    useEffect(() => {
        console.log('editinguser:', loggedInUserInfoUpdate);
    }, [loggedInUserInfoUpdate]);
    useEffect(() => {
        console.log('newUser.profilePhoto:', newUser.profilePhoto);
    }, [newUser.profilePhoto]);

    // State for tracking open modals for each user
    const [editModalOpen, setEditModalOpen] = useState({});

    // Function to open the edit modal for a specific user
    const handleOpenEditModal = (user) => {
        setEditModalOpen((prevState) => ({
            ...prevState,
            [user.user_id]: true,
        }));
        setLoggedInUserInfoUpdate({
            ...loggedInUserInfoUpdate,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            password: user.password,
            profilePhoto: user.profile_photo,
            user_id: user.user_id,
            admin: user.admin
        }); // Set the user info in the form fields
    };

    // Function to close the edit modal for a specific user
    const handleCloseEditModal = (userId) => {
        setEditModalOpen((prevState) => ({
            ...prevState,
            [userId]: false,
        }));
    };


    useEffect(() => { // Fetch user data on mount
        console.log('userData', userData);
        console.log('isAdmin', isAdmin);
    }, []);


    const handleEditProfile = () => {

        setLoggedInUserInfoUpdate({
            nombre: loggedInUserInfo.nombre,
            apellido: loggedInUserInfo.apellido,
            email: loggedInUserInfo.email,
            password: loggedInUserInfo.password,
            profilePhoto: loggedInUserInfo.profilePhoto,
            _id: loggedInUserInfo._id,
            profilePhoto: loggedInUserInfo.profilePhoto,
            user_id: loggedInUserInfo.user_id,
            admin: loggedInUserInfo.admin,
        })
        setIsEditing(true);
    };

    const handleSaveChanges = () => {
        // Logic to save changes (e.g., make an API call here)
        setIsEditing(false);
        toaster.push(<Notification type="success">Profile updated successfully</Notification>, { placement: 'topCenter' });
    };

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
            // Assuming response.data.loggedInUser contains the user data object as shown.
            setLoggedInUserInfo({
                nombre: response.data.loggedInUser.nombre,
                apellido: response.data.loggedInUser.apellido,
                email: response.data.loggedInUser.email,
                password: response.data.loggedInUser.password,
                profilePhoto: response.data.loggedInUser.profile_photo, // Use profilePhoto for consistency
                _id: response.data.loggedInUser._id,
                user_id: response.data.loggedInUser.user_id, // Add any other fields if needed
                admin: response.data.loggedInUser.admin // Include admin if you want to keep track of role
            });

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

    useEffect(() => {
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

    const [passwordVisibility, setPasswordVisibility] = useState({}); // State to track visibility per user

    const togglePasswordVisibility = (userId) => {
        setPasswordVisibility(prevState => ({
            ...prevState,
            [userId]: !prevState[userId]
        }));
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
        const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (fileList.length > 0) {
            const file = fileList[0].blobFile;

            if (!supportedFormats.includes(file.type)) {
                handleUnsupportedFile();
                return;
            }

            try {
                // Compression options
                const options = {
                    maxSizeMB: 0.1, // 100 KB
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    fileType: 'image/webp', // Convert to WebP
                };

                const compressedFile = await imageCompression(file, options);

                // Convert the compressed image to Base64
                const reader = new FileReader();
                reader.onload = (e) => {
                    setLoggedInUserInfoUpdate({ ...loggedInUserInfoUpdate, profilePhoto: e.target.result });
                };
                reader.readAsDataURL(compressedFile);

            } catch (error) {
                console.error('Error during compression:', error);
            }
        } else {
            setProfilePhoto(null);
        }
    };
    const handleImageUploadNew = async (fileList) => {
        const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (fileList.length > 0) {
            const file = fileList[0].blobFile;

            if (!supportedFormats.includes(file.type)) {
                handleUnsupportedFile();
                return;
            }

            try {
                // Compression options
                const options = {
                    maxSizeMB: 0.1, // 100 KB
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                    fileType: 'image/webp', // Convert to WebP
                };

                const compressedFile = await imageCompression(file, options);

                // Convert the compressed image to Base64
                const reader = new FileReader();
                reader.onload = (e) => {
                    setNewUser({ ...newUser, profilePhoto: e.target.result });
                };
                reader.readAsDataURL(compressedFile);

            } catch (error) {
                console.error('Error during compression:', error);
            }
        } else {
            setNewUser({ ...newUser, profilePhoto: '' });
        }
    };



    const handleUpdateUser = async (userId) => {
        try {


            const response = await axios.post('/api/update_user_information', loggedInUserInfoUpdate);
            if (response.status === 200) {
                showToast('Usuario actualizado.', 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
                setIsEditing(null);
                const updatedUsers = await axios.get('/api/fetch_other_users');
                setFilteredUsers(updatedUsers.data);
                setLoggedInUserInfoUpdate({
                    ...loggedInUserInfoUpdate,
                    nombre: '',
                    apellido: '',
                    email: '',
                    password: '',
                    profilePhoto: '',
                    user_id: '',
                    _id: '',
                }); // Set the user info in the form fields
                handleCloseEditModal(userId);
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
        const emailExists = await checkIfEmailExists(newUser.email);
        if (emailExists) {
            setIsLoading(false);
            showToast('Usuario con el mismo email ya existente', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        if (newUser.email === '') {
            setIsLoading(false);
            showToast('Introduce un email.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        if (newUser.name === '') {
            setIsLoading(false);
            showToast('Introduce un nombre.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        if (newUser.apellido === '') {
            setIsLoading(false);
            showToast('Introduce un apellido.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        if (newUser.password === '') {
            setIsLoading(false);
            showToast('Introduce una contraseña.', 'linear-gradient(to right, #ff416c, #ff4b2b)');
            return;
        }
        setIsLoading(true);
        setShowSuccess(false);

        console.log('parameters adding user', newUser);

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

                setNewUser({
                    nombre: '',
                    apellido: '',
                    email: '',
                    password: '',
                    admin: false,
                    profilePhoto: '',
                    user_id: '',
                });
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
        setIsEditing(false);
        setShowLogoutModal(true);
    };

    // Function to handle user confirmation to edit their own information
    const handleConfirmEdit = async () => {
        // Call the logout function
        await handleLogout();
    };

    // Function to handle user logout
    const handleLogout = async () => {
        console.log('parameters passed loggedin edit', loggedInUserInfoUpdate);
        try {
            // Make the API call to update the information and log out
            const response = await axios.post('/api/update_user_information_logged', loggedInUserInfoUpdate);

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

    const CustomModal = ({ open, onClose, onConfirm }) => (
        <Modal open={open} onClose={onClose} size="xs" backdrop="static">
            <Modal.Header>
                <Modal.Title className="text-center text-lg">Confirmación de Cierre de Sesión</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-center">La edición de los datos del usuario con sesión iniciada requiere volver a iniciar sesión.</p>
                <p className="text-center">¿Está de acuerdo?</p>
            </Modal.Body>
            <Modal.Footer className="flex justify-center gap-4">
                <Button onClick={onConfirm} appearance="primary" className="bg-blue-500 hover:bg-blue-600">
                    Aceptar
                </Button>
                <Button onClick={onClose} appearance="subtle" className="bg-gray-300 hover:bg-gray-400 text-gray-700">
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );

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

    // Handle tab change and reset newUser if the active tab is not 'agregar'
    const handleSelect = (key) => {
        setActiveKey(key);
        if (key !== 'agregar') {
            setNewUser({
                nombre: '',
                apellido: '',
                email: '',
                password: '',
                admin: false,
                profilePhoto: '',
                user_id: '',
            });
        }
    };



    return (
        <GeneralLayout title="Configuración de Usuarios" description="Panel de administración de usuarios" userData={userData}>
            {Loading && <LoadingScreen />}
            {isLoading && (
                <div className="fixed inset-0 bg-slate-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl flex flex-col items-center justify-center p-6 transition-opacity duration-1000 ease-out">
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
            <div className="h-full w-full flex flex-col items-center justify-start pt-16 bg-gradient-to-t from-slate-400 via-slate-300 to-slate-200 overflow-y-auto">
                <h1 className="text-3xl font-bold text-center font-sans mb-8">Administración de Usuarios</h1>

                <CustomModal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleConfirmEdit} />

                <div className="container mx-auto px-4 md:px-8 lg:px-12 flex flex-col lg:flex-row gap-8 lg:gap-12 w-full transition-all duration-700 ease-in-out">
                    {/* Left Column for Profile & User Management */}
                    <div className="flex flex-col w-full lg:w-3/5 transition-all duration-500 ease-in-out bg-white rounded-xl shadow-lg p-6">
                        {isAdministrador ? (

                            <Tabs activeKey={activeKey} onSelect={handleSelect} appearance="pills">
                                <Tabs.Tab eventKey="perfil" title="Mi Perfil">
                                    {/* Mi Perfil Section */}
                                    <div className="flex flex-row gap-0">
                                        <Panel bordered className="p-4 bg-slate-50 rounded-lg shadow-md transition-all duration-300 ease-in-out relative w-full">
                                            <div className="h-full flex flex-row w-auto">
                                                <Icon
                                                    icon="mdi:pencil-outline"
                                                    className="absolute top-3 right-3 text-gray-500 cursor-pointer text-2xl hover:text-gray-700 transition"
                                                    onClick={handleEditProfile}
                                                    title="Edit Profile"
                                                />
                                                <div className={`w-full flex flex-col justify-center items-center`}>
                                                    {loggedInUserInfo.profilePhoto ? (
                                                        <Avatar src={loggedInUserInfo.profilePhoto} size="xxl" bordered className="mx-auto" />
                                                    ) : (
                                                        <p><strong>Foto de perfil:</strong> Sin imagen</p>
                                                    )}
                                                </div>
                                                <div className={`p-6 flex flex-col justify-center items-center gap-6`}>
                                                    <div>
                                                        <p className="text-center"><strong>Nombre:</strong> <br /> {loggedInUserInfo.nombre}  {loggedInUserInfo.apellido}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-center"><strong>Email:</strong> <br /> {loggedInUserInfo.email}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-center mb-1"><strong>Contraseña:</strong> <br /></p>
                                                        <InputGroup inside>
                                                            <Input
                                                                type={passwordVisible ? "text" : "password"}
                                                                value={loggedInUserInfo.password}
                                                                readOnly
                                                            />
                                                            <InputGroup.Button onClick={() => setPasswordVisible(!passwordVisible)}>
                                                                <Icon icon={passwordVisible ? "mdi:eye" : "mdi:eye-off"} />
                                                            </InputGroup.Button>
                                                        </InputGroup>
                                                    </div>
                                                    <div>
                                                        <p className="text-center"><strong>Rol:</strong> <br /> {loggedInUserInfo.admin ? "Administrador" : "Asesor"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Panel>

                                        {/* Edit Profile Modal */}
                                        <Modal open={isEditing} onClose={() => setIsEditing(false)} size="md" centered>
                                            <Modal.Header>
                                                <Modal.Title style={{ fontSize: '1.5rem', textAlign: 'center' }}>Editar Perfil</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <Form fluid className="flex flex-col gap-6">
                                                    {/* Profile Photo Upload */}
                                                    <div className="w-1/2 mx-auto bg-slate-100 p-4 rounded-lg shadow-md">
                                                        <div className="flex flex-col items-center gap-4">
                                                            {loggedInUserInfoUpdate.profilePhoto ? (
                                                                <Avatar src={loggedInUserInfoUpdate.profilePhoto} size="xxl" circle />
                                                            ) : (
                                                                <p><strong>Foto de perfil:</strong> Sin imagen</p>
                                                            )}
                                                            <Uploader
                                                                fileList={fileList}
                                                                onChange={(newFileList) => {
                                                                    setFileList(newFileList);
                                                                    handleImageUploadEdit(newFileList);
                                                                }}
                                                                accept="image/*"
                                                                autoUpload={false}
                                                                listType="picture"
                                                                className="w-full"
                                                                style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                                                            >
                                                                <Button appearance="ghost" style={{ width: 'fit-content', height: 'auto', padding: '10px 5px' }}>Seleccionar archivo</Button>
                                                            </Uploader>
                                                        </div>
                                                    </div>

                                                    {/* Name */}
                                                    <Form.Group controlId="name" className="w-2/4 mx-auto">
                                                        <Form.ControlLabel>Nombre</Form.ControlLabel>
                                                        <Input
                                                            value={loggedInUserInfoUpdate.nombre}
                                                            onChange={(value) =>
                                                                setLoggedInUserInfoUpdate({
                                                                    ...loggedInUserInfoUpdate,
                                                                    nombre: value
                                                                })
                                                            }
                                                        />
                                                    </Form.Group>
                                                    {/* Apellido */}
                                                    <Form.Group controlId="name" className="w-2/4 mx-auto">
                                                        <Form.ControlLabel>Apellido</Form.ControlLabel>
                                                        <Input
                                                            value={loggedInUserInfoUpdate.apellido}
                                                            onChange={(value) =>
                                                                setLoggedInUserInfoUpdate({
                                                                    ...loggedInUserInfoUpdate,
                                                                    apellido: value
                                                                })
                                                            }
                                                        />
                                                    </Form.Group>

                                                    {/* Email */}
                                                    <Form.Group controlId="email" className="w-2/4 mx-auto">
                                                        <Form.ControlLabel>Email</Form.ControlLabel>
                                                        <Input type="email" value={loggedInUserInfoUpdate.email} onChange={(value) => setLoggedInUserInfoUpdate({ ...loggedInUserInfoUpdate, email: value })} />
                                                    </Form.Group>

                                                    {/* Password */}
                                                    <Form.Group controlId="password" className="w-2/4 mx-auto">
                                                        <Form.ControlLabel>Contraseña</Form.ControlLabel>
                                                        <InputGroup inside>
                                                            <Input
                                                                type={passwordVisible ? "text" : "password"}
                                                                value={loggedInUserInfoUpdate.password}
                                                                onChange={(value) => setLoggedInUserInfoUpdate({ ...loggedInUserInfoUpdate, password: value })}
                                                            />
                                                            <InputGroup.Button onClick={() => setPasswordVisible(!passwordVisible)}>
                                                                <Icon icon={passwordVisible ? "mdi:eye" : "mdi:eye-off"} />
                                                            </InputGroup.Button>
                                                        </InputGroup>
                                                    </Form.Group>

                                                    {/* Role */}
                                                    <Form.Group controlId="role" className="w-2/4 mx-auto flex flex-col justify-center items-center">
                                                        <Form.ControlLabel>Rol</Form.ControlLabel>
                                                        <Toggle
                                                            checked={loggedInUserInfoUpdate.admin}
                                                            onChange={(value) => setLoggedInUserInfoUpdate({ ...loggedInUserInfoUpdate, admin: value })}
                                                            checkedChildren="Administrador"
                                                            unCheckedChildren="Asesor"
                                                            size="lg"
                                                        />
                                                    </Form.Group>
                                                </Form>
                                            </Modal.Body>
                                            <Modal.Footer style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', marginBottom: '10px' }}>
                                                <Button onClick={handleEditLoggedInUser} appearance="primary">
                                                    Guardar Cambios
                                                </Button>
                                                <Button onClick={() => setIsEditing(false)} appearance="subtle">
                                                    Cancelar
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>
                                    </div>
                                </Tabs.Tab>
                                <Tabs.Tab eventKey="usuarios" title="Gestionar Usuarios">
                                    {/* Gestionar Usuarios Section */}
                                    <Panel bordered className="p-4 bg-slate-50 rounded-lg shadow-md transition-all duration-300 ease-in-out">
                                        <Form layout="inline" className="flex items-center justify-center gap-3">
                                            <div className="flex items-center w-full max-w-sm mt-4 border border-gray-300 rounded-lg relative">
                                                <AutoComplete
                                                    data={otherUsers.map(user => `${user.nombre} ${user.apellido}`)} // provide list of names for autocomplete
                                                    value={searchTerm}
                                                    onChange={(value) => handleSearch(value)}
                                                    placeholder="Buscar usuario..."
                                                    className="w-full"
                                                />
                                                <Icon icon="mdi:magnify" className="text-gray-500 text-2xl mr-2 absolute right-0" />
                                            </div>
                                        </Form>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map(user => (
                                                <Panel key={user.user_id} header={`${user.nombre} ${user.apellido}`} bordered className="bg-slate-100 rounded-lg p-0 mb-4 transition-all duration-300 ease-in-out relative">
                                                    <div className="relative flex items-center gap-3">
                                                        <div className="w-fit">
                                                            {user.profile_photo ? (
                                                                <Avatar src={user.profile_photo} size="xxl" bordered />
                                                            ) : (
                                                                <Icon icon="fa:profile" className="text-3xl" />
                                                            )}
                                                        </div>
                                                        <div className="text-sm flex flex-col items-start justify-center gap-4 p-3 rounded-lg w-fit">
                                                            <p><strong>Email:</strong> {user.email}</p>

                                                            {/* Password field with visibility toggle for each user */}
                                                            <div className="flex items-center gap-2">
                                                                <p><strong>Contraseña:</strong></p>
                                                                <InputGroup inside style={{ width: '100%', height: 'fit-content' }}>
                                                                    <Input
                                                                        type={passwordVisibility[user.user_id] ? "text" : "password"}
                                                                        value={user.password}
                                                                        readOnly // makes the input readonly
                                                                    />
                                                                    <InputGroup.Button onClick={() => togglePasswordVisibility(user.user_id)}>
                                                                        <Icon icon={passwordVisibility[user.user_id] ? "mdi:eye" : "mdi:eye-off"} />
                                                                    </InputGroup.Button>
                                                                </InputGroup>
                                                            </div>

                                                            {/* Role tag based on admin status */}
                                                            <div className="mt-2">
                                                                <span
                                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${user.admin ? 'bg-blue-200 text-blue-900' : 'bg-gray-800 text-gray-50'
                                                                        }`}
                                                                >
                                                                    {user.admin ? 'Administrador' : 'Asesor'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                    </div>
                                                    {/* Edit and Delete icons */}
                                                    <div className="absolute top-3 right-3 flex items-center gap-3">
                                                        <Icon
                                                            icon="mdi:pencil-outline"
                                                            className="text-gray-500 cursor-pointer text-2xl hover:text-gray-700 transition"
                                                            onClick={() => handleOpenEditModal(user)}
                                                        />
                                                        <Icon
                                                            icon="mdi:trash-can-outline"
                                                            className="text-gray-500 cursor-pointer text-2xl hover:text-red-600 transition"
                                                            onClick={() => handleDeleteUser(user.user_id)}
                                                        />
                                                    </div>

                                                    {/* Edit User Modal */}
                                                    <Modal open={editModalOpen[user.user_id]} onClose={() => handleCloseEditModal(user.user_id)} size="sm">
                                                        <Modal.Header>
                                                            <Modal.Title>Editar Usuario</Modal.Title>
                                                        </Modal.Header>
                                                        <Modal.Body>
                                                            <Form fluid>
                                                                {/* Profile Photo Uploader */}
                                                                <Form.Group controlId="profilePhoto" className="bg-slate-200 w-1/2 mx-auto flex flex-col items-center justify-center gap-4 p-4 rounded-lg">
                                                                    <Form.ControlLabel>Foto de Perfil</Form.ControlLabel>

                                                                    {loggedInUserInfoUpdate.profilePhoto ? (
                                                                        <Avatar src={loggedInUserInfoUpdate.profilePhoto} size="xxl" bordered />
                                                                    ) : (
                                                                        <Icon icon="fa:profile" className="text-3xl" />
                                                                    )}
                                                                    <Uploader
                                                                        listType="picture"
                                                                        action=""
                                                                        autoUpload={false}
                                                                        onChange={handleImageUploadEdit}
                                                                        fileList={profilePhoto ? [{ url: profilePhoto }] : []}
                                                                    >
                                                                        <Button appearance="ghost" style={{ width: 'fit-content', height: 'auto', padding: '10px 5px', border: '1px solid #000', backgroundColor: '#000', color: '#fff' }}>Seleccionar archivo</Button>
                                                                    </Uploader>
                                                                </Form.Group>

                                                                <Form.Group controlId="nombre" style={{
                                                                    width: '50%',
                                                                    marginInline: 'auto',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'flex-start',
                                                                    justifyContent: 'center',
                                                                    gap: '0.25rem' // Tailwind gap-1 translates to 0.25rem
                                                                }}
                                                                >
                                                                    <Form.ControlLabel>Nombre</Form.ControlLabel>
                                                                    <Input value={loggedInUserInfoUpdate.nombre} onChange={(value) => setLoggedInUserInfoUpdate({ ...loggedInUserInfoUpdate, nombre: value })} />
                                                                </Form.Group>

                                                                <Form.Group controlId="apellido" style={{
                                                                    width: '50%',
                                                                    marginInline: 'auto',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'flex-start',
                                                                    justifyContent: 'center',
                                                                    gap: '0.25rem',
                                                                    marginTop: '1.3rem',
                                                                    // Tailwind gap-1 translates to 0.25rem
                                                                }}
                                                                >
                                                                    <Form.ControlLabel>Apellido</Form.ControlLabel>
                                                                    <Input value={loggedInUserInfoUpdate.apellido} onChange={(value) => setLoggedInUserInfoUpdate({ ...loggedInUserInfoUpdate, apellido: value })} />
                                                                </Form.Group>

                                                                <Form.Group controlId="email" style={{
                                                                    width: '50%',
                                                                    marginInline: 'auto',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'flex-start',
                                                                    justifyContent: 'center',
                                                                    gap: '0.25rem',
                                                                    marginTop: '1.3rem',
                                                                    // Tailwind gap-1 translates to 0.25rem
                                                                }}
                                                                >
                                                                    <Form.ControlLabel>Email</Form.ControlLabel>
                                                                    <Input value={loggedInUserInfoUpdate.email} onChange={(value) => setLoggedInUserInfoUpdate({ ...loggedInUserInfoUpdate, email: value })} />
                                                                </Form.Group>

                                                                {/* Password Field with Visibility Toggle */}
                                                                <Form.Group controlId="password" style={{
                                                                    width: '50%',
                                                                    marginInline: 'auto',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'flex-start',
                                                                    justifyContent: 'center',
                                                                    gap: '0.25rem',
                                                                    marginTop: '1.3rem',
                                                                    // Tailwind gap-1 translates to 0.25rem
                                                                }}
                                                                >
                                                                    <Form.ControlLabel>Contraseña</Form.ControlLabel>
                                                                    <InputGroup inside>
                                                                        <Input
                                                                            type={passwordVisible ? "text" : "password"}
                                                                            value={loggedInUserInfoUpdate.password}
                                                                            onChange={(value) => setLoggedInUserInfoUpdate({ ...loggedInUserInfoUpdate, password: value })}
                                                                        />
                                                                        <InputGroup.Button onClick={() => setPasswordVisible(!passwordVisible)}>
                                                                            <Icon icon={passwordVisible ? "mdi:eye" : "mdi:eye-off"} />
                                                                        </InputGroup.Button>
                                                                    </InputGroup>
                                                                </Form.Group>

                                                                {/* Role Toggle */}
                                                                <Form.Group controlId="role" style={{
                                                                    width: '50%',
                                                                    marginInline: 'auto',
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    gap: '0.25rem',
                                                                    marginTop: '1.3rem',
                                                                    // Tailwind gap-1 translates to 0.25rem
                                                                }}>
                                                                    <Form.ControlLabel>Rol</Form.ControlLabel>
                                                                    <Toggle
                                                                        checked={loggedInUserInfoUpdate.admin}
                                                                        onChange={(checked) => setLoggedInUserInfoUpdate({ ...loggedInUserInfoUpdate, admin: checked })}
                                                                        checkedChildren="Administrador"
                                                                        unCheckedChildren="Asesor"
                                                                        size="lg"
                                                                    />
                                                                </Form.Group>
                                                            </Form>
                                                        </Modal.Body>
                                                        <Modal.Footer style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0px' }}>
                                                            <Button onClick={() => handleUpdateUser(user.user_id)} appearance="primary">
                                                                Guardar Cambios
                                                            </Button>
                                                            <Button onClick={() => handleCloseEditModal(user.user_id)} appearance="subtle">
                                                                Cancelar
                                                            </Button>
                                                        </Modal.Footer>
                                                    </Modal>
                                                </Panel>
                                            ))
                                        ) : (
                                            <p className="text-center text-red-600">No se encontraron usuarios.</p>
                                        )}
                                    </Panel>
                                </Tabs.Tab>
                                <Tabs.Tab eventKey="agregar" title="Agregar Usuarios">
                                    <Form fluid>
                                        {/* Profile Photo Uploader */}
                                        <Form.Group controlId="newProfilePhoto" className="bg-slate-200 w-1/2 mx-auto flex flex-col items-center justify-center gap-4 p-4 rounded-lg">
                                            <Form.ControlLabel>Foto de Perfil</Form.ControlLabel>
                                            {newUser.profilePhoto ? (
                                                <Avatar src={newUser.profilePhoto} size="xxl" bordered />
                                            ) : (
                                                null
                                            )}
                                            <Uploader
                                                listType="picture"
                                                action=""
                                                autoUpload={false}
                                                onChange={handleImageUploadNew}
                                                fileList={[]}
                                            >
                                                <Button appearance="ghost" style={{ width: 'fit-content', height: 'auto', padding: '10px 5px', border: '1px solid #000', backgroundColor: '#000', color: '#fff' }}>Seleccionar archivo</Button>
                                            </Uploader>
                                        </Form.Group>

                                        {/* Name Field */}
                                        <Form.Group controlId="newNombre" style={{
                                            width: '50%',
                                            marginInline: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                            gap: '0.25rem',
                                        }}>
                                            <Form.ControlLabel>Nombre</Form.ControlLabel>
                                            <Input value={newUser.nombre} onChange={(value) => setNewUser({ ...newUser, nombre: value })} />
                                        </Form.Group>

                                        {/* Last Name Field */}
                                        <Form.Group controlId="newApellido" style={{
                                            width: '50%',
                                            marginInline: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                            gap: '0.25rem',
                                            marginTop: '1.3rem',
                                        }}>
                                            <Form.ControlLabel>Apellido</Form.ControlLabel>
                                            <Input value={newUser.apellido} onChange={(value) => setNewUser({ ...newUser, apellido: value })} />
                                        </Form.Group>

                                        {/* Email Field */}
                                        <Form.Group controlId="newEmail" style={{
                                            width: '50%',
                                            marginInline: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                            gap: '0.25rem',
                                            marginTop: '1.3rem',
                                        }}>
                                            <Form.ControlLabel>Email</Form.ControlLabel>
                                            <Input value={newUser.email} onChange={(value) => setNewUser({ ...newUser, email: value })} />
                                        </Form.Group>

                                        {/* Password Field with Visibility Toggle */}
                                        <Form.Group controlId="newPassword" style={{
                                            width: '50%',
                                            marginInline: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            justifyContent: 'center',
                                            gap: '0.25rem',
                                            marginTop: '1.3rem',
                                        }}>
                                            <Form.ControlLabel>Contraseña</Form.ControlLabel>
                                            <InputGroup inside>
                                                <Input
                                                    type={passwordVisible ? "text" : "password"}
                                                    value={newUser.password}
                                                    onChange={(value) => setNewUser({ ...newUser, password: value })}
                                                />
                                                <InputGroup.Button onClick={() => setPasswordVisible(!passwordVisible)}>
                                                    <Icon icon={passwordVisible ? "mdi:eye" : "mdi:eye-off"} />
                                                </InputGroup.Button>
                                            </InputGroup>
                                        </Form.Group>

                                        {/* Role Toggle */}
                                        <Form.Group controlId="newRole" style={{
                                            width: '50%',
                                            marginInline: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.25rem',
                                            marginTop: '1.3rem',
                                        }}>
                                            <Form.ControlLabel>Rol</Form.ControlLabel>
                                            <Toggle
                                                checked={newUser.admin}
                                                onChange={(checked) => setNewUser({ ...newUser, admin: checked })}
                                                checkedChildren="Administrador"
                                                unCheckedChildren="Asesor"
                                                size="lg"
                                            />
                                        </Form.Group>
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <Button onClick={handleAddUser} appearance="primary" style={{ width: 'fit-content' }}>
                                                Guardar Cambios
                                            </Button>
                                        </div>

                                    </Form>
                                </Tabs.Tab>

                            </Tabs>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Panel className="bg-slate-50 rounded-lg shadow-md p-4">
                                    <p className="text-center"><strong>Nombre:</strong> {loggedInUser.nombre} {loggedInUser.apellido}</p>
                                    <p className="text-center"><strong>Email:</strong> {loggedInUser.email}</p>
                                    <p className="text-center"><strong>Rol:</strong> Asesor</p>
                                </Panel>
                            </div>
                        )}
                    </div>

                    {/* Right Column for Analytics / Graphs */}
                    <div className="hidden lg:flex lg:w-3/5 bg-slate-800 rounded-xl shadow-md transition-all duration-700 ease-in-out p-6">
                        <div className="w-full h-full flex items-center justify-center text-white text-lg">Gráficas de Analítica (Placeholder)</div>
                    </div>
                </div>
            </div>
        </GeneralLayout>
    );

}
