import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Get the user_id from the cookies
            const userIdCookie = req.cookies['user_id'];

            // Fetch all users except the logged-in user
            const users = await db.collection('users').find(
                { user_id: { $ne: parseInt(userIdCookie) } }, // Exclude the logged-in user
                {
                    projection: { _id: 0, user_id: 1, nombre: 1, apellido: 1, email: 1, password: 1, admin: 1, profile_photo: 1 }
                }
            ).toArray();

            res.status(200).json(users);
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            res.status(500).json({ message: 'Error al obtener los usuarios', error });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}
