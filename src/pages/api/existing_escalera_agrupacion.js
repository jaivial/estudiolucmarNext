import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { type, inmuebles, existingGroup } = req.body;

    if (!type || !Array.isArray(inmuebles) || inmuebles.length === 0 || !existingGroup) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        console.time("Existing Escalera Agrupacion Duration");

        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        // Step 1: Collect full row data for selected inmuebles
        const inmueblesData = await db.collection('inmuebles').find({
            id: { $in: inmuebles }
        }).toArray();

        // Step 2: Collect full data for nested inmuebles
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
                    // If not found in nestedinmuebles, check in the main collection
                    const fullInmueble = inmueblesData.find(i => i.id === selectedId);
                    if (fullInmueble) {
                        nestedInmuebles.push(fullInmueble);
                    }
                }
            }
        }

        // Step 4: Remove selected inmuebles from their original documents and delete from collection
        for (const selectedId of inmuebles) {
            // Check if the selected ID is in nestedinmuebles or nestedescaleras.nestedinmuebles of any document
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
            } else {
                console.log('No parent document found for selected ID:', selectedId);
            }

            // Also delete the selected inmueble from the main collection
            await db.collection('inmuebles').deleteOne({ id: selectedId });
        }

        // Step 3: Update the existing agrupacion with the new nestedinmuebles array
        console.log('Updating existing agrupacion:', existingGroup);
        console.log('Nested inmuebles to add:', nestedInmuebles);

        for (const nestedInmueble of nestedInmuebles) {
            console.log('Pushing nestedInmueble:', nestedInmueble);
            const updateResult = await db.collection('inmuebles').updateOne(
                { "nestedescaleras.id": existingGroup }, // Update the nestedescaleras object with the existingGroup ID
                { $push: { "nestedescaleras.$.nestedinmuebles": nestedInmueble } } // Push to the nestedinmuebles array within the matching nestedescaleras object
            );
            console.log('Update result for nestedInmueble:', nestedInmueble.id, updateResult);
        }

        // Verify the update by retrieving the updated document
        const updatedDocument = await db.collection('inmuebles').findOne({ "nestedescaleras.id": existingGroup });
        console.log('Updated document:', updatedDocument);

        console.timeEnd("Existing Escalera Agrupacion Duration");

        return res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}