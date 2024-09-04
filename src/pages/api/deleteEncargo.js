// /pages/api/deleteEncargo.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        // Only allow DELETE requests
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { id } = req.query;


    // Validate ID
    if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({ success: false, message: 'ID must be a valid integer' });
    }

    try {
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('inmoprocrm');

        // Start a session for transaction
        const session = client.startSession();
        session.startTransaction();

        try {
            // Delete from 'encargos' collection
            const deleteResult = await db.collection('encargos').deleteOne({ encargo_id: parseInt(id, 10) }, { session });

            if (deleteResult.deletedCount === 0) {
                res.status(404).json({ success: false, message: 'Record not found' });
                await session.abortTransaction();
                session.endSession();
                return;
            }

            // Update 'inmuebles' collection
            await db.collection('inmuebles').updateOne(
                { id: parseInt(id, 10) },
                { $set: { encargostate: false } },
                { session }
            );

            // Update 'inmuebles' collection nested in 'nestedinmuebles'
            await db.collection('inmuebles').updateMany(
                { 'nestedinmuebles.id': parseInt(id, 10) },
                { $set: { 'nestedinmuebles.$.encargostate': false } },
                { session }
            );

            // Update 'inmuebles' collection nested in 'nestedescaleras.nestedinmuebles'
            await db.collection('inmuebles').updateMany(
                { 'nestedescaleras.nestedinmuebles.id': parseInt(id, 10) },
                { $set: { 'nestedescaleras.nestedinmuebles.$.encargostate': false } },
                { session }
            );

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({ success: true, message: 'Record deleted and encargoState updated successfully' });
        } catch (error) {
            // Abort transaction on error
            await session.abortTransaction();
            session.endSession();
            console.error('Error in transaction:', error);
            res.status(500).json({ error: 'Transaction failed: ' + error.message });
        }
    } catch (error) {
        console.error('Error connecting to database:', error);
        res.status(500).json({ error: 'Error connecting to database' });
    }
}
