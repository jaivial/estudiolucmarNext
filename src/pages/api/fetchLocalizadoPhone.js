import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    const { inmuebleId } = req.query;

    console.log('inmuebleId', inmuebleId);

    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Convert inmuebleId to integer
        const inmuebleIdInt = parseInt(inmuebleId);

        // Step 1: Look for a document in 'inmuebles' where 'id' equals inmuebleIdInt
        let inmuebleData = await db.collection('inmuebles').findOne(
            { id: inmuebleIdInt },
            { projection: { client_id: 1 } }
        );

        let clientId = inmuebleData?.client_id;

        // Step 2: If not found, look for 'inmuebleIdInt' specifically within nestedinmuebles array objects
        if (!clientId) {
            let inmuebleData = await db.collection('inmuebles').findOne(
                {
                    "nestedinmuebles.id": inmuebleIdInt
                },
                {
                    "nestedinmuebles": 1, // Only retrieve the nestedinmuebles field
                    "_id": 0 // Optionally exclude _id if you don’t need it
                }
            );

            // Filter to get only the matching nestedinmuebles object
            if (inmuebleData && inmuebleData.nestedinmuebles) {
                inmuebleData.nestedinmuebles = inmuebleData.nestedinmuebles.filter(
                    inmueble => inmueble.id === inmuebleIdInt
                );

                // Optionally narrow down inmuebleData to just the matched nestedinmueble
                if (inmuebleData.nestedinmuebles.length > 0) {
                    inmuebleData = inmuebleData.nestedinmuebles[0];
                }
            }

            // Extract client_id from the matched nested object
            clientId = inmuebleData?.client_id;

            // Console log the result
            console.log("Filtered inmuebleData:", inmuebleData);
        }


        // Step 3: If still not found, look for 'inmuebleIdInt' within nestedescaleras.nestedinmuebles
        if (!clientId) {
            let inmuebleData = await db.collection('inmuebles').findOne(
                {
                    "nestedescaleras.nestedinmuebles.id": inmuebleIdInt
                },
                {
                    "nestedescaleras": 1, // Only retrieve nestedescaleras field
                    "_id": 0 // Optionally exclude _id if you don’t need it
                }
            );

            // Filter to get only the matching nestedinmuebles within nestedescaleras
            if (inmuebleData && inmuebleData.nestedescaleras) {
                inmuebleData.nestedescaleras = inmuebleData.nestedescaleras
                    .map(escalera => ({
                        ...escalera,
                        nestedinmuebles: escalera.nestedinmuebles.filter(
                            inmueble => inmueble.id === inmuebleIdInt
                        )
                    }))
                    .filter(escalera => escalera.nestedinmuebles.length > 0);
            }

            // Optionally: If you only want the matching `nestedinmuebles` item without the rest of `inmuebleData`
            if (inmuebleData && inmuebleData.nestedescaleras.length > 0) {
                inmuebleData = inmuebleData.nestedescaleras[0].nestedinmuebles[0];
            }
            clientId = inmuebleData?.client_id;
        }





        // Fetch client data if clientId was found
        let clientData = null;
        if (clientId) {
            console.log('CLIENT ID', clientId);
            clientData = await db.collection('clientes').findOne(
                { client_id: clientId },
                { projection: { nombre: 1, apellido: 1, telefono: 1, tipo_de_cliente: 1, client_id: 1, inmuebles_asociados_inquilino: 1, inmuebles_asociados_copropietario: 1, inmuebles_asociados_propietario: 1, inmuebles_asociados_informador: 1 } }
            );
        }

        // Send response
        if (clientData) {
            res.status(200).json({ clientData });
        } else {
            res.status(200).json({ message: 'Cliente no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el teléfono localizado:', error);
        res.status(500).json({ message: 'Error al obtener el teléfono localizado', error: error.message });
    }
}
