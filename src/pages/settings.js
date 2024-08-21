import GeneralLayout from "../components/layouts/GeneralLayout.js";
import { useEffect, useState } from "react";
import axios from 'axios';
import { Button, Input, Container, Form, Uploader, Avatar, Panel, PanelGroup, InputGroup, Toggle, Progress, Notification, useToaster } from 'rsuite';
import { Icon } from '@iconify/react';
import Toastify from 'toastify-js';
import clientPromise from '../lib/mongodb.js';
import 'rsuite/dist/rsuite.min.css';
import '../app/globals.css';
import '../components/ProgressCircle/progresscircle.css';

export const getServerSideProps = async (context) => {
    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Usar el nombre correcto de la base de datos

        const userIdCookie = context.req.cookies['user_id'];

        const loggedInUser = await db.collection('users').findOne(
            { user_id: parseInt(userIdCookie) },
            { projection: { _id: 0, nombre: 1, apellido: 1, email: 1, password: 1, admin: 1, profile_photo: 1 } }
        );

        console.log('loggedInUser', loggedInUser);

        const otherUsers = await db.collection('users').find(
            { user_id: { $ne: parseInt(userIdCookie) } },
            { projection: { _id: 0, user_id: 1, nombre: 1, apellido: 1, email: 1, password: 1, admin: 1, profile_photo: 1 } }
        ).toArray();

        return {
            props: {
                loggedInUser: loggedInUser,
                otherUsers: otherUsers,
            },
        };
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
        return {
            props: {
                loggedInUser: null,
                otherUsers: [],
            },
        };
    }
};

export default function Settings({ loggedInUser, otherUsers }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(otherUsers);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [newUserPasswordVisible, setNewUserPasswordVisible] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false); // Nuevo estado para manejar el símbolo de éxito


    // New user states
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [isImageValid, setIsImageValid] = useState(true);

    const toaster = useToaster();  // Crear una instancia del toaster

    // Simula el progreso del upload
    useEffect(() => {
        if (uploadProgress < 100) {
            const timer = setTimeout(() => {
                setUploadProgress(uploadProgress + 10); // Incremento de 10%
            }, 500); // Cada 0.5 segundos

            return () => clearTimeout(timer);
        } else {
            // Cuando el progreso llega al 100%
            setTimeout(() => {
                setIsLoading(false); // Oculta el círculo de progreso después de 1 segundo
            }, 1000);
        }
    }, [uploadProgress]);

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
            return ''; // O devuelve un valor predeterminado como '••••••'
        }
        return isVisible ? password : '•'.repeat(password.length);
    };


    const getRole = (admin) => {
        return admin ? 'Administrador' : 'Asesor';
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

        setIsLoading(true);
        setShowSuccess(false); // Resetea el estado de éxito al iniciar la carga

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
                }
            });

            if (response.status === 201) {
                setShowSuccess(true); // Muestra el símbolo de éxito
                setTimeout(() => {
                    setIsLoading(false); // Oculta el círculo de progreso después de 1 segundo
                    setShowSuccess(false); // Resetea el símbolo de éxito
                    setUploadProgress(0); // Restablecer el progreso después de la carga
                }, 1000);

                Toastify({
                    text: 'Usuario agregado.',
                    duration: 2500,
                    gravity: 'top',
                    position: 'center',
                    style: {
                        borderRadius: '10px',
                        backgroundImage: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)',
                        textAlign: 'center',
                    },
                }).showToast();

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
            {/* Barra de progreso mientras se agrega un usuario */}
            {isLoading && (
                <div className="fixed inset-0 bg-slate-800 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-slate-100 rounded-xl bg-opacity-100 shadow-xl flex flex-col items-center justify-center p-6 transition-opacity duration-1000">
                        <Progress.Circle
                            percent={uploadProgress}
                            status={showSuccess ? 'success' : 'active'}
                            strokeWidth={8}
                            strokeColor={showSuccess ? "#28a745" : "#ffc107"} // Cambia el color según el estado
                            style={{ width: 100, height: 100 }}
                        />
                    </div>
                </div>
            )}


            {/* Sección del usuario logueado */}
            <Container className="p-4 pb-24 pt-8">
                <h1 className="text-3xl font-bold text-center font-sans w-full mb-8">Tu Perfil</h1>
                <PanelGroup accordion bordered>
                    <Panel header="Tu Perfil" eventKey="0">
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
                    </Panel>
                </PanelGroup>
            </Container>

            {/* Sección de gestionar usuarios */}
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
                                </Panel>
                            ))
                        ) : (
                            <p className="text-danger">No se encontraron usuarios.</p>
                        )}
                    </Panel>
                </PanelGroup>
            </Container>

            {/* Sección para agregar un nuevo usuario */}
            <Container className="p-4 pb-24 pt-8">
                <h1 className="text-3xl font-bold text-center font-sans w-full mb-8">Agregar Nuevo Usuario</h1>
                <PanelGroup accordion bordered>
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

                                            // Verifica si el archivo es de un tipo soportado
                                            const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                            if (!supportedFormats.includes(file.type)) {
                                                handleUnsupportedFile();
                                                setIsImageValid(false);  // Marca la imagen como no válida
                                                return;
                                            }

                                            setIsImageValid(true);  // Marca la imagen como válida
                                            const reader = new FileReader();
                                            reader.onload = (e) => {
                                                setProfilePhoto(e.target.result); // Guarda la imagen en base64 en el estado
                                            };
                                            reader.readAsDataURL(file);
                                        } else {
                                            setProfilePhoto(null);
                                            setIsImageValid(true);  // Resetea la validez de la imagen si no hay archivo
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
        </GeneralLayout>
    );
}
