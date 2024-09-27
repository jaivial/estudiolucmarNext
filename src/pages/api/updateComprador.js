import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'POST') {
        const { _id, interes, rango_precios } = req.body;

        console.log(rango_precios);


        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Actualiza la información del comprador
            const result = await db.collection('clientes').updateOne(
                { _id: new ObjectId(_id) },
                {
                    $set: {
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
