import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'POST') {
        try {
            const {
                id,
                fecha,
                prioridad,
                tipoPVA,
                valoracion,
                valoraciontext,
                comercial,
                fechaValoracion,
            } = req.body;




            // Validate ID
            if (isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: 'ID must be a valid integer' });
            }

            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Convert empty strings to null
            const updatedData = {
                noticia_fecha: fecha || null,
                prioridad: prioridad || null,
                tipo_PV: tipoPVA || null,
                valoracion: valoracion || null,
                valoracion_establecida: valoraciontext || null,
                comercial_noticia: comercial.value || null,
                valoracionDate: fechaValoracion || null
            };

            const result = await db.collection('noticias').updateOne(
                { noticia_id: id },
                { $set: updatedData }
            );
            console.log('result', result);
            if (result.matchedCount === 0) {
                return res.status(404).json({ success: false, message: 'No document found with the provided ID' });
            }

            res.status(200).json({ success: true, message: 'Record updated successfully' });
        } catch (error) {
            console.error('Error updating noticia:', error);
            res.status(500).json({ success: false, message: 'An error occurred while updating the record' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
