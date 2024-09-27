import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    // Get the 'id' parameter from the query string
    const { id } = req.query;
    console.log('id', id);

    try {
        // Connect to the MongoDB client
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Find a noticia by its noticia_id
        const noticia = await db.collection('noticias').findOne({ noticia_id: parseInt(id) });

        if (noticia) {
            // Construct the response with the noticia details
            res.status(200).json({
                status: 'success',
                noticia: {
                    id: noticia._id,
                    noticia_id: noticia.noticia_id,
                    noticia_fecha: noticia.noticia_fecha,
                    tipo_PV: noticia.tipo_PV,
                    valoracion: noticia.valoracion,
                    valoracionDate: noticia.valoracionDate,
                    valoracion_establecida: noticia.valoracion_establecida,
                    prioridad: noticia.prioridad,
                    comercial_noticia: noticia.comercial_noticia,
                },
            });
        } else {
            // If no noticia is found, return an error
            res.status(200).json({
                status: 'failure',
                noticia: { error: 'No record found' },
            });
        }
    } catch (error) {
        console.error('Error fetching noticia:', error);
        res.status(500).json({
            status: 'failure',
            noticia: { error: 'Error fetching noticia' },
        });
    }
}
