import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { _id, nombre, apellido, dni, email, telefono, interes, rango_precios } = req.body;

        console.log(_id, nombre, apellido, dni, email, telefono, interes, rango_precios);

        // Adjust the validation to specifically check for undefined or null
        if (!_id || !nombre || !apellido || !email || !telefono || !interes || rango_precios.min === undefined || rango_precios.max === undefined) {
            return res.status(400).json({ message: 'Faltan campos obligatorios o el formato es incorrecto' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Actualiza la información del comprador
            const result = await db.collection('compradores').updateOne(
                { _id: new ObjectId(_id) },
                {
                    $set: {
                        nombre,
                        apellido,
                        dni,
                        email,
                        telefono,  // Incluyendo el campo de teléfono en la actualización
                        interes,
                        rango_precios,
                        updatedAt: new Date() // Fecha de actualización opcional
                    }
                }
            );

            if (result.modifiedCount === 1) {
                res.status(200).json({ message: 'Comprador actualizado con éxito' });
            } else {
                res.status(404).json({ message: 'Comprador no encontrado o no se pudo actualizar' });
            }
        } catch (error) {
            console.error('Error al actualizar el comprador:', error);
            res.status(500).json({ message: 'Error al actualizar el comprador', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Método ${req.method} no permitido`);
    }
}
