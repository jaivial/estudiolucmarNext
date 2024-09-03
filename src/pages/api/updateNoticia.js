// /pages/api/updateNoticia.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        try {
            const {
                id,
                fecha,
                prioridad,
                tipoPVA,
                valoracion,
                valoraciontext,
                comercial,
                fechaValoracion
            } = req.body;

            // Validate required fields
            if (!id || !fecha || !prioridad || !tipoPVA || valoracion === undefined || valoraciontext === undefined || comercial === undefined || fechaValoracion === undefined) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

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
                comercial_noticia: comercial || null,
                valoracionDate: fechaValoracion || null
            };

            const result = await db.collection('noticia').updateOne(
                { noticia_id: Number(id) },
                { $set: updatedData }
            );

            if (result.modifiedCount === 0) {
                return res.status(404).json({ success: false, message: 'No document found with the provided ID' });
            }

            res.status(200).json({ success: true, message: 'Record updated successfully' });
        } catch (error) {
            console.error('Error updating record:', error);
            res.status(500).json({ success: false, message: 'Error updating record' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
