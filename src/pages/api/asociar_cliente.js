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


        console.log('inmuebleId', inmuebleId);
        console.log('inmuebleDireccion', inmuebleDireccion);
        console.log('pedido', pedido);
        console.log('clientsToAssociate', clientsToAssociate);
        console.log('clientsToAssociateInformador', clientsToAssociateInformador);
        console.log('clientsToAssociateInteres', clientsToAssociateInteres);
        console.log('clientsToAssociateRangoPrecios', clientsToAssociateRangoPrecios);
        console.log('propietario', propietario);
        console.log('inquilino', inquilino);

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            const updateFields = {};

            let inmuebles_asociados_propietario_toAdd = {};
            let inmuebles_asociados_inquilino_toAdd = {};
            let tipo_de_cliente_toAdd = [];

            // Update interes and rango_precios only if pedido is true
            if (pedido) {
                updateFields.pedido = true;
                updateFields.interes = clientsToAssociateInteres;
                updateFields.rango_precios = clientsToAssociateRangoPrecios;
            }

            // Set informador to true if clientsToAssociateInformador is true
            if (clientsToAssociateInformador) updateFields.informador = true;



            // If propietario is true, add to inmuebles_asociados_propietario array
            if (propietario) {
                inmuebles_asociados_propietario_toAdd = {
                    id: inmuebleId,
                    direccion: inmuebleDireccion,
                };
                tipo_de_cliente_toAdd.push('propietario');
            }

            // If inquilino is true, add to inmuebles_asociados_inquilino array
            if (inquilino) {
                inmuebles_asociados_inquilino_toAdd = {
                    id: inmuebleId,
                    direccion: inmuebleDireccion,
                };
                tipo_de_cliente_toAdd.push('inquilino');
            }

            console.log('inmuebles_asociados_propietario_toAdd', inmuebles_asociados_propietario_toAdd);
            console.log('inmuebles_asociados_inquilino_toAdd', inmuebles_asociados_inquilino_toAdd);

            console.log('tipo_de_cliente_toAdd', tipo_de_cliente_toAdd);

            // Perform the update on the specific cliente
            const result = await db.collection('clientes').updateOne(
                { _id: new ObjectId(clientsToAssociate) },  // Find the document by _id using new ObjectId
                { $set: updateFields },
            );


            if (inmuebles_asociados_inquilino_toAdd.id) {
                await db.collection('clientes').updateOne(
                    {
                        _id: new ObjectId(clientsToAssociate),
                        'inmuebles_asociados_inquilino.id': { $ne: inmuebles_asociados_inquilino_toAdd.id }
                    },
                    {
                        $push: { 'inmuebles_asociados_inquilino': inmuebles_asociados_inquilino_toAdd }
                    }
                );
            }

            if (inmuebles_asociados_propietario_toAdd.id) {
                await db.collection('clientes').updateOne(
                    {
                        _id: new ObjectId(clientsToAssociate),
                        'inmuebles_asociados_propietario.id': { $ne: inmuebles_asociados_propietario_toAdd.id }
                    },
                    {
                        $push: { 'inmuebles_asociados_propietario': inmuebles_asociados_propietario_toAdd }
                    }
                );
            }
            if (!inquilino) {
                await db.collection('clientes').updateOne(
                    { _id: new ObjectId(clientsToAssociate) },
                    { $pull: { 'inmuebles_asociados_inquilino': { id: inmuebleId } } }
                );
            }

            if (!propietario) {
                await db.collection('clientes').updateOne(
                    { _id: new ObjectId(clientsToAssociate) },
                    { $pull: { 'inmuebles_asociados_propietario': { id: inmuebleId } } }
                );
            }




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
