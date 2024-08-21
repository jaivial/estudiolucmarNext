import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { inmuebles } = req.body;

    if (!Array.isArray(inmuebles) || inmuebles.length === 0) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        console.time("Check Nested Elements Duration");
        console.log('inmuebles ids', inmuebles)

        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        const nestedElements = [];
        for (const selectedId of inmuebles) {
            const inmueble = await db.collection('inmuebles').findOne({ id: selectedId });


            if (inmueble) {
                if (inmueble.tipoagrupacion === 1) {
                    console.log('no actions needed');
                }
                if (inmueble.tipoagrupacion === 2) {
                    if (inmueble.nestedinmuebles && inmueble.nestedinmuebles.length > 0 || inmueble.nestedescaleras && inmueble.nestedescaleras.some(escalera => escalera.nestedinmuebles && escalera.nestedinmuebles.length > 0)) {
                        nestedElements.push(selectedId);
                    }
                }
            } else {
                // Check if the selected ID is a nestedescalera
                const nestedEscalera = await db.collection('inmuebles').findOne({ "nestedescaleras.id": selectedId });
                if (nestedEscalera) {
                    const escalera = nestedEscalera.nestedescaleras.find(e => e.id === selectedId);
                    if (escalera && escalera.nestedinmuebles && escalera.nestedinmuebles.length > 0) {
                        nestedElements.push(selectedId);
                    }
                }
            }
        }

        console.timeEnd("Check Nested Elements Duration");


        return res.status(200).json({ status: 'success', empty: nestedElements.length === 0, nestedElements });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}