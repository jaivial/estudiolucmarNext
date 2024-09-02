import clientPromise from '../../lib/mongodb';
// Function to generate a random number as ID
const generateRandomId = () => Math.floor(Math.random() * 1000000); // Generates a random number between 0 and 999999

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const {
                id,
                comentario,
                tipo,
                telefono,
                fecha,
                hora,
                user_id
            } = req.query;

            // Check if required parameters are set
            if (!id || !comentario || !tipo || !user_id) {
                return res.status(400).json({ success: false, message: 'Required parameters not set.' });
            }

            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            // Define current date and time
            const now = new Date();
            const dateTime = now.toISOString(); // Use ISO string for date-time

            // Insert comment into 'comentarios' collection
            const comentariosCollection = db.collection('comentarios');
            const insertResult = await comentariosCollection.insertOne({
                comentario_id: parseInt(id, 10),
                date_time: dateTime,
                texto: comentario,
                TipoComentario: tipo,
                telefono: telefono || ''
            });

            // Debugging: Log the insertResult to verify
            console.log('insertResult', insertResult);
            // Generate a random ID for the task
            const taskId = generateRandomId();


            if (insertResult && tipo === 'Cita' && fecha && hora) {
                // Insert task into 'tasks' collection if the comment type is 'Cita'
                const tasksCollection = db.collection('tasks');
                const taskInsertResult = await tasksCollection.insertOne({
                    task_date: fecha,
                    task_time: hora,
                    task: `Cita: ${comentario}`,
                    completed: false,
                    user_id: parseInt(user_id, 10),
                    id: taskId,
                });

                // Debugging: Log the taskInsertResult to verify
                console.log('taskInsertResult', taskInsertResult);

                if (taskInsertResult.insertedCount <= 0) {
                    return res.status(500).json({ success: false, message: 'Error inserting task.' });
                }
            }

            return res.status(200).json({ success: true, message: 'Comentario añadido con éxito' });
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error.' });
        }
    } else {
        return res.status(405).json({ success: false, message: 'Invalid request method.' });
    }
}
