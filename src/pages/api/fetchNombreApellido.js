// pages/api/fetchNombreApellido.js

import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            // Fetch 'nombre' and 'apellido' from the 'users' collection
            const users = await db.collection('users').find({}, { projection: { nombre: 1, apellido: 1 } }).toArray();

            // Combine 'nombre' and 'apellido' into a single string for each user
            const usersData = users.map(user => `${user.nombre} ${user.apellido}`);

            // Return the users data as a JSON response
            res.status(200).json(usersData);
        } catch (error) {
            console.error('Error fetching users data:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
