import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    // Ejecuta el middleware CORS
    await runMiddleware(req, res, cors);

    if (req.method === 'POST') {
        try {
            const encargoFinalizado = req.body;

            console.log(req.body);

            // Conexión a la base de datos
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Convertir el asesorID a ObjectId para la consulta
            const asesorID = (encargoFinalizado.asesorID);

            // Buscamos el _id del asesor en la colección 'users' por el campo 'user_id'
            const user = await db.collection('users').findOne({
                user_id: asesorID
            });

            if (!user) {
                return res.status(404).json({ message: 'Asesor no encontrado' });
            }

            // Creamos un nuevo documento en la colección 'ventas'
            const ventaData = {
                ...encargoFinalizado,
                user_id: user._id, // Asignamos el _id del asesor encontrado
            };

            const result = await db.collection('ventas').insertOne(ventaData);

            res.status(200).json({ message: 'Encargo finalizado con éxito', ventaId: result.insertedId });
        } catch (error) {
            console.error('Error al finalizar encargo:', error);
            res.status(500).json({ message: 'Error al finalizar encargo', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
