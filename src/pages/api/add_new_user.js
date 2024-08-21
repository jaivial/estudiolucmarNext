import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '500mb', // Establece un límite de tamaño para las solicitudes
        },
    },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            const { nombre, apellido, email, password, admin, profilePhoto } = req.body;

            // Procesar la imagen si existe
            let profilePhotoPath = null;
            if (profilePhoto) {
                profilePhotoPath = await processImage(profilePhoto);
            }

            const user_id = Math.floor(Math.random() * 900000000) + 100000000;

            const newUser = {
                _id: new ObjectId(),
                id: new ObjectId(),
                user_id: user_id,
                email: email || null,
                password: password || null,
                admin: admin === true,
                nombre: nombre || null,
                apellido: apellido || null,
                profile_photo: profilePhotoPath || null,
                creation_date: new Date()
            };

            await db.collection('users').insertOne(newUser);

            // Enviar un correo electrónico de confirmación al usuario
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

// Función para procesar y convertir la imagen a .webp y comprimirla a un tamaño máximo de 100kb
async function processImage(profilePhoto) {
    const outputDir = path.join(process.cwd(), 'public', 'uploads');
    const outputFilePath = path.join(outputDir, `${new ObjectId()}.webp`);

    // Verificar si el directorio `uploads` existe, y si no, crearlo
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const buffer = Buffer.from(profilePhoto.split(',')[1], 'base64');

    try {
        await sharp(buffer)
            .rotate() // Corrige la orientación basada en los metadatos EXIF
            .webp({ quality: 70 }) // Ajusta la calidad para reducir el tamaño del archivo
            .resize({
                width: 800, // Ajusta el tamaño de la imagen
                height: 800,
                fit: sharp.fit.inside,
                withoutEnlargement: true,
            })
            .toFile(outputFilePath);

        return `/uploads/${path.basename(outputFilePath)}`;
    } catch (error) {
        console.error('Error al procesar la imagen:', error);
        return null;
    }
}


async function sendConfirmationEmail(email, nombre, apellido, password) {
    // Configuración del transporte de Nodemailer
    let transporter = nodemailer.createTransport({
        service: 'gmail', // Puedes usar el servicio que prefieras (SendGrid, Mailgun, etc.)
        auth: {
            user: process.env.EMAIL_USER, // Tu correo electrónico
            pass: process.env.EMAIL_PASS, // Tu contraseña de aplicación o contraseña
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
