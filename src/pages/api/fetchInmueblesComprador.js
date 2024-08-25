import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { comprador_id } = req.query;

        if (!comprador_id) {
            return res.status(400).json({ message: 'Falta el ID del comprador' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Obtén la información del comprador
            const comprador = await db.collection('compradores').findOne({ _id: new ObjectId(comprador_id) });

            if (!comprador) {
                return res.status(404).json({ message: 'Comprador no encontrado' });
            }

            const { min, max } = comprador.rango_precios;

            console.log('comprador.rango_precios', comprador.rango_precios);
            console.log('comprador.interes', comprador.interes);

            // Busca en la colección encargos los inmuebles que coincidan con el rango de precios y el tipo de encargo
            const encargos = await db.collection('encargos').find({
                precio1: { $gte: min, $lte: max },
                tipo_encargo: comprador.interes  // Filtro adicional para coincidir con el interés del comprador
            }).toArray();

            console.log('encargos', encargos);

            let inmuebles = [];

            // Buscar la información de los inmuebles en las colecciones inmuebles
            for (let encargo of encargos) {
                let inmueble;

                console.log('encargo', typeof encargo.encargo_id, encargo.encargo_id);

                // Buscar en la colección inmuebles
                inmueble = await db.collection('inmuebles').findOne({ id: parseInt(encargo.encargo_id) });
                if (inmueble) {
                    inmuebles.push({
                        direccion: inmueble.direccion,
                        precio: encargo.precio1,
                        precio2: encargo.precio2,
                        superficie: inmueble.superficie,
                    });
                    continue; // Skip to the next encargo if found
                }

                // Buscar en la colección nestedinmuebles
                inmueble = await db.collection('nestedinmuebles').findOne({ id: parseInt(encargo.encargo_id) });
                if (inmueble) {
                    inmuebles.push({
                        direccion: inmueble.direccion,
                        precio: encargo.precio1,
                        precio2: encargo.precio2,
                        superficie: inmueble.superficie,
                    });
                    continue; // Skip to the next encargo if found
                }

                // Buscar en la colección nestedescaleras.nestedinmuebles
                inmueble = await db.collection('nestedescaleras.nestedinmuebles').findOne({ id: parseInt(encargo.encargo_id) });
                if (inmueble) {
                    inmuebles.push({
                        direccion: inmueble.direccion,
                        precio: encargo.precio1,
                        precio2: encargo.precio2,
                        superficie: inmueble.superficie,
                    });
                }
            }

            console.log('inmuebles', inmuebles);
            res.status(200).json(inmuebles);
        } catch (error) {
            console.error('Error fetching inmuebles for comprador:', error);
            res.status(500).json({ message: 'Error fetching inmuebles', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
