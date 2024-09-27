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

        console.log('comercial', comercial);
        console.log('fecha', fechaWithDefault);
        console.log('fechaValoracion', fechaValoracionWithDefault);
        console.log('prioridad', prioridad);
        console.log('tipoPVA', tipoPVA);
        console.log('valoracion', valoracion);
        console.log('valoraciontext', valoraciontext);

        // Handle empty valoraciontext
        const valoracion_establecida = valoraciontext === '' ? null : valoraciontext;

        // Use fechaWithDefault and fechaValoracionWithDefault when fecha or fechaValoracion are empty
        const noticia_fecha = fechaWithDefault;
        const valoracionDate = fechaValoracionWithDefault;

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
                noticia_fecha,
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
