import cors, { runMiddleware } from '../../utils/cors';
import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';
import nodemailer from 'nodemailer';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '500mb', // Establece un límite de tamaño para las solicitudes
        },
    },
};

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'POST') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            const { nombre, apellido, email, password, admin, profilePhoto } = req.body;

            const user_id = Math.floor(Math.random() * 900000000) + 100000000;

            // Create the new user object with the image provided in the request
            const newUser = {
                _id: new ObjectId(),
                id: new ObjectId(),
                user_id: user_id,
                email: email || null,
                password: password || null,
                admin: admin === true,
                nombre: nombre || null,
                apellido: apellido || null,
                profile_photo: profilePhoto || null,  // Save the image as it is provided in the request
                creation_date: new Date()
            };

            // Insert the new user into the database
            await db.collection('users').insertOne(newUser);

            // Send a confirmation email to the user
            await sendConfirmationEmail(email, nombre, apellido, password);

            res.status(201).json({ message: 'Usuario agregado con éxito', user: newUser });
        } catch (error) {
            console.error('Error al agregar el usuario:', error);
            res.status(500).json({ message: 'Error al agregar el usuario', error });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}

async function sendConfirmationEmail(email, nombre, apellido, password) {
    // Configuración del transporte de Nodemailer
    let transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });


    // Contenido del email con estilos en línea
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Bienvenido a InmoProCRM',
        html: `
            <div style="
                margin: 32px;
                padding: 64px;
                background-color: #f1f5f9;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                font-family: Arial, sans-serif;
                text-align: center;
            ">
                <img src="https://i.imgur.com/6t1DkSh.png" alt="InmoProCRM Logo" style="width: 150px; margin-bottom: 32px;">
                <div style="font-size: 48px; margin-bottom: 24px; color: #3b82f6;">🏠</div>
                <div style="font-size: 16px; color: #333333;">
                    <p>Hola <strong>${nombre} ${apellido}</strong>,</p>
                    <p>¡Gracias por registrarte en InmoProCRM!</p>
                    <p>A continuación, te proporcionamos tus credenciales de acceso:</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Contraseña:</strong> ${password}</p>
                    <p>Puedes acceder a la aplicación haciendo clic en el siguiente enlace:</p>
                    <a href="https://yourdomain.com" style="
                        display: inline-block;
                        padding: 12px 24px;
                        margin-top: 24px;
                        background-color: #3b82f6;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                    ">Ir a InmoProCRM</a>
                    <p>Saludos,<br>El equipo de InmoProCRM</p>
                </div>
            </div>
        `,
        text: `Hola ${nombre} ${apellido},

¡Gracias por registrarte en InmoProCRM!

A continuación, te proporcionamos tus credenciales de acceso:

Email: ${email}
Contraseña: ${password}

Puedes acceder a la aplicación en el siguiente enlace: https://yourdomain.com

Saludos,
El equipo de InmoProCRM
        `,
    };


    // Enviar el correo electrónico
    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo electrónico de confirmación enviado');
    } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
    }
}
