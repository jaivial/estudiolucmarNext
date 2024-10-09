import { Button, Modal, Form, Input, Message } from 'rsuite';
import Confetti from 'react-confetti';
import axios from 'axios';
import { useState } from 'react';

const CompleteEncargoModal = () => {
    const [open, setOpen] = useState(false);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [formValue, setFormValue] = useState({
        // Initialize form values here
    });

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSuccess = () => {
        setOpenSuccess(true);
    };

    const handleSubmit = async () => {
        try {
            // Make API call to complete the encargo
            const response = await axios.get('/api/fetch_clientes');
            if (response.status === 200) {
                // Close the modal and display success message
                handleClose();
                handleSuccess();
            }
        } catch (error) {
            Message.error('Error completing encargo');
        }
    };

    return (
        <div>
            <Button appearance="primary" onClick={handleOpen}>
                Completar Encargo
            </Button>

            <Modal open={open} onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title>Completar Encargo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form
                        fluid
                        onChange={(value) => setFormValue(value)}
                        formValue={formValue}
                    >
                        {/* Add form fields here */}
                        <Form.Group controlId="name">
                            <Form.ControlLabel>Nombre</Form.ControlLabel>
                            <Form.Control name="name" type="text" />
                        </Form.Group>
                        <Form.Group controlId="email">
                            <Form.ControlLabel>Email</Form.ControlLabel>
                            <Form.Control name="email" type="email" />
                        </Form.Group>
                        {/* Add more form fields as needed */}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleClose} appearance="subtle">
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} appearance="primary">
                        Completar Encargo
                    </Button>
                </Modal.Footer>
            </Modal>

            {openSuccess && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <p
                        style={{
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: '#333',
                            marginBottom: 20,
                        }}
                    >
                        ¡Felicidades! Has completado el encargo con éxito.
                    </p>
                    <Confetti
                        count={100}
                        size={20}
                        gravity={0.1}
                        colors={['#ff69b4', '#ffa07a', '#8bc34a', '#03a9f4']}
                    />
                </div>
            )}
        </div>
    );
};

export default CompleteEncargoModal;