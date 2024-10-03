import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';


export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);


    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const coordinatesNumber = req.body.coordinates.map(Number); // Convert to numbers



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

    // Function to check if a point is inside a polygon
    const isPointInPolygon = (point, polygon) => {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];

            const intersect = ((yi > point[1]) !== (yj > point[1]) &&
                (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi));
            if (intersect) inside = !inside;
        }
        return inside;
    };







    if (!direccion || !tipo || !uso || !ano_construccion || !superficie || !coordinates || !location || !categoria) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name
        // Step: Check if coordinates are within any map zone
        const mapZones = await db.collection('map_zones').find().toArray();
        let matchedZone = null;
        for (const zone of mapZones) {
            // Assuming there's only one array inside latlngs for each zone
            const polygon = zone.latlngs[0].map(p => [p.lng, p.lat]); // Convert to [lng, lat] format
            const point = [coordinatesNumber[1], coordinatesNumber[0]]; // [lng, lat]

            console.log('Checking zone:', zone);
            console.log('Polygon Points:', polygon);
            console.log('Point to check:', point);

            if (isPointInPolygon(point, polygon)) {
                matchedZone = zone; // Store the matched zone
                console.log('matchedZone', matchedZone);
                break; // Exit loop if a match is found
            }
        }


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
            responsable: matchedZone ? matchedZone.zone_responsable : '',
            zona: matchedZone ? matchedZone.zone_name : '',
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