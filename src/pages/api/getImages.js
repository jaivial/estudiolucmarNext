import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { inmueble_id } = req.query;

        if (!inmueble_id) {
            return res.status(400).json({ status: 'error', message: 'Required parameter not set.' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');
            const images = await db.collection('inmueble_images').find({ inmueble_id: parseInt(inmueble_id) }).toArray();

            // Format image data
            const formattedImages = images.map(image => ({
                data: image.image_data.buffer.toString('base64'), // Convert binary data to base64
                type: image.image_type,
                id: image._id, // Use MongoDB's ObjectId as _id
                inmueble_id: image.inmueble_id
            }));

            res.status(200).json({ status: 'success', images: formattedImages });
        } catch (error) {
            console.error('Error fetching images:', error);
            res.status(500).json({ status: 'error', message: 'Internal server error.' });
        }
    } else {
        res.status(405).json({ status: 'error', message: 'Invalid request method.' });
    }
}
