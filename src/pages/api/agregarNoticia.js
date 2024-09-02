// /pages/api/agregarNoticia.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
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


        // Handle empty valoraciontext
        const valoracion_establecida = valoraciontext === '' ? null : valoraciontext;

        // Validate and format fechaValoracion
        const valoracionDate = fechaValoracion ? new Date(fechaValoracion).toISOString().split('T')[0] : null;

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Start a session for transaction
            const session = client.startSession();
            session.startTransaction();

            // Insert into noticia
            const noticiaResult = await db.collection('noticias').insertOne({
                noticia_id: Number(id),
                tipo_PV: tipoPVA,
                valoracion: Number(valoracion),
                valoracion_establecida,
                noticia_fecha: fecha,
                prioridad,
                comercial_noticia: comercial,
                valoracionDate
            }, { session });

            if (noticiaResult.insertedCount === 0) {
                throw new Error('Failed to insert noticia');
            }

            // Update inmuebles
            const inmueblesResult = await db.collection('inmuebles').updateOne(
                { id: Number(id) },
                { $set: { noticiastate: true } },
                { session }
            );

            if (inmueblesResult.modifiedCount === 0) {
                throw new Error('Failed to update inmuebles');
            }

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ success: 'Record added and noticiastate updated successfully' });
        } catch (error) {

            console.error('Transaction failed:', error);
            res.status(500).json({ error: `Transaction failed: ${error.message}` });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
