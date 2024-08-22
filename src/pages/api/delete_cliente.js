import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        // Conexión a la base de datos
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Obtener el ID del cliente desde el cuerpo de la solicitud
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'El ID del cliente es requerido' });
        }

        // Eliminar el cliente de la colección
        const result = await db.collection('clientes').deleteOne({ client_id: id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        // Responder con éxito
        res.status(200).json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando el cliente:', error);
        res.status(500).json({ message: 'Error eliminando el cliente' });
    }
}
