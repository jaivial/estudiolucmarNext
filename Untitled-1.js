

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

    // New user states
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [isImageValid, setIsImageValid] = useState(true);

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
            {isLoading && (
                <div className="fixed inset-0 bg-slate-800 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-slate-100 rounded-xl bg-opacity-100 shadow-xl flex flex-col items-center justify-center p-6 transition-opacity duration-1000">
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

            {/* Sección del usuario logueado */}
            <Container className="p-4 pb-24 pt-8">
                <h1 className="text-3xl font-bold text-center font-sans w-full mb-8">Tu Perfil</h1>
                {isAdministrador ? (
                    <PanelGroup accordion bordered activeKey={activeKey} onSelect={setActiveKey}>
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
                ) : (
                    <div className="static-container p-4 bg-white shadow rounded-lg">
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
                    </div>
                )}
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
