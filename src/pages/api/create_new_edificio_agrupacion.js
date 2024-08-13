import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, selectedInmuebles } = req.body;

    if (!name || !Array.isArray(selectedInmuebles) || selectedInmuebles.length === 0) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        console.time("Create Agrupacion Duration");

        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        // Step 1: Collect all existing IDs from inmuebles
        const allIds = await db.collection('inmuebles').aggregate([
            { $project: { id: 1, nestedinmuebles: 1, nestedescaleras: 1 } },
            { $unwind: { path: "$nestedinmuebles", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$nestedescaleras", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$nestedescaleras.nestedinmuebles", preserveNullAndEmptyArrays: true } },
            { $group: { _id: null, ids: { $addToSet: "$id" } } },
            { $project: { _id: 0, ids: 1 } }
        ]).toArray();

        const maxExistingId = Math.max(...allIds[0].ids, 0);

        // Generate a new agrupacion ID
        const agrupacionId = maxExistingId + 1;

        // Step 2: Insert the new agrupacion into inmuebles
        await db.collection('inmuebles').insertOne({
            id: agrupacionId,
            direccion: name,
            tipoagrupacion: 2,
            encargostate: false,
            nestedescaleras: [] // Add empty nestedescaleras array
        });

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

        // Step 5: Update the newly inserted record
        await db.collection('inmuebles').updateOne(
            { id: agrupacionId },
            {
                $set: {
                    coordinates,
                    superficie,
                    ano_construccion,
                    zona,
                    responsable,
                    encargostate
                }
            }
        );

        // Step 6: Collect full row data for selected inmuebles
        const nestedInmuebles = await db.collection('inmuebles').find({
            id: { $in: selectedInmuebles }
        }).toArray();

        // Step 7: Update the new agrupacion with the new nestedinmuebles array
        await db.collection('inmuebles').updateOne(
            { id: agrupacionId },
            { $set: { nestedinmuebles: nestedInmuebles } }
        );

        console.log('selectedInmuebles', selectedInmuebles);

        // Step 8: Delete items from inmuebles whose IDs are in selectedInmuebles array
        await db.collection('inmuebles').deleteMany({ id: { $in: selectedInmuebles } });

        console.timeEnd("Create Agrupacion Duration");

        return res.status(200).json({ status: 'success', agrupacionId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}