import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    const { inmuebleId } = req.query;
    console.log('inmuebleId GATOOOOO', inmuebleId);
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
