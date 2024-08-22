// /pages/api/fetch_inmuebles_agregar_cliente.js

import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { searchTerm } = req.query;

        if (!searchTerm) {
            return res.status(400).json({ message: 'Falta el término de búsqueda' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Búsqueda de inmuebles con tipoagrupacion = 1
            const inmuebles = await db.collection('inmuebles').aggregate([
                {
                    $match: {
                        tipoagrupacion: 1,
                        direccion: { $regex: searchTerm, $options: 'i' }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        direccion: 1,
                        id: 1
                    }
                },
                { $limit: 5 }
            ]).toArray();

            // Búsqueda en nestedinmuebles para tipoagrupacion = 2
            const nestedInmuebles = await db.collection('inmuebles').aggregate([
                {
                    $match: {
                        tipoagrupacion: 2,
                        'nestedinmuebles.direccion': { $regex: searchTerm, $options: 'i' }
                    }
                },
                { $unwind: '$nestedinmuebles' },
                {
                    $match: {
                        'nestedinmuebles.direccion': { $regex: searchTerm, $options: 'i' }
                    }
                },
                {
                    $project: {
                        _id: '$nestedinmuebles._id',
                        direccion: '$nestedinmuebles.direccion',
                        id: '$nestedinmuebles.id'
                    }
                },
                { $limit: 5 }
            ]).toArray();

            // Búsqueda en nestedescaleras.nestedinmuebles para tipoagrupacion = 2
            const nestedEscalerasInmuebles = await db.collection('inmuebles').aggregate([
                {
                    $match: {
                        tipoagrupacion: 2,
                        'nestedescaleras.nestedinmuebles.direccion': { $regex: searchTerm, $options: 'i' }
                    }
                },
                { $unwind: '$nestedescaleras' },
                { $unwind: '$nestedescaleras.nestedinmuebles' },
                {
                    $match: {
                        'nestedescaleras.nestedinmuebles.direccion': { $regex: searchTerm, $options: 'i' }
                    }
                },
                {
                    $project: {
                        _id: '$nestedescaleras.nestedinmuebles._id',
                        direccion: '$nestedescaleras.nestedinmuebles.direccion',
                        id: '$nestedescaleras.nestedinmuebles.id'
                    }
                },
                { $limit: 5 }
            ]).toArray();

            const results = [...inmuebles, ...nestedInmuebles, ...nestedEscalerasInmuebles];

            res.status(200).json(results);
        } catch (error) {
            console.error('Error al obtener inmuebles:', error);
            res.status(500).json({ message: 'Error al obtener inmuebles', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
