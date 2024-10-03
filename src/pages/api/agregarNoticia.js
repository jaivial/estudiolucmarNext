import cors, { runMiddleware } from '../../utils/cors';
// /pages/api/agregarNoticia.js
import clientPromise from '../../lib/mongodb';
export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'POST') {
        const {
            id,
            tipoPVA,
            valoracion,
            valoraciontext,
            fecha,
            prioridad,
            comercial,
            fechaValoracion
        } = req.body;

        const currentDateFormatted = new Date().toISOString().split('T')[0];
        const fechaWithDefault = fecha || currentDateFormatted;
        const fechaValoracionWithDefault = fechaValoracion || currentDateFormatted;

        // Handle empty valoraciontext
        const valoracion_establecida = valoraciontext === '' ? null : valoraciontext;

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Insert into noticia
            const noticiaResult = await db.collection('noticias').insertOne({
                noticia_id: Number(id),
                tipo_PV: tipoPVA,
                valoracion: Number(valoracion),
                valoracion_establecida: parseInt(valoracion_establecida),
                noticia_fecha: fechaWithDefault,
                prioridad,
                comercial_noticia: comercial,
                valoracionDate: fechaValoracionWithDefault
            });

            if (noticiaResult.insertedCount === 0) {
                throw new Error('Failed to insert noticia');
            }

            // Update inmuebles
            const inmueblesResult = await db.collection('inmuebles').updateOne(
                { id: Number(id) },
                { $set: { noticiastate: true } }
            );

            if (inmueblesResult.modifiedCount === 0) {
                throw new Error('Failed to update inmuebles');
            }

            res.status(200).json({ success: 'Record added and noticiastate updated successfully' });
        } catch (error) {
            console.error('Operation failed:', error);
            res.status(500).json({ error: `Operation failed: ${error.message}` });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
