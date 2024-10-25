import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'PUT') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Get the comment ID and updated text from the request body
            const { id, comentario } = req.body;

            console.log('id', id);

            if (!id || !comentario) {
                return res.status(400).json({ message: 'ID y comentario son necesarios' });
            }

            // Convert the ID to an ObjectId instance
            const objectId = new ObjectId(id);

            // Step 1: Update the comment in the 'comentarios' collection
            const result = await db.collection('comentarios').updateOne(
                { _id: objectId }, // Filter by _id
                {
                    $set: {
                        texto: comentario // Update the comment text
                    }
                }
            );

            console.log(result);

            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Comentario no encontrado' });
            }

            // Step 2: Find the task in the 'tasks' collection based on the id before "comment"
            const taskUpdateResult = await db.collection('tasks').updateOne(
                {
                    // Match the part of the 'id' field that is before 'comment'
                    id: { $regex: `^${id}comment` } // Find the task where id starts with the comment id + 'comment'
                },
                {
                    $set: {
                        task: comentario // Update the task field with the new comment string
                    }
                }
            );

            console.log('taskUpdateResult', taskUpdateResult);

            if (taskUpdateResult.matchedCount === 0) {
                console.log('error here');
                return res.status(404).json({ message: 'Tarea no encontrada con el ID de comentario' });
            }

            res.status(200).json({ success: true, message: 'Comentario y tarea actualizados con éxito' });

        } catch (error) {
            console.error('Error al actualizar el comentario y la tarea:', error);
            res.status(500).json({ message: 'Error al actualizar el comentario y la tarea', error });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}
