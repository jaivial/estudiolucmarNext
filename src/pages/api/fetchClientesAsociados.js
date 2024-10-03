import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);

    const { inmuebleId } = req.query;
    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        const clientesTotales = await db.collection('clientes').find({}).toArray();
        const clientesTarget = [];

        for (const cliente of clientesTotales) {
            const tipoDeCliente = [];
            if (cliente.inmuebles_asociados_inquilino && cliente.inmuebles_asociados_inquilino.some(inmueble => inmueble.id === parseInt(inmuebleId))) {
                tipoDeCliente.push('inquilino');
            }
            if (cliente.inmuebles_asociados_propietario && cliente.inmuebles_asociados_propietario.some(inmueble => inmueble.id === parseInt(inmuebleId))) {
                tipoDeCliente.push('propietario');
            }
            // Check if there are no matches on inmuebles_asociados_inquilino nor on inmuebles_asociados_propietario
            if (!cliente.inmuebles_asociados_inquilino || !cliente.inmuebles_asociados_inquilino.some(inmueble => inmueble.id === parseInt(inmuebleId))) {
                if (!cliente.inmuebles_asociados_propietario || !cliente.inmuebles_asociados_propietario.some(inmueble => inmueble.id === parseInt(inmuebleId))) {
                    // Check if the cliente is an informador
                    if (cliente.inmuebles_asociados_informador && cliente.inmuebles_asociados_informador.some(inmueble => inmueble.id === parseInt(inmuebleId))) {
                        tipoDeCliente.push('informador'); // Push 'informador' if found
                    }
                }
            }

            if (tipoDeCliente.length > 0) {
                clientesTarget.push({
                    ...cliente,
                    tipo_de_cliente: tipoDeCliente
                });
            }
        }

        res.status(200).json({ clientesTotales, clientesTarget });
    } catch (error) {
        console.error('Error fetching clientes asociados:', error);
        res.status(500).json({ message: 'Error fetching clientes asociados', error: error.message });
    }
}
