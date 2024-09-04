import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            const { inmuebleId } = req.body;
            console.log('inmuebleId', inmuebleId);

            if (!inmuebleId) {
                console.error('Inmueble ID is required');
                return res.status(400).json({ error: 'Inmueble ID is required' });
            }

            const result = await db.collection('dpv').deleteOne({ inmuebleId });

            if (result.deletedCount === 1) {
                // Update the 'inmuebles' collection after deleting from 'dpv'
                await db.collection('inmuebles').updateMany(
                    { id: inmuebleId }, // Filter by 'id' field
                    { $set: { DPV: false } } // Set 'DPV' field to false
                );
                await db.collection('inmuebles').updateMany(
                    { 'nestedInmuebles.id': inmuebleId }, // Filter by 'id' field
                    { $set: { 'nestedInmuebles.$.DPV': false } } // Set 'DPV' field to false
                );
                await db.collection('inmuebles').updateMany(
                    { 'nestedEscaleras.nestedInmuebles.id': inmuebleId }, // Filter by 'id' field
                    { $set: { 'nestedEscaleras.nestedInmuebles.$.DPV': false } } // Set 'DPV' field to false
                );
                res.status(200).json({ message: 'DPV deleted successfully' });
            } else {
                res.status(404).json({ error: 'DPV not found' });
            }
        } catch (error) {
            console.error('Error deleting DPV data:', error);
            res.status(500).json({ error: 'Failed to delete DPV data' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
