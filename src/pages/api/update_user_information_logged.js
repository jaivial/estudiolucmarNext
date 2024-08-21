import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';

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

            const updateFields = {
                nombre: nombre || null,
                apellido: apellido || null,
                email: email || null,
                password: password || null,
                admin: admin === true,
                profile_photo: profilePhoto || null,  // Use the profilePhoto as passed in the request
            };

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
