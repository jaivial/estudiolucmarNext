import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
// Function to generate a random number as ID
const generateRandomId = () => Math.floor(Math.random() * 1000000); // Generates a random number between 0 and 999999

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


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


            if (insertResult && (tipo === 'Cita' || tipo === 'Llamada') && fecha && hora) {
                // Define the task based on TipoComentario
                let taskDescription;
                if (tipo === 'Cita') {
                    taskDescription = `Cita: ${comentario}`;
                } else if (tipo === 'Llamada') {
                    taskDescription = `Llamada: ${comentario} ${telefono}`;
                } else {
                    taskDescription = comentario; // Default to just the comment if no matching type
                }

                // Format fecha and hora if provided
                const formattedFecha = fecha ? new Date(fecha).toISOString().split('T')[0] : null;
                const formattedHora = hora ? new Date(hora).toISOString().substring(11, 16) : null;

                // Insert task into 'tasks' collection
                const tasksCollection = db.collection('tasks');
                const taskInsertResult = await tasksCollection.insertOne({
                    task_date: formattedFecha,   // Insert formatted fecha as 'YYYY-MM-DD' or null
                    task_time: formattedHora,    // Insert formatted hora as 'HH:mm' or null
                    task: taskDescription,       // Use the task description based on TipoComentario
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
