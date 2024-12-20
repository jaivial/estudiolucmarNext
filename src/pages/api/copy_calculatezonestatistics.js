import cors, { runMiddleware } from '../../utils/cors';
// pages/api/calculateZoneStatistics.js

import clientPromise from '../../lib/mongodb';

// Function to check if a point is inside a polygon
function isPointInPolygon(point, polygon) {
    let inside = false;
    const x = point.lng;
    const y = point.lat;
    const numPoints = polygon.length;
    let j = numPoints - 1;

    for (let i = 0; i < numPoints; j = i++) {
        const xi = polygon[i].lng;
        const yi = polygon[i].lat;
        const xj = polygon[j].lng;
        const yj = polygon[j].lat;

        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) {
            inside = !inside;
        }
    }

    return inside;
}

async function checkBoundingBoxInZones(db) {
    const inmuebles = await db.collection('inmuebles').find({}).toArray();
    const zones = await db.collection('map_zones').find({}).toArray();

    if (inmuebles.length > 0 && zones.length > 0) {
        const inmueblesInZones = [];

        for (const inmueble of inmuebles) {
            const coordinates = inmueble.coordinates;

            if (coordinates && Array.isArray(coordinates) && (coordinates.length === 2 || coordinates.length === 4)) {
                if (coordinates.length === 2) {
                    // Single point case
                    const point = { lat: coordinates[0], lng: coordinates[1] };

                    for (const zone of zones) {
                        const latlngs = zone.latlngs[0]; // Assume latlngs[0] is a polygon
                        if (isPointInPolygon(point, latlngs)) {
                            inmueblesInZones.push({
                                inmueble_id: inmueble.id,
                                zone_id: zone.code_id,
                                zone_name: zone.zone_name,
                                zone_responsable: zone.zone_responsable,
                                noticiastate: inmueble.noticiastate,
                                encargoState: inmueble.encargoState,
                                categoria: inmueble.categoria,
                            });
                            break;
                        }
                    }
                } else {
                    // Bounding box case
                    const boundingBox = [
                        { lat: coordinates[0], lng: coordinates[2] }, // top-left
                        { lat: coordinates[0], lng: coordinates[3] }, // top-right
                        { lat: coordinates[1], lng: coordinates[2] }, // bottom-left
                        { lat: coordinates[1], lng: coordinates[3] }, // bottom-right
                    ];

                    for (const zone of zones) {
                        const latlngs = zone.latlngs[0]; // Assume latlngs[0] is a polygon
                        let inside = false;
                        for (const point of boundingBox) {
                            if (isPointInPolygon(point, latlngs)) {
                                inside = true;
                                break;
                            }
                        }
                        if (inside) {
                            inmueblesInZones.push({
                                inmueble_id: inmueble.id,
                                zone_id: zone.code_id,
                                zone_name: zone.zone_name,
                                zone_responsable: zone.zone_responsable,
                                noticiastate: inmueble.noticiastate,
                                encargoState: inmueble.encargoState,
                                categoria: inmueble.categoria,
                            });
                            break;
                        }
                    }
                }
            } else {
                console.error("Unexpected coordinates format or null:", coordinates);
            }
        }

        return inmueblesInZones;
    } else {
        return []; // Return empty array if no zones or inmuebles found
    }
}

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            // Call the function to check bounding boxes in zones
            const result = await checkBoundingBoxInZones(db);

            // Return the result as JSON
            res.status(200).json(result);
        } catch (error) {
            console.error('Error processing request:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
