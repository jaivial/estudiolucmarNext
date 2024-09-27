import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    const { clientInmuebleIds } = req.body;
    const client = await clientPromise;
    const db = client.db('inmoprocrm');

    // Búsqueda de inmuebles con tipoagrupacion = 1
    const inmuebles = await db.collection('inmuebles').aggregate([
        {
            $match: {
                tipoagrupacion: 1,
                id: { $in: clientInmuebleIds }
            }
        },
        {
            $project: {
                _id: 1,
                id: 1,  // Include the 'id' field
                direccion: 1,
                zona: 1,
                noticiastate: 1,
                encargostate: 1,
                superficie: 1
            }
        }
    ]).toArray();

    // Búsqueda en nestedinmuebles para tipoagrupacion = 2
    const nestedInmuebles = await db.collection('inmuebles').aggregate([
        {
            $match: {
                tipoagrupacion: 2,
                'nestedinmuebles.id': { $in: clientInmuebleIds }
            }
        },
        { $unwind: '$nestedinmuebles' },
        {
            $project: {
                _id: '$nestedinmuebles._id',
                id: '$nestedinmuebles.id',  // Include the 'id' field
                direccion: '$nestedinmuebles.direccion',
                zona: '$nestedinmuebles.zona',
                noticiastate: '$nestedinmuebles.noticiastate',
                encargostate: '$nestedinmuebles.encargostate',
                superficie: '$nestedinmuebles.superficie'
            }
        }
    ]).toArray();

    // Búsqueda en nestedescaleras.nestedinmuebles para tipoagrupacion = 2
    const nestedEscalerasInmuebles = await db.collection('inmuebles').aggregate([
        {
            $match: {
                tipoagrupacion: 2,
                'nestedescaleras.nestedinmuebles.id': { $in: clientInmuebleIds }
            }
        },
        { $unwind: '$nestedescaleras' },
        { $unwind: '$nestedescaleras.nestedinmuebles' },
        {
            $project: {
                _id: '$nestedescaleras.nestedinmuebles._id',
                id: '$nestedescaleras.nestedinmuebles.id',  // Include the 'id' field
                direccion: '$nestedescaleras.nestedinmuebles.direccion',
                zona: '$nestedescaleras.nestedinmuebles.zona',
                noticiastate: '$nestedescaleras.nestedinmuebles.noticiastate',
                encargostate: '$nestedescaleras.nestedinmuebles.encargostate',
                superficie: '$nestedescaleras.nestedinmuebles.superficie'
            }
        }
    ]).toArray();

    const results = [...inmuebles, ...nestedInmuebles, ...nestedEscalerasInmuebles];

    console.log('results', results);

    res.status(200).json(results);
}
