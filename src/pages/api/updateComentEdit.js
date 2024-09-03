import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Get the comment ID and updated text from the request body
            const { id, comentario } = req.body;

            if (!id || !comentario) {
                return res.status(400).json({ message: 'ID y comentario son necesarios' });
            }

            // Convert the ID to an ObjectId instance
            const objectId = new ObjectId(id);

            // Update the comment in the collection
            const result = await db.collection('comentarios').updateOne(
                { _id: objectId }, // Filter by _id
                {
                    $set: {
                        texto: comentario // Update the comment text
                    }
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Comentario no encontrado' });
            }

            res.status(200).json({ success: true, message: 'Comentario actualizado con éxito' });
        } catch (error) {
            console.error('Error al actualizar el comentario:', error);
            res.status(500).json({ message: 'Error al actualizar el comentario', error });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}
