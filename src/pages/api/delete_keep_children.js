import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { inmuebles } = req.body;

    if (!Array.isArray(inmuebles) || inmuebles.length === 0) {
        return res.status(400).json({ message: 'Invalid input' });
    }
    console.log('nested inmuebles array', inmuebles);

    try {
        console.time("Delete Inmueble Duration");

        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        for (const selectedId of inmuebles) {
            const inmueble = await db.collection('inmuebles').findOne({ id: selectedId });

            if (inmueble) {
                if (inmueble.tipoagrupacion === 1) {
                    console.log('regular inmueble do nothing');
                } else if (inmueble.tipoagrupacion === 2) {
                    // If the inmueble has nested escalera(s)
                    if (inmueble.nestedescaleras && inmueble.nestedescaleras.length > 0) {
                        for (const escalera of inmueble.nestedescaleras) {
                            if (escalera.nestedinmuebles && escalera.nestedinmuebles.length > 0) {
                                // Insert all nestedinmuebles inside nestedescaleras as regular documents
                                await Promise.all(escalera.nestedinmuebles.map(async (nestedInmueble) => {
                                    await db.collection('inmuebles').insertOne(nestedInmueble);
                                }));
                            }
                        }
                    }

                    // If the inmueble itself has nestedinmuebles
                    if (inmueble.nestedinmuebles && inmueble.nestedinmuebles.length > 0) {
                        // Insert all nestedinmuebles as regular documents
                        await Promise.all(inmueble.nestedinmuebles.map(async (nestedInmueble) => {
                            await db.collection('inmuebles').insertOne(nestedInmueble);
                        }));
                    }

                    // Delete the original inmueble
                    await db.collection('inmuebles').deleteOne({ id: selectedId });
                }
            } else {
                // Check if the selected ID is a nestedescalera
                const nestedEscalera = await db.collection('inmuebles').findOne({ "nestedescaleras.id": selectedId });
                if (nestedEscalera) {
                    const escalera = nestedEscalera.nestedescaleras.find(e => e.id === selectedId);
                    if (escalera) {
                        // If the selectedId is a nestedescalera
                        if (escalera.nestedinmuebles && escalera.nestedinmuebles.length > 0) {
                            // Insert all nestedinmuebles as regular documents
                            await Promise.all(escalera.nestedinmuebles.map(async (nestedInmueble) => {
                                await db.collection('inmuebles').insertOne(nestedInmueble);
                            }));
                        }
                        // Delete the nestedescalera object
                        await db.collection('inmuebles').updateOne({ id: nestedEscalera.id }, { $pull: { nestedescaleras: { id: selectedId } } });
                    }
                }
            }
        }

        console.timeEnd("Delete Inmueble Duration");

        return res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
