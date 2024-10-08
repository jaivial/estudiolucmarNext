import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'PUT') {
        const editCliente = req.body;
        const { inmuebleId, inmuebleDireccion } = req.query;

        console.log('editCliente', editCliente);
        console.log('inmuebleDireccion', inmuebleDireccion);

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');
            const { _id, ...updateData } = editCliente;
            console.log('inmuebleId UPDATE', parseInt(inmuebleId));
            console.log('informador UPDATE', updateData.informador);

            const inmuebleIdAsNumber = parseInt(inmuebleId); // Ensure inmuebleId is an integer
            // Check if the informador field is false, and remove the object with the matching id from inmuebles_asociados_informador
            if (updateData.informador === false && inmuebleId) {

                // Remove the object from inmuebles_asociados_informador in editCliente
                updateData.inmuebles_asociados_informador = updateData.inmuebles_asociados_informador.filter(item => item.id !== inmuebleIdAsNumber);

                // Log the updated inmuebles_asociados_informador
                console.log('Updated inmuebles_asociados_informador:', editCliente.inmuebles_asociados_informador);
            }

            // Check if the informador field is true, and add the object if it doesn't exist
            if (updateData.informador === true) {
                const existingInmueble = updateData.inmuebles_asociados_informador.find(item => item.id === inmuebleIdAsNumber);

                if (!existingInmueble) {
                    // Add the new object if it doesn't exist
                    updateData.inmuebles_asociados_informador.push({
                        id: inmuebleIdAsNumber,
                        direccion: inmuebleDireccion // Use the direccion passed in the API
                    });

                }
            }

            // Perform the update with the modified editCliente object
            const response = await db.collection('clientes').updateOne(
                { _id: new ObjectId(_id) },
                { $set: updateData }
            );

            if (response.acknowledged) {
                res.status(200).json({ status: 'success', message: 'Cliente actualizado con éxito' });

                // Log the updated document to confirm the change
                const updatedDocument = await db.collection('clientes').findOne({ _id: new ObjectId(_id) });
                console.log('Updated inmuebles_asociados_informador after update:', updatedDocument.inmuebles_asociados_informador);
            } else {
                res.status(404).json({ status: 'fail', message: 'Cliente no encontrado o datos no modificados' });
            }
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            res.status(500).json({ status: 'error', message: 'Error al actualizar cliente', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
