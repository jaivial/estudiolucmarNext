import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    const { encargoID } = req.body; // Assuming encargoID is passed in the request body

    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Use Promise.all to perform multiple deletions in parallel
        await Promise.all([
            db.collection('encargos').deleteMany({ encargo_id: encargoID }),
            db.collection('noticias').deleteMany({ noticia_id: encargoID })
        ]);

        // Find the inmueble directly by id
        const inmueble = await db.collection('inmuebles').findOne({ id: encargoID });

        if (inmueble) {
            // Update the fields if the inmueble is found
            await db.collection('inmuebles').updateOne(
                { id: encargoID },
                { $set: { noticiastate: false, encargostate: false } }
            );
        } else {
            // If not found, perform a search in nested arrays
            const query = { tipoagrupacion: 2 };
            const updateOperation = {
                $set: { "nestedinmuebles.$[item].noticiastate": false, "nestedinmuebles.$[item].encargostate": false }
            };

            // Look for nestedinmuebles
            const result = await db.collection('inmuebles').updateOne(
                query,
                updateOperation,
                { arrayFilters: [{ "item.id": encargoID }] }
            );

            if (result.matchedCount === 0) {
                // If still not found, look into nestedescaleras.nestedinmuebles
                await db.collection('inmuebles').updateOne(
                    query,
                    {
                        $set: {
                            "nestedescaleras.$[escalera].nestedinmuebles.$[item].noticiastate": false,
                            "nestedescaleras.$[escalera].nestedinmuebles.$[item].encargostate": false
                        }
                    },
                    {
                        arrayFilters: [
                            { "escalera.nestedinmuebles.id": encargoID },
                            { "item.id": encargoID }
                        ]
                    }
                );
            }
        }

        res.status(200).json({ status: 'success', message: 'Encargo finalizado y procesado correctamente' });
    } catch (error) {
        console.error('Error finalizando encargo:', error);
        res.status(500).json({ status: 'failure', message: 'Error finalizando encargo' });
    }
}
