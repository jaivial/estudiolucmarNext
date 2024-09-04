import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { inmuebleId, telefono, client_id } = req.body;
            const parsedtelefono = parseInt(telefono);
            console.log('inmuebleId', inmuebleId);
            console.log('telefono', telefono);
            console.log('client_id', client_id);
            const client = await clientPromise;
            const db = client.db('inmoprocrm');
            // Update the main 'inmuebles' collection
            await db.collection('inmuebles').updateOne(
                { id: inmuebleId },
                {
                    $set: {
                        localizado: true,
                        localizado_phone: parsedtelefono,
                        client_id: client_id,
                    },
                }
            );
            // Update nestedinmuebles in 'inmuebles' collection
            await db.collection('inmuebles').updateMany(
                { 'nestedinmuebles.id': inmuebleId },
                {
                    $set: {
                        'nestedinmuebles.$.localizado': true,
                        'nestedinmuebles.$.localizado_phone': parsedtelefono,
                        'nestedinmuebles.$.client_id': client_id,
                    },
                }
            );
            // Update nestedinmuebles in 'inmuebles' collection
            await db.collection('inmuebles').updateMany(
                { 'nestedescaleras.nestedinmuebles.id': inmuebleId },
                {
                    $set: {
                        'nestedescaleras.nestedinmuebles.$.localizado': true,
                        'nestedescaleras.nestedinmuebles.$.localizado_phone': parsedtelefono,
                        'nestedescaleras.nestedinmuebles.$.client_id': client_id,
                    },
                }
            );
            res.status(200).json({ message: 'Teléfono localizado con éxito' });
        } catch (error) {
            console.error('Error al localizar teléfono:', error);
            res.status(500).json({ message: 'Error al localizar teléfono', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
