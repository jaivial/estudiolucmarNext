import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    const { inmuebleId } = req.query;
    console.log('inmuebleId GATOOOOO', inmuebleId);
    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        const clientesTotales = await db.collection('clientes').find({}, { projection: { _id: 1, nombre: 1, apellido: 1, telefono: 1, dni: 1, client_id: 1, inmuebles_asociados_informador: 1, inmuebles_asociados_propietario: 1, inmuebles_asociados_copropietario: 1 } }).toArray();
        const clientesTarget = [];

        for (const cliente of clientesTotales) {
            const tipoDeCliente = [];
            if (cliente.inmuebles_asociados_informador && cliente.inmuebles_asociados_informador.some(inmueble => inmueble.id === parseInt(inmuebleId))) {
                tipoDeCliente.push('informador');
            }
            if (cliente.inmuebles_asociados_propietario && cliente.inmuebles_asociados_propietario.some(inmueble => inmueble.id === parseInt(inmuebleId))) {
                tipoDeCliente.push('propietario');
            }
            if (cliente.inmuebles_asociados_copropietario && cliente.inmuebles_asociados_copropietario.some(inmueble => inmueble.id === parseInt(inmuebleId))) {
                tipoDeCliente.push('copropietario');
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
