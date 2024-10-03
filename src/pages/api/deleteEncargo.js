import cors, { runMiddleware } from '../../utils/cors';
// /pages/api/deleteEncargo.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method !== 'DELETE') {
        // Only allow DELETE requests
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { id } = req.query;

    console.log('id', id);

    try {
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Delete from 'encargos' collection
        const deleteResult = await db.collection('encargos').deleteOne({ encargo_id: parseInt(id, 10) });

        if (deleteResult.deletedCount === 0) {
            res.status(404).json({ success: false, message: 'Record not found' });
            return;
        }

        // Update 'inmuebles' collection
        await db.collection('inmuebles').updateOne(
            { id: parseInt(id, 10) },
            { $set: { encargostate: false } }
        );

        // Update 'inmuebles' collection nested in 'nestedinmuebles'
        await db.collection('inmuebles').updateMany(
            { 'nestedinmuebles.id': parseInt(id, 10) },
            { $set: { 'nestedinmuebles.$.encargostate': false } }
        );

        // Update 'inmuebles' collection nested in 'nestedescaleras.nestedinmuebles'
        await db.collection('inmuebles').updateMany(
            { 'nestedescaleras.nestedinmuebles.id': parseInt(id, 10) },
            { $set: { 'nestedescaleras.nestedinmuebles.$.encargostate': false } }
        );

        res.status(200).json({ success: true, message: 'Record deleted and encargoState updated successfully' });
    } catch (error) {
        console.error('Error in transaction:', error);
        res.status(500).json({ error: 'Transaction failed: ' + error.message });
    }
}
