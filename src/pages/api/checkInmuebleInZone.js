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
function processNestedInmuebles(nestedInmuebles, zone, bulkOps) {

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
            processNestedInmuebles(nestedInmueble.nestedinmuebles, zone, bulkOps);
        }
    }

}

// Updated function to process nested escaleras
function processNestedEscaleras(nestedEscaleras, zone, bulkOps) {
    for (const nestedEscalera of nestedEscaleras) {
        const { coordinates, nestedinmuebles } = nestedEscalera;

        if (coordinates && Array.isArray(coordinates)) {
            let pointInZone = false;

            // Check if the point is in the polygon
            if (coordinates.length === 2) {
                const point = { lat: coordinates[0], lng: coordinates[1] };
                const polygon = zone.latlngs[0];
                if (isPointInPolygon(point, polygon)) {
                    pointInZone = true;
                }
            } else if (coordinates.length === 4) {
                const boundingBox = [
                    { lat: coordinates[0], lng: coordinates[2] },
                    { lat: coordinates[0], lng: coordinates[3] },
                    { lat: coordinates[1], lng: coordinates[2] },
                    { lat: coordinates[1], lng: coordinates[3] },
                ];

                const polygon = zone.latlngs[0];
                if (boundingBox.some(point => isPointInPolygon(point, polygon))) {
                    pointInZone = true;
                }
            }

            if (pointInZone) {
                // Set zona and responsable on nested escaleras
                bulkOps.find({ 'nestedescaleras.id': nestedEscalera.id }).updateOne({
                    $set: {
                        'nestedescaleras.$.zona': zone.zone_name,
                        'nestedescaleras.$.responsable': zone.zone_responsable
                    }
                });

                // Set zona and responsable on nestedinmuebles
                if (nestedinmuebles && nestedinmuebles.length > 0) {
                    bulkOps.find({ 'nestedescaleras.id': nestedEscalera.id }).updateOne({
                        $set: {
                            'nestedescaleras.$.nestedinmuebles': nestedinmuebles.map(inmueble => ({
                                ...inmueble,
                                zona: zone.zone_name,
                                responsable: zone.zone_responsable
                            }))
                        }
                    });
                }
            }
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
            const inmuebles = await db.collection('inmuebles').find({}, { projection: { id: 1, coordinates: 1, nestedinmuebles: 1, nestedescaleras: 1 } }).toArray();

            if (!inmuebles.length) {
                return res.status(200).json([]); // Return empty array if no inmuebles found
            }

            const inmueblesInZones = [];
            const inmueblesIdsInZones = new Set();
            const bulkOps = db.collection('inmuebles').initializeUnorderedBulkOp();

            for (const inmueble of inmuebles) {
                const { coordinates, nestedinmuebles, nestedescaleras } = inmueble;
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
                    processNestedInmuebles(nestedinmuebles, zone, bulkOps);
                }

                // Process nested escaleras if present
                if (nestedescaleras && Array.isArray(nestedescaleras)) {
                    processNestedEscaleras(nestedescaleras, zone, bulkOps);
                }

            }

            // Execute bulk operations
            if (bulkOps.length > 0) {
                await bulkOps.execute();
            }

            return res.status(200).json(inmueblesInZones);
        } catch (error) {
            console.error('Error processing request:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    return res.status(405).json({ message: 'Method not allowed' });
}
