import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

// Function to check if a point is inside a polygon
function isPointInPolygon(point, polygon) {
    const x = point.lng;
    const y = point.lat;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng, yi = polygon[i].lat;
        const xj = polygon[j].lng, yj = polygon[j].lat;

        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'POST') {
        const { codeID } = req.body;
        console.log('codeID', codeID);

        if (!codeID) {
            return res.status(400).json({ message: 'codeID is required' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Fetch the specific zone by zone_name
            const zone = await db.collection('map_zones').findOne(
                { code_id: codeID },
                { projection: { code_id: 1, zone_name: 1, zone_responsable: 1, latlngs: 1 } }
            );

            if (!zone) {
                return res.status(404).json({ message: 'Zone not found' });
            }

            // Fetch inmuebles, projecting only the necessary fields
            const inmuebles = await db.collection('inmuebles').find({}, { projection: { id: 1, coordinates: 1 } }).toArray();

            if (!inmuebles.length) {
                return res.status(200).json([]); // Return empty array if no inmuebles found
            }

            const inmueblesInZones = [];
            const inmueblesIdsInZones = new Set();
            console.time('Check if point is in zone');
            // Determine which inmuebles are in the specified zone
            for (const inmueble of inmuebles) {
                const { coordinates } = inmueble;

                if (!coordinates || !Array.isArray(coordinates)) {
                    console.error(`Invalid or missing coordinates for inmueble: ${inmueble.id}`);
                    continue;
                }

                let pointInZone = false;

                if (coordinates.length === 2) {
                    // Single point case
                    const point = { lat: coordinates[0], lng: coordinates[1] };

                    const polygon = zone.latlngs[0]; // Assume latlngs[0] is a polygon
                    if (isPointInPolygon(point, polygon)) {
                        inmueblesInZones.push({
                            inmueble_id: inmueble.id,
                            zone_id: zone.code_id,
                            zone_name: zone.zone_name,
                            zone_responsable: zone.zone_responsable,
                        });
                        inmueblesIdsInZones.add(inmueble.id);
                        pointInZone = true;
                    }
                } else if (coordinates.length === 4) {
                    // Bounding box case
                    const boundingBox = [
                        { lat: coordinates[0], lng: coordinates[2] }, // top-left
                        { lat: coordinates[0], lng: coordinates[3] }, // top-right
                        { lat: coordinates[1], lng: coordinates[2] }, // bottom-left
                        { lat: coordinates[1], lng: coordinates[3] }, // bottom-right
                    ];

                    const polygon = zone.latlngs[0]; // Assume latlngs[0] is a polygon
                    if (boundingBox.some(point => isPointInPolygon(point, polygon))) {
                        inmueblesInZones.push({
                            inmueble_id: inmueble.id,
                            zone_id: zone.code_id,
                            zone_name: zone.zone_name,
                            zone_responsable: zone.zone_responsable,
                        });
                        inmueblesIdsInZones.add(inmueble.id);
                        pointInZone = true;
                    }
                } else {
                    console.error(`Unexpected coordinates format for inmueble: ${inmueble.id}`);
                }


                if (!pointInZone) {
                    inmueblesIdsInZones.add(inmueble.id);
                }
            }
            console.timeEnd('Check if point is in zone');
            console.time('Bulk update inmuebles');
            // Update inmuebles that are in the specified zone
            if (inmueblesInZones.length > 0) {
                // Use unordered bulk operations for performance improvement
                const bulkOps = db.collection('inmuebles').initializeUnorderedBulkOp();
                inmueblesInZones.forEach(({ inmueble_id, zone_name, zone_responsable }) => {
                    bulkOps.find({ id: inmueble_id }).updateOne({
                        $set: { zona: zone_name, responsable: zone_responsable }
                    });
                });
                await bulkOps.execute(); // Execute all the operations as a single batch
            }
            console.timeEnd('Bulk update inmuebles');


            console.time('Set zona and responsable to null for inmuebles not in the specified zone');
            // Set zona and responsable to null for inmuebles not in the specified zone
            const allInmuebleIds = inmuebles.map(inmueble => inmueble.id);
            const inmueblesNotInZones = allInmuebleIds.filter(id => !inmueblesIdsInZones.has(id));
            if (inmueblesNotInZones.length > 0) {
                await db.collection('inmuebles').updateMany(
                    { id: { $in: inmueblesNotInZones } },
                    { $set: { zona: null, responsable: null } }
                );
            }
            console.timeEnd('Set zona and responsable to null for inmuebles not in the specified zone');
            const responsePayload = inmueblesInZones;
            res.setHeader('Content-Length', Buffer.byteLength(JSON.stringify(responsePayload)));
            res.status(200).json(inmueblesInZones);
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
