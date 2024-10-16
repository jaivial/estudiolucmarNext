import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

function generateRandomId() {
    return Math.random().toString(36).substr(2, 9); // Generates a random string of length 9
}


export default async function handler(req, res) {
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
                user_id,
                comentarioProgramado
            } = req.query;

            console.log('req.body', req.query);

            if (!id || !comentario || !tipo || !user_id) {
                return res.status(400).json({ success: false, message: 'Required parameters not set.' });
            }

            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            const now = new Date();
            const dateTime = now.toISOString();
            const formattedFecha = fecha ? new Date(fecha).toISOString().split('T')[0] : null;

            let programado = null;
            if (comentarioProgramado === "true") {
                programado = true;
            } else if (comentarioProgramado === "false") {
                programado = false;
            }

            const comentariosCollection = db.collection('comentarios');
            const insertResult = await comentariosCollection.insertOne({
                comentario_id: parseInt(id, 10),
                date_time: dateTime,
                texto: comentario,
                TipoComentario: tipo,
                telefono: telefono || '',
                comentarioProgramado: programado,
            });

            console.log('insertResult', insertResult);

            if (insertResult && (tipo === 'Cita' || tipo === 'Llamada') && fecha && hora) {
                console.log('insertando tarea');
                const tasksCollection = db.collection('tasks');
                const taskDescription = tipo === 'Cita' ? `Cita: ${comentario}` : `Llamada: ${comentario} ${telefono}`;
                const formattedHora = hora ? new Date(hora).toISOString().substring(11, 16) : null;

                const taskInsertResult = await tasksCollection.insertOne({
                    task_date: formattedFecha,
                    task_time: formattedHora,
                    task: taskDescription,
                    completed: false,
                    user_id: parseInt(user_id, 10),
                    id: insertResult.insertedId + 'comment' + generateRandomId(),
                });

                console.log('taskInsertResult', taskInsertResult);

                if (taskInsertResult.insertedCount <= 0) {
                    return res.status(500).json({ success: false, message: 'Error inserting task.' });
                }

            }

            if (insertResult) {
                const inmueblesCollection = db.collection('inmuebles');

                console.log('id', id);

                // Update 'lastCommentDate' in the 'inmuebles' collection
                let inmueble = await inmueblesCollection.findOne({ id: parseInt(id, 10) });

                console.log('updateTimeLast', dateTime);

                if (!inmueble) {
                    inmueble = await inmueblesCollection.findOne({
                        tipoagrupacion: 2,
                        'nestedinmuebles.id': parseInt(id, 10)
                    });
                }

                if (!inmueble) {
                    inmueble = await inmueblesCollection.findOne({
                        tipoagrupacion: 2,
                        'nestedescaleras.nestedinmuebles.id': parseInt(id, 10)
                    });
                }

                if (inmueble) {
                    let updateFilter;
                    let arrayFilters;

                    if (inmueble.id === parseInt(id, 10)) {
                        // Direct match on inmueble
                        updateFilter = { lastCommentDate: dateTime };
                        arrayFilters = [];
                    } else if (inmueble.nestedinmuebles && inmueble.nestedinmuebles.some(n => n.id === parseInt(id, 10))) {
                        // Match in nestedinmuebles
                        updateFilter = { 'nestedinmuebles.$[elem].lastCommentDate': dateTime };
                        arrayFilters = [{ 'elem.id': parseInt(id, 10) }];
                    } else if (
                        inmueble.nestedescaleras &&
                        inmueble.nestedescaleras.some(escalera =>
                            escalera.nestedinmuebles && escalera.nestedinmuebles.some(n => n.id === parseInt(id, 10))
                        )
                    ) {
                        // Match in nestedescaleras.nestedinmuebles
                        updateFilter = { 'nestedescaleras.$[escalera].nestedinmuebles.$[elem].lastCommentDate': dateTime };
                        arrayFilters = [
                            { 'escalera.nestedinmuebles.id': parseInt(id, 10) },
                            { 'elem.id': parseInt(id, 10) }
                        ];
                    }

                    if (updateFilter) {
                        const updateResult = await inmueblesCollection.updateOne(
                            { _id: inmueble._id },
                            { $set: updateFilter },
                            { arrayFilters: arrayFilters }
                        );

                        console.log('updateResult', updateResult);
                    } else {
                        console.log('Matching nested object not found');
                    }
                } else {
                    console.log('Inmueble not found');
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
