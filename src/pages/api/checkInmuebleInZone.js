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
    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Fetch inmuebles and zones, projecting only the necessary fields
            const inmuebles = await db.collection('inmuebles').find({}, { projection: { id: 1, coordinates: 1 } }).toArray();
            const zones = await db.collection('map_zones').find({}, { projection: { code_id: 1, zone_name: 1, zone_responsable: 1, latlngs: 1 } }).toArray();

            if (!inmuebles.length || !zones.length) {
                return res.status(200).json([]); // Return empty array if no zones or inmuebles found
            }

            const inmueblesInZones = [];
            const inmueblesIdsInZones = new Set();

            // Determine which inmuebles are in which zones
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

                    for (const zone of zones) {
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
                            break;
                        }
                    }
                } else if (coordinates.length === 4) {
                    // Bounding box case
                    const boundingBox = [
                        { lat: coordinates[0], lng: coordinates[2] }, // top-left
                        { lat: coordinates[0], lng: coordinates[3] }, // top-right
                        { lat: coordinates[1], lng: coordinates[2] }, // bottom-left
                        { lat: coordinates[1], lng: coordinates[3] }, // bottom-right
                    ];

                    for (const zone of zones) {
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
                            break;
                        }
                    }
                } else {
                    console.error(`Unexpected coordinates format for inmueble: ${inmueble.id}`);
                }

                if (!pointInZone) {
                    inmueblesIdsInZones.add(inmueble.id);
                }
            }

            // Update inmuebles that are in zones
            if (inmueblesInZones.length > 0) {
                const bulkUpdateOps = inmueblesInZones.map(({ inmueble_id, zone_name, zone_responsable }) => ({
                    updateOne: {
                        filter: { id: inmueble_id },
                        update: { $set: { zona: zone_name, responsable: zone_responsable } },
                    }
                }));
                await db.collection('inmuebles').bulkWrite(bulkUpdateOps);
            }

            // Set zona and responsable to null for inmuebles not in zones
            const allInmuebleIds = inmuebles.map(inmueble => inmueble.id);
            const inmueblesNotInZones = allInmuebleIds.filter(id => !inmueblesIdsInZones.has(id));
            if (inmueblesNotInZones.length > 0) {
                await db.collection('inmuebles').updateMany(
                    { id: { $in: inmueblesNotInZones } },
                    { $set: { zona: null, responsable: null } }
                );
            }

            res.status(200).json(inmueblesInZones);
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
