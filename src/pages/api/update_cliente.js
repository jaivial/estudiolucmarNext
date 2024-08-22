import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    const { _id, client_id, nombre, apellido, dni, telefono, tipo_de_cliente, inmuebles_asociados_informador, inmuebles_asociados_propietario, inmuebles_asociados_copropietario, inmuebles_asociados_inquilino } = req.body;

    const client = await clientPromise;
    const db = client.db('inmoprocrm');

    try {
        const result = await db.collection('clientes').updateOne(
            { client_id: client_id }, // Matching based on client_id, which is unique
            {
                $set: {
                    nombre,
                    apellido,
                    dni,
                    telefono,
                    tipo_de_cliente,
                    inmuebles_asociados_informador,
                    inmuebles_asociados_propietario,
                    inmuebles_asociados_copropietario,
                    inmuebles_asociados_inquilino,
                }
            }
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({ message: 'Cliente actualizado con éxito' });
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ message: 'Error al actualizar cliente' });
    }
}
