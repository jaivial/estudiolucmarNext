import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

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
