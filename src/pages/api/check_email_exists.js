import cors, { runMiddleware } from '../../utils/cors';
// En /pages/api/check_email_exists.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    const { email } = req.body;

    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');
        const user = await db.collection('users').findOne({ email });

        res.status(200).json({ exists: !!user }); // Devuelve true si el usuario existe, false en caso contrario
    } catch (error) {
        console.error('Error al verificar el email:', error);
        res.status(500).json({ exists: false });
    }
}
