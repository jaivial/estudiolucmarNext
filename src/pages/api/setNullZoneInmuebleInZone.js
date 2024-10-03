import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    // Run CORS middleware
    await runMiddleware(req, res, cors);

    if (req.method === 'POST') {
        const { codeID } = req.query;

        if (!codeID) {
            return res.status(400).json({ message: 'codeID is required' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Fetch the zone with the given code_id
            const zone = await db.collection('map_zones').findOne(
                { code_id: codeID },
                { projection: { zone_name: 1 } }
            );

            if (!zone) {
                return res.status(404).json({ message: 'Zone not found' });
            }

            const zoneName = zone.zone_name;

            // Update inmuebles
            const resultInmuebles = await db.collection('inmuebles').updateMany(
                { zona: zoneName },
                { $set: { zona: null } }
            );

            // Update nestedinmuebles within inmuebles
            const resultNestedInmuebles = await db.collection('inmuebles').updateMany(
                { 'nestedinmuebles.zona': zoneName },
                { $set: { 'nestedinmuebles.$[elem].zona': null } },
                { arrayFilters: [{ 'elem.zona': zoneName }] }
            );

            // Update nestedescaleras.nestedinmuebles within inmuebles
            const resultNestedEscaleras = await db.collection('inmuebles').updateMany(
                { 'nestedescaleras.nestedinmuebles.zona': zoneName },
                { $set: { 'nestedescaleras.$[outer].nestedinmuebles.$[inner].zona': null } },
                { arrayFilters: [{ 'outer.nestedinmuebles.zona': zoneName }, { 'inner.zona': zoneName }] }
            );

            res.status(200).json({
                message: 'Inmuebles updated successfully',
                matchedCount: resultInmuebles.matchedCount,
                modifiedCount: resultInmuebles.modifiedCount,
                matchedCountNestedInmuebles: resultNestedInmuebles.matchedCount,
                modifiedCountNestedInmuebles: resultNestedInmuebles.modifiedCount,
                matchedCountNestedEscaleras: resultNestedEscaleras.matchedCount,
                modifiedCountNestedEscaleras: resultNestedEscaleras.modifiedCount,
            });
        } catch (error) {
            console.error('Error updating zones:', error);
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
