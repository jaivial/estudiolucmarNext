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
        console.time("Ungroup Duration");

        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name


        // Step 1: Collect full data for nested inmuebles
        const nestedInmuebles = [];
        for (const selectedId of inmuebles) {
            // Check if the selected ID is in nestedescaleras.nestedinmuebles of any document
            const nestedEscalerasInmueble = await db.collection('inmuebles').findOne({
                "nestedescaleras.nestedinmuebles.id": selectedId
            });

            if (nestedEscalerasInmueble) {
                const fullNestedEscalerasInmueble = nestedEscalerasInmueble.nestedescaleras.find(n => n.nestedinmuebles.some(i => i.id === selectedId));
                if (fullNestedEscalerasInmueble) {
                    nestedInmuebles.push(...fullNestedEscalerasInmueble.nestedinmuebles.filter(i => i.id === selectedId));
                }
            } else {
                // Check if the selected ID is in nestedinmuebles of any document
                const nestedInmueble = await db.collection('inmuebles').findOne({
                    "nestedinmuebles.id": selectedId
                });

                if (nestedInmueble) {
                    const fullNestedInmueble = nestedInmueble.nestedinmuebles.find(n => n.id === selectedId);
                    if (fullNestedInmueble) {
                        nestedInmuebles.push(fullNestedInmueble);
                    }
                } else {
                    console.log('No parent document found for selected ID:', selectedId);
                }
            }
        }

        console.log('nestedInmuebles:', nestedInmuebles);

        // Step 2: Remove selected inmuebles from their original documents and delete from collection
        const emptyParents = [];
        for (const selectedId of inmuebles) {
            // Check if the selected ID is in nestedinmuebles or nestedescaleras.nestedinmuebles of any document
            // Find the parent document containing the selectedId in either nestedinmuebles or nestedescaleras.nestedinmuebles
            const parentDocument = await db.collection('inmuebles').findOne({
                $or: [
                    { "nestedinmuebles.id": selectedId },
                    { "nestedescaleras.nestedinmuebles.id": selectedId }
                ]
            });

            if (parentDocument) {
                // Attempt to remove from nestedinmuebles
                const result1 = await db.collection('inmuebles').updateOne(
                    { id: parentDocument.id },
                    { $pull: { nestedinmuebles: { id: selectedId } } }
                );

                // Attempt to remove from nestedescaleras.nestedinmuebles
                const result2 = await db.collection('inmuebles').updateOne(
                    { id: parentDocument.id, "nestedescaleras.nestedinmuebles.id": selectedId },
                    { $pull: { "nestedescaleras.$.nestedinmuebles": { id: selectedId } } }
                );
                // Check if the nestedinmuebles array is empty after removing the selected inmueble
                const isNestedInmueblesEmpty = await db.collection('inmuebles').findOne({ id: parentDocument.id }, { projection: { nestedinmuebles: 1, "nestedescaleras.nestedinmuebles": 1 } });
                const nestedInmueblesEmpty = isNestedInmueblesEmpty.nestedinmuebles.length === 0 || isNestedInmueblesEmpty.nestedescaleras.every(n => n.nestedinmuebles.length === 0);

                // Update the response with the empty status and the parent document id and direccion
                if (nestedInmueblesEmpty) {
                    const parentEscalera = parentDocument.nestedescaleras.find(escalera => escalera.nestedinmuebles.some(inmueble => inmueble.id === selectedId));
                    if (parentEscalera) {
                        emptyParents.push({
                            id: parentEscalera.id,
                            direccion: parentEscalera.direccion
                        });
                    } else {
                        emptyParents.push({
                            id: parentDocument.id,
                            direccion: parentDocument.direccion
                        });
                    }
                }

            } else {
                console.log('No parent document found for selected ID:', selectedId);
            }

            // Also delete the selected inmueble from the main collection
            await db.collection('inmuebles').deleteOne({ id: selectedId });
        }


        // Step 3: Insert the selected inmuebles as individual documents
        for (const inmueble of nestedInmuebles) {
            await db.collection('inmuebles').insertOne(inmueble);
        }

        console.timeEnd("Ungroup Duration");

        return res.status(200).json({ status: 'success', empty: emptyParents.length > 0, emptyParents });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}