import cors, { runMiddleware } from '../../utils/cors';
import { v4 as uuidv4 } from 'uuid';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'POST') {
        try {
            const { nombre, apellido, telefono, dni, tipoDeCliente, inmuebleId, direccion } = req.body;
            const client_id = uuidv4();
            const parsedTelefono = parseInt(telefono);

            const clienteData = {
                nombre,
                apellido,
                telefono,
                dni,
                tipo_de_cliente: tipoDeCliente,
                inmuebles_asociados_informador: [],
                inmuebles_asociados_propietario: [],
                inmuebles_asociados_copropietario: [],
                inmuebles_asociados_inquilino: [],
                inmueblesDetalle: [],
                client_id,
                informador: true,
            };

            console.log(nombre, apellido, telefono, dni, tipoDeCliente, inmuebleId, direccion);

            if (tipoDeCliente.includes('informador')) {
                clienteData.inmuebles_asociados_informador.push({ id: parseInt(inmuebleId, 10), direccion: direccion });
            }
            if (tipoDeCliente.includes('propietario')) {
                clienteData.inmuebles_asociados_propietario.push({ id: parseInt(inmuebleId, 10), direccion: direccion });
            }
            if (tipoDeCliente.includes('copropietario')) {
                clienteData.inmuebles_asociados_copropietario.push({ id: parseInt(inmuebleId, 10), direccion: direccion });
            }
            if (tipoDeCliente.includes('inquilino')) {
                clienteData.inmuebles_asociados_inquilino.push({ id: parseInt(inmuebleId, 10), direccion: direccion });
            }

            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Insert new client into 'clientes' collection
            const result = await db.collection('clientes').insertOne(clienteData);

            // Convert inmuebleId to integer if necessary
            const inmuebleIdInt = parseInt(inmuebleId);

            // Update the main document in 'inmuebles' collection if it directly matches 'inmuebleId'
            await db.collection('inmuebles').updateOne(
                { id: inmuebleIdInt },
                {
                    $set: {
                        localizado: true,
                        localizado_phone: parsedTelefono,
                        client_id: client_id,
                    },
                }
            );

            // Update nestedinmuebles within 'inmuebles' collection
            await db.collection('inmuebles').updateMany(
                { 'nestedinmuebles.id': inmuebleIdInt },
                {
                    $set: {
                        'nestedinmuebles.$[elem].localizado': true,
                        'nestedinmuebles.$[elem].localizado_phone': parsedTelefono,
                        'nestedinmuebles.$[elem].client_id': client_id,
                    }
                },
                {
                    arrayFilters: [{ 'elem.id': inmuebleIdInt }]
                }
            );

            // Update nestedinmuebles within nestedescaleras in 'inmuebles' collection
            await db.collection('inmuebles').updateMany(
                { 'nestedescaleras.nestedinmuebles.id': inmuebleIdInt },
                {
                    $set: {
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].localizado': true,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].localizado_phone': parsedTelefono,
                        'nestedescaleras.$[escalera].nestedinmuebles.$[elem].client_id': client_id,
                    }
                },
                {
                    arrayFilters: [
                        { 'escalera.nestedinmuebles': { $exists: true } },
                        { 'elem.id': inmuebleIdInt }
                    ]
                }
            );

            res.status(201).json({ message: 'Cliente creado con éxito', clienteId: result.insertedId });
        } catch (error) {
            console.error('Error al crear cliente:', error);
            res.status(500).json({ message: 'Error al crear cliente', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
