import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        // Fetch all zones
        const zones = await db.collection('map_zones').distinct('zone_name');

        // Fetch all responsables
        const responsables = await db.collection('users').aggregate([
            {
                $project: {
                    nombre: 1,
                    apellido: 1,
                    nombre_completo: { $concat: ['$nombre', ' ', '$apellido'] }
                }
            }
        ]).toArray();

        // Fetch all categorias, replace NULL with 'Sin Información'
        const categorias = await db.collection('inmuebles').aggregate([
            {
                $group: {
                    _id: { $ifNull: ['$categoria', 'Sin Información'] }
                }
            },
            {
                $project: {
                    categoria: '$_id',
                    _id: 0
                }
            }
        ]).toArray();

        // Combine results
        const result = {
            zones: zones,
            responsables: responsables,
            categorias: categorias.map(c => c.categoria)
        };

        // Send the result as a JSON response
        res.status(200).json(result);
    } catch (error) {
        // Handle errors
        res.status(500).json({ error: 'Internal Server Error' });
    }
}