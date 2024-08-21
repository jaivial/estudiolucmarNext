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
    if (req.method === 'POST') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            const { user_id, nombre, apellido, email, password, admin, profilePhoto } = req.body;

            // Construir el objeto de actualización
            const updateFields = {
                nombre: nombre || null,
                apellido: apellido || null,
                email: email || null,
                password: password || null,
                admin: admin === true,
                profile_photo: profilePhoto || null, // Directly assign the profile photo passed in the request
            };

            // Actualizar el usuario en la base de datos
            const result = await db.collection('users').updateOne(
                { user_id: parseInt(user_id) },
                { $set: updateFields }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.status(200).json({ message: 'Usuario actualizado con éxito' });
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            res.status(500).json({ message: 'Error al actualizar el usuario', error });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}
