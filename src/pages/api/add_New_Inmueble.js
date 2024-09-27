import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';


export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const {
        direccion,
        tipo,
        uso,
        ano_construccion,
        superficie,
        habitaciones,
        garaje,
        ascensor,
        banyos,
        trastero,
        jardin,
        terraza,
        aireacondicionado,
        coordinates,
        location,
        categoria
    } = req.body;

    if (!direccion || !tipo || !uso || !ano_construccion || !superficie || !coordinates || !location || !categoria) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        // Get the current date and time in the Madrid timezone
        // Get the current date and time in the Madrid timezone
        const currentDateTime = new Intl.DateTimeFormat('es-ES', {
            timeZone: 'Europe/Madrid',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(new Date());

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

        // Generate a new inmueble ID
        const newInmuebleId = maxExistingId + 1;

        // Step 2: Insert the new inmueble into inmuebles
        await db.collection('inmuebles').insertOne({
            id: newInmuebleId,
            direccion,
            tipo,
            uso,
            ano_construccion,
            superficie,
            habitaciones,
            garaje,
            ascensor,
            banyos,
            trastero,
            jardin,
            terraza,
            aireacondicionado,
            coordinates,
            location,
            categoria,
            noticiastate: false,
            encargostate: false,
            responsable: '',
            zona: '',
            date_time: currentDateTime,
            inmuebleimages: null,
            descripcion: '',
            tipoagrupacion: 1,
            localizado: false,
            localizado_phone: ''
        });

        return res.status(200).json({ status: 'success', newInmuebleId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}