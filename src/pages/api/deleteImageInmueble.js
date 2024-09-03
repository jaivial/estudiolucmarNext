import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            const { inmueble_id, image_id } = req.body;
            console.log('inmueble_id', inmueble_id);
            console.log('image_id', image_id);

            // Validate and sanitize input
            if (!ObjectId.isValid(inmueble_id) || !ObjectId.isValid(image_id)) {
                return res.status(400).json({ status: 'error', message: 'Invalid inmueble_id or image_id.' });
            }

            // Convert ids to ObjectId
            const imageObjectId = new ObjectId(image_id);

            // Prepare the MongoDB query to delete the image
            const result = await db.collection('inmueble_images').deleteOne({
                _id: imageObjectId,
                inmueble_id: inmueble_id,
            });

            if (result.deletedCount > 0) {
                // Image successfully deleted
                res.status(200).json({ status: 'success', message: 'Image deleted successfully.' });
            } else {
                // No document found with the given parameters
                res.status(404).json({ status: 'error', message: 'No image found to delete.' });
            }
        } catch (error) {
            console.error('Error deleting image:', error.message);
            res.status(500).json({ status: 'error', message: `Error deleting image: ${error.message}` });
        }
    } else {
        res.status(405).json({ status: 'error', message: 'Invalid request method.' });
    }
}
