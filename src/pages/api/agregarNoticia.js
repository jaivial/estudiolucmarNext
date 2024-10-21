import cors, { runMiddleware } from '../../utils/cors';
// /pages/api/agregarNoticia.js
import clientPromise from '../../lib/mongodb';

// Helper function to remove dots from a string and parse it as an integer
const formatToInt = (value) => {
    if (!value) return 0; // Return 0 if value is null or undefined
    const formattedValue = value.replace(/\./g, ''); // Remove dots
    return parseInt(formattedValue, 10); // Parse as integer
};

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
                valoracion: (typeof valoracion === 'string') ? formatToInt(valoracion) : valoracion,
                valoracion_establecida: (typeof valoracion === 'string') ? formatToInt(valoracion_establecida) : valoracion_establecida,
                noticia_fecha: fechaWithDefault,
                prioridad,
                comercial_noticia: comercial,
                valoracionDate: fechaValoracionWithDefault
            });

            if (noticiaResult.insertedCount === 0) {
                throw new Error('Failed to insert noticia');
            }

            // Update inmuebles
            let inmueblesResult = await db.collection('inmuebles').updateOne(
                { id: Number(id) },
                { $set: { noticiastate: true } }
            );

            // If the main property was not updated, search for the nested ones
            if (inmueblesResult.modifiedCount === 0) {
                // Try to update nestedinmuebles inside documents with tipoagrupacion == 2
                inmueblesResult = await db.collection('inmuebles').updateOne(
                    {
                        tipoagrupacion: 2,
                        "nestedinmuebles.id": Number(id)
                    },
                    { $set: { "nestedinmuebles.$.noticiastate": true } }
                );

                // If still not updated, try to update nestedescaleras.nestedinmuebles inside documents with tipoagrupacion == 2
                if (inmueblesResult.modifiedCount === 0) {
                    inmueblesResult = await db.collection('inmuebles').updateOne(
                        {
                            tipoagrupacion: 2,
                            "nestedescaleras.nestedinmuebles.id": Number(id)
                        },
                        { $set: { "nestedescaleras.$[].nestedinmuebles.$[elem].noticiastate": true } },
                        { arrayFilters: [{ "elem.id": Number(id) }] }
                    );
                }
            }

            // If still not updated, return an error
            if (inmueblesResult.modifiedCount === 0) {
                throw new Error('Failed to update inmuebles or nested property');
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
