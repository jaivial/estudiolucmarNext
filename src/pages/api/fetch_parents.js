import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        // Fetch inmuebles where tipoagrupacion = 2
        const edificios = await db.collection('inmuebles').aggregate([
            {
                $match: { tipoagrupacion: 2 },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    direccion: 1,
                },
            },
        ]).toArray();

        // Fetch id and direccion from nestedescaleras where tipoagrupacion = 3
        const escaleras = await db.collection('inmuebles').aggregate([
            {
                $unwind: "$nestedescaleras",
            },
            {
                $match: { "nestedescaleras.tipoagrupacion": 3 },
            },
            {
                $project: {
                    _id: 0,
                    id: "$nestedescaleras.id",
                    direccion: "$nestedescaleras.direccion",
                },
            },
        ]).toArray();

        // Return the result as a JSON object with two keys: edificios and escaleras
        res.status(200).json({ edificios, escaleras });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}