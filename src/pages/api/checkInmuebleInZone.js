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

// Recursive function to process nested inmuebles
function processNestedInmuebles(nestedInmuebles, zone, inmueble, bulkOps) {
    for (const nestedInmueble of nestedInmuebles) {
        const { coordinates } = nestedInmueble;

        if (coordinates && Array.isArray(coordinates)) {
            let pointInZone = false;

            if (coordinates.length === 2) {
                // Single point case
                const point = { lat: coordinates[0], lng: coordinates[1] };
                const polygon = zone.latlngs[0]; // Assume latlngs[0] is a polygon
                if (isPointInPolygon(point, polygon)) {
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
                    pointInZone = true;
                }
            }

            if (pointInZone) {
                // Set zona and responsable on nested inmueble
                bulkOps.find({ 'nestedinmuebles.id': nestedInmueble.id }).updateOne({
                    $set: {
                        'nestedinmuebles.$.zona': zone.zone_name,
                        'nestedinmuebles.$.responsable': zone.zone_responsable
                    }
                });
            }
        }

        // If the nestedInmueble has further nestedInmuebles, process them recursively
        if (nestedInmueble.nestedinmuebles && Array.isArray(nestedInmueble.nestedinmuebles)) {
            processNestedInmuebles(nestedInmueble.nestedinmuebles, zone, inmueble, bulkOps);
        }
    }
}

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    if (req.method === 'POST') {
        const { codeID } = req.body;

        if (!codeID) {
            return res.status(400).json({ message: 'codeID is required' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Fetch the specific zone by code_id
            const zone = await db.collection('map_zones').findOne(
                { code_id: codeID },
                { projection: { code_id: 1, zone_name: 1, zone_responsable: 1, latlngs: 1 } }
            );

            if (!zone) {
                return res.status(404).json({ message: 'Zone not found' });
            }

            // Fetch inmuebles, projecting only the necessary fields including nested inmuebles
            const inmuebles = await db.collection('inmuebles').find({}, { projection: { id: 1, coordinates: 1, nestedinmuebles: 1 } }).toArray();

            if (!inmuebles.length) {
                return res.status(200).json([]); // Return empty array if no inmuebles found
            }

            const inmueblesInZones = [];
            const inmueblesIdsInZones = new Set();
            const bulkOps = db.collection('inmuebles').initializeUnorderedBulkOp();

            for (const inmueble of inmuebles) {
                const { coordinates, nestedinmuebles } = inmueble;
                let pointInZone = false;

                if (coordinates && Array.isArray(coordinates)) {
                    if (coordinates.length === 2) {
                        // Single point case
                        const point = { lat: coordinates[0], lng: coordinates[1] };

                        const polygon = zone.latlngs[0]; // Assume latlngs[0] is a polygon
                        if (isPointInPolygon(point, polygon)) {
                            pointInZone = true;
                            inmueblesInZones.push({
                                inmueble_id: inmueble.id,
                                zone_id: zone.code_id,
                                zone_name: zone.zone_name,
                                zone_responsable: zone.zone_responsable,
                            });
                            inmueblesIdsInZones.add(inmueble.id);
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
                            pointInZone = true;
                            inmueblesInZones.push({
                                inmueble_id: inmueble.id,
                                zone_id: zone.code_id,
                                zone_name: zone.zone_name,
                                zone_responsable: zone.zone_responsable,
                            });
                            inmueblesIdsInZones.add(inmueble.id);
                        }
                    }

                    if (pointInZone) {
                        bulkOps.find({ id: inmueble.id }).updateOne({
                            $set: { zona: zone.zone_name, responsable: zone.zone_responsable }
                        });
                    }
                }

                // Process nested inmuebles if present
                if (nestedinmuebles && Array.isArray(nestedinmuebles)) {
                    processNestedInmuebles(nestedinmuebles, zone, inmueble, bulkOps);
                }
            }

            // Execute bulk operations
            if (inmueblesInZones.length > 0) {
                await bulkOps.execute();
            }

            // Set zona and responsable to null for inmuebles not in the specified zone
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
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
