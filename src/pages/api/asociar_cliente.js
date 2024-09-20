import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const {
            inmuebleId,
            inmuebleDireccion,
            pedido,
            clientsToAssociate,
            clientsToAssociateInformador,
            clientsToAssociateInteres,
            clientsToAssociateRangoPrecios,
            propietario,
            inquilino
        } = req.body;

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            const updateFields = {};

            // Update interes and rango_precios only if pedido is true
            if (pedido) {
                updateFields.pedido = true;
                updateFields.interes = clientsToAssociateInteres;
                updateFields.rango_precios = clientsToAssociateRangoPrecios;
            }

            // Set informador to true if clientsToAssociateInformador is true
            if (clientsToAssociateInformador) updateFields.informador = true;

            // Conditionally add 'propietario' and/or 'inquilino' to tipo_de_cliente array
            if (propietario) updateFields.tipo_de_cliente = { $addToSet: { tipo_de_cliente: 'propietario' } };
            if (inquilino) updateFields.tipo_de_cliente = { $addToSet: { tipo_de_cliente: 'inquilino' } };

            // If propietario is true, add to inmuebles_asociados_propietario array
            if (propietario) {
                updateFields.inmuebles_asociados_propietario = {
                    $push: {
                        id: inmuebleId,
                        direccion: inmuebleDireccion,
                    }
                };
            }

            // If inquilino is true, add to inmuebles_asociados_inquilino array
            if (inquilino) {
                updateFields.inmuebles_asociados_inquilino = {
                    $push: {
                        id: inmuebleId,
                        direccion: inmuebleDireccion,
                    }
                };
            }

            // Perform the update on the specific cliente
            const result = await db.collection('clientes').updateOne(
                { _id: new ObjectId(clientsToAssociate) },  // Find the document by _id using new ObjectId
                { $set: updateFields }        // Apply the update
            );

            if (result.matchedCount === 0) {
                res.status(404).json({ message: 'Cliente not found' });
            } else {
                res.status(200).json({ status: 'success' });
            }
        } catch (error) {
            console.error('Error al asociar cliente:', error);
            res.status(500).json({ message: 'Error al asociar cliente', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
