import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, selectedInmuebles, grupo } = req.body;

    if (!name || !Array.isArray(selectedInmuebles) || selectedInmuebles.length === 0 || !grupo || !Number.isInteger(grupo)) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        // Step 1: Collect all existing IDs from inmuebles, including nested fields
        const allIds = await db.collection('inmuebles').aggregate([
            { $project: { id: 1, nestedinmuebles: 1, nestedescaleras: 1 } },
            { $unwind: { path: "$nestedinmuebles", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$nestedescaleras", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$nestedescaleras.nestedinmuebles", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: null,
                    ids: { $addToSet: "$id" },
                    nestedInmueblesIds: { $addToSet: "$nestedinmuebles.id" }, // Collect nestedinmuebles IDs
                    nestedEscalerasIds: { $addToSet: "$nestedescaleras.id" }, // Collect nestedescaleras IDs
                    nestedEscalerasNestedInmueblesIds: { $addToSet: "$nestedescaleras.nestedinmuebles.id" } // Collect nestedescaleras.nestedinmuebles IDs
                }
            },
            { $project: { _id: 0, ids: 1, nestedInmueblesIds: 1, nestedEscalerasIds: 1, nestedEscalerasNestedInmueblesIds: 1 } }
        ]).toArray();

        const maxExistingId = Math.max(
            ...allIds[0].ids,
            ...allIds[0].nestedInmueblesIds,
            ...allIds[0].nestedEscalerasIds,
            ...allIds[0].nestedEscalerasNestedInmueblesIds,
            0
        );
        // Generate a new agrupacion ID
        const agrupacionId = maxExistingId + 1;

        // Step 2: Insert the new agrupacion into the nestedescaleras array of the document with id equal to grupo
        await db.collection('inmuebles').updateOne(
            { id: grupo },
            {
                $push: { // Use $push to add the new agrupacion
                    nestedescaleras: { // Add to the nestedescaleras array
                        id: agrupacionId,
                        direccion: name,
                        tipoagrupacion: 3, // Ensure tipoagrupacion is set to 3
                        encargostate: false,
                        nestedinmuebles: [] // Initialize nestedinmuebles as an empty array
                    }
                }
            }
        );

        // Step 3: Get the first inmueble ID
        const firstInmuebleId = selectedInmuebles[0];

        // Step 4: Get the coordinates and other data of the first inmueble ID
        const firstInmueble = await db.collection('inmuebles').findOne({
            $or: [
                { id: firstInmuebleId },
                { "nestedinmuebles.id": firstInmuebleId },
                { "nestedescaleras.nestedinmuebles.id": firstInmuebleId }
            ]
        });

        if (!firstInmueble) {
            return res.status(400).json({ message: 'No coordinates found for the first inmueble ID' });
        }

        const { coordinates, superficie, ano_construccion, zona, responsable, encargostate } = firstInmueble;

        // Step 5: Update the newly inserted record with the first inmueble's data
        await db.collection('inmuebles').updateOne(
            { id: grupo, "nestedescaleras.id": agrupacionId },
            {
                $set: {
                    "nestedescaleras.$.coordinates": coordinates,
                    "nestedescaleras.$.superficie": superficie,
                    "nestedescaleras.$.ano_construccion": ano_construccion,
                    "nestedescaleras.$.zona": zona,
                    "nestedescaleras.$.responsable": responsable,
                    "nestedescaleras.$.encargostate": encargostate
                }
            }
        );

        // Step 6: Collect full row data for selected inmuebles
        const inmueblesData = await db.collection('inmuebles').find({
            id: { $in: selectedInmuebles }
        }).toArray();

        // Step 6.1: Collect full data for nested inmuebles
        const nestedInmuebles = [];
        for (const selectedId of selectedInmuebles) {
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

        // Step 6.2: Collect full data for nestedescaleras.nestedinmuebles
        const nestedEscalerasNestedInmuebles = [];
        for (const selectedId of selectedInmuebles) {
            // Check if the selected ID is in nestedescaleras.nestedinmuebles of any document
            const nestedEscalerasInmueble = await db.collection('inmuebles').findOne({
                "nestedescaleras.nestedinmuebles.id": selectedId
            });

            if (nestedEscalerasInmueble) {
                const fullNestedEscalerasInmueble = nestedEscalerasInmueble.nestedescaleras.find(n => n.nestedinmuebles.some(i => i.id === selectedId));
                if (fullNestedEscalerasInmueble) {
                    nestedEscalerasNestedInmuebles.push(...fullNestedEscalerasInmueble.nestedinmuebles.filter(i => i.id === selectedId));
                }
            }
        }

        // Step 8: Remove selected inmuebles from their original documents and delete from collection
        for (const selectedId of selectedInmuebles) {
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
            } else {
                console.log('No parent document found for selected ID:', selectedId);
            }

            // Also delete the selected inmueble from the main collection
            await db.collection('inmuebles').deleteOne({ id: selectedId });
        }


        // Step 7: Update the nestedescaleras field in the document where id matches grupo and nestedescaleras.id matches agrupacionId
        // Only proceed if nestedInmuebles is not empty
        if (nestedInmuebles.length > 0) {
            await db.collection('inmuebles').updateOne(
                { id: grupo, "nestedescaleras.id": agrupacionId },
                { $set: { "nestedescaleras.$.nestedinmuebles": nestedInmuebles } }
            );
        }

        return res.status(200).json({ status: 'success', agrupacionId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
