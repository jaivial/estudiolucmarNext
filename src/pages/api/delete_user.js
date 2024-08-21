import clientPromise from '../../lib/mongodb';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');
            const { user_id } = req.body;

            // Find the user to get the profile photo path
            const user = await db.collection('users').findOne({ user_id: parseInt(user_id) });

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Delete the user from the database
            await db.collection('users').deleteOne({ user_id: parseInt(user_id) });

            // If the user has a profile photo, delete it from the filesystem
            if (user.profile_photo) {
                const profilePhotoPath = path.join(process.cwd(), 'public', user.profile_photo);

                // Check if the file exists before attempting to delete it
                if (fs.existsSync(profilePhotoPath)) {
                    fs.unlinkSync(profilePhotoPath);
                }
            }

            res.status(200).json({ message: 'Usuario eliminado con éxito' });
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            res.status(500).json({ message: 'Error al eliminar el usuario', error });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}
