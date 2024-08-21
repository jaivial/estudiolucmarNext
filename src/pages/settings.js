import GeneralLayout from "../components/layouts/GeneralLayout.js";
import { useEffect, useState } from "react";
import axios from 'axios';
import { Button, Input, Container, Form, Uploader, Avatar, Panel, PanelGroup, InputGroup, Toggle, Progress, Notification, useToaster, InlineEdit } from 'rsuite';
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


    return (
        <GeneralLayout title="Configuración de Usuarios" description="Panel de administración de usuarios">
            {/* Sección del usuario logueado */}
            <Container className="p-4 pb-24 pt-8">
                <h1 className="text-3xl font-bold text-center font-sans w-full mb-8">Tu Perfil</h1>
                <PanelGroup accordion bordered activeKey={activeKey} onSelect={setActiveKey}>
                    <Panel header="Tu Perfil" eventKey="0">
                        <div className="relative">
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
                                    <p><strong>Nombre completo:</strong> {loggedInUser.nombre} {loggedInUser.apellido}</p>
                                    <p><strong>Email:</strong> {loggedInUser.email}</p>
                                    <div><strong>Contraseña:</strong>
                                        <InputGroup inside>
                                            <Input value={renderPassword(loggedInUser.password, passwordVisible)} type="text" readOnly />
                                            <InputGroup.Button onClick={togglePasswordVisibility}>
                                                <Icon icon={passwordVisible ? "codicon:eye-closed" : "codicon:eye"} />
                                            </InputGroup.Button>
                                        </InputGroup>
                                    </div>
                                    <p><strong>Rol:</strong> {getRole(loggedInUser.admin)}</p>
                                    {loggedInUser.profile_photo ? (
                                        <Avatar src={loggedInUser.profile_photo} size="lg" circle className="mt-4" />
                                    ) : (
                                        <p><strong>Foto de perfil:</strong> Sin imagen</p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <InlineEdit value={nombre} onChange={setNombre} placeholder="Nombre" />
                                    <InlineEdit value={apellido} onChange={setApellido} placeholder="Apellido" />
                                    <InlineEdit value={email} onChange={setEmail} placeholder="Email" />
                                    <div><strong>Contraseña:</strong>
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
                                    <Form.Group>
                                        <Form.ControlLabel>Rol</Form.ControlLabel>
                                        <Toggle
                                            checked={isAdmin}
                                            onChange={setIsAdmin}
                                            checkedChildren="Administrador"
                                            unCheckedChildren="Asesor"
                                            size="lg"
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.ControlLabel>Foto de Perfil</Form.ControlLabel>
                                        <Uploader
                                            action=""
                                            autoUpload={false}
                                            listType="picture"
                                            onChange={handleImageUploadEdit}
                                        >
                                            <Button appearance="ghost">Seleccionar archivo</Button>
                                        </Uploader>
                                        {profilePhoto && <Avatar src={profilePhoto} size="lg" circle className="mt-4" />}
                                    </Form.Group>
                                    <div className="flex justify-end mt-4">
                                        <Button onClick={handleUpdateUser} appearance="primary" className="mr-2">
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
                    <Container className="p-4 pb-24 pt-8">
                        <h1 className="text-3xl font-bold text-center font-sans w-full mb-8">Gestionar Usuarios</h1>
                        <PanelGroup accordion bordered>
                            <Panel header="Gestionar Usuarios" eventKey="1">
                                <Form layout="inline" className="mb-4 d-flex">
                                    <Form.Group>
                                        <Form.ControlLabel>Buscar:</Form.ControlLabel>
                                        <Form.Control
                                            name="search"
                                            value={searchTerm}
                                            onChange={(value) => handleSearch(value)}
                                            placeholder="Buscar por nombre o apellido..."
                                        />
                                    </Form.Group>
                                    <Button appearance="primary">
                                        Buscar
                                    </Button>
                                </Form>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <Panel key={user.user_id} header={`${user.nombre} ${user.apellido}`} bordered className="mb-4">
                                            <div className="relative">
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
                                                        <p><strong>Nombre completo:</strong> {user.nombre} {user.apellido}</p>
                                                        <p><strong>Email:</strong> {user.email}</p>
                                                        <div><strong>Contraseña:</strong>
                                                            <InputGroup inside>
                                                                <Input value={renderPassword(user.password, passwordVisible)} type="text" readOnly />
                                                                <InputGroup.Button onClick={togglePasswordVisibility}>
                                                                    <Icon icon={passwordVisible ? "codicon:eye-closed" : "codicon:eye"} />
                                                                </InputGroup.Button>
                                                            </InputGroup>
                                                        </div>
                                                        <p><strong>Rol:</strong> {getRole(user.admin)}</p>
                                                        {user.profile_photo ? (
                                                            <Avatar src={user.profile_photo} size="lg" circle className="mt-4" />
                                                        ) : (
                                                            <p><strong>Foto de perfil:</strong> Sin imagen</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <InlineEdit value={nombre} onChange={setNombre} placeholder="Nombre" />
                                                        <InlineEdit value={apellido} onChange={setApellido} placeholder="Apellido" />
                                                        <InlineEdit value={email} onChange={setEmail} placeholder="Email" />
                                                        <div><strong>Contraseña:</strong>
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
                                                        <Form.Group>
                                                            <Form.ControlLabel>Rol</Form.ControlLabel>
                                                            <Toggle
                                                                checked={isAdmin}
                                                                onChange={setIsAdmin}
                                                                checkedChildren="Administrador"
                                                                unCheckedChildren="Asesor"
                                                                size="lg"
                                                            />
                                                        </Form.Group>
                                                        <Form.Group>
                                                            <Form.ControlLabel>Foto de Perfil</Form.ControlLabel>
                                                            <Uploader
                                                                action=""
                                                                autoUpload={false}
                                                                listType="picture"
                                                                onChange={handleImageUploadEdit}
                                                            >
                                                                <Button appearance="ghost">Seleccionar archivo</Button>
                                                            </Uploader>
                                                            {profilePhoto && <Avatar src={profilePhoto} size="lg" circle className="mt-4" />}
                                                        </Form.Group>
                                                        <Button onClick={handleUpdateUser} appearance="primary">
                                                            Guardar Cambios
                                                        </Button>
                                                        <Button onClick={() => setIsEditing(null)} appearance="subtle">
                                                            Cancelar
                                                        </Button>
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


                    <Container className="p-4 pb-24 pt-8">
                        <h1 className="text-3xl font-bold text-center font-sans w-full mb-8">Agregar Nuevo Usuario</h1>
                        <PanelGroup accordion bordered activeKey={activeKey} onSelect={setActiveKey} >
                            <Panel header="Agregar Nuevo Usuario" eventKey="2">
                                <Form fluid onSubmit={handleAddUser}>
                                    <Form.Group>
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
                                    <Form.Group>
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
                                    <Form.Group>
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
                                    <Form.Group>
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
                                    <Form.Group>
                                        <Form.ControlLabel>Rol</Form.ControlLabel>
                                        <Toggle
                                            name="admin"
                                            checked={isAdmin}
                                            onChange={setIsAdmin}
                                            checkedChildren="Administrador"
                                            unCheckedChildren="Asesor"
                                            size="lg"
                                        />
                                    </Form.Group>
                                    <Form.Group>
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
                                            <Button appearance="ghost">Seleccionar archivo</Button>
                                        </Uploader>
                                    </Form.Group>
                                    <Button appearance="primary" type="submit">
                                        Agregar Usuario
                                    </Button>
                                </Form>
                            </Panel>
                        </PanelGroup>
                    </Container>
                </>
            )}
        </GeneralLayout>
    );
}
