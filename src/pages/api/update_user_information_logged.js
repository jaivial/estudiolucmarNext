import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path'; // Import the 'path' module

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '500mb', // Adjust this limit as needed
        },
    },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            const { user_id, nombre, apellido, email, password, admin, profilePhoto } = req.body;
            const sessionId = req.cookies['sessionID'];

            let profilePhotoPath = null;
            if (profilePhoto) {
                profilePhotoPath = await processImage(profilePhoto);
            }

            const updateFields = {
                nombre: nombre || null,
                apellido: apellido || null,
                email: email || null,
                password: password || null,
                admin: admin === true,
            };

            if (profilePhotoPath) {
                updateFields.profile_photo = profilePhotoPath;
            }

            await db.collection('users').updateOne(
                { user_id: parseInt(user_id) },
                { $set: updateFields }
            );

            await db.collection('active_sessions').deleteOne({
                user_id: parseInt(user_id),
                session_id: sessionId
            });

            res.status(200).json({ message: 'Usuario actualizado y sesión cerrada con éxito' });
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            res.status(500).json({ message: 'Error al actualizar el usuario', error });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}

async function processImage(profilePhoto) {
    const outputDir = path.join(process.cwd(), 'public', 'uploads');
    const outputFilePath = path.join(outputDir, `${new ObjectId()}.webp`);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const buffer = Buffer.from(profilePhoto.split(',')[1], 'base64');

    try {
        await sharp(buffer)
            .rotate()
            .webp({ quality: 70 })
            .resize({
                width: 800,
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
