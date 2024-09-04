import clientPromise from '../../lib/mongodb';
export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        try {
            const { id } = req.body;

            // Validate required fields
            if (!id) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            // Validate ID
            if (isNaN(Number(id))) {
                return res.status(400).json({ success: false, message: 'ID must be a valid integer' });
            }

            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            const result = await db.collection('noticias').deleteOne({ noticia_id: id });

            if (result.deletedCount === 0) {
                return res.status(404).json({ success: false, message: 'No document found with the provided ID' });
            }

            // Delete the corresponding document in the 'encargos' collection
            await db.collection('encargos').deleteOne({ encargo_id: id });

            // Update noticiastate and encargostate in 'inmuebles' collection
            await db.collection('inmuebles').updateOne({ id: id }, { $set: { noticiastate: false, encargostate: false } });

            // Update noticiastate and encargostate in 'inmuebles' nested 'nestedinmuebles' collection
            await db.collection('inmuebles').updateMany(
                { 'nestedinmuebles.id': id },
                { $set: { 'nestedinmuebles.$.noticiastate': false, 'nestedinmuebles.$.encargostate': false } }
            );

            // Update noticiastate and encargostate in 'inmuebles' nested 'nestedescaleras.nestedinmuebles' collection
            await db.collection('inmuebles').updateMany(
                { 'nestedescaleras.nestedinmuebles.id': id },
                { $set: { 'nestedescaleras.nestedinmuebles.$.noticiastate': false, 'nestedescaleras.nestedinmuebles.$.encargostate': false } }
            );

            res.status(200).json({ success: true, message: 'Record deleted successfully' });
        } catch (error) {
            console.error('Error deleting noticia:', error);
            res.status(500).json({ success: false, message: 'An error occurred while deleting the record' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
}
