import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'GET') {
        const { inmueble_id } = req.query;
        console.log('inmueble_id', inmueble_id);

        if (!inmueble_id) {
            return res.status(400).json({ status: 'error', message: 'Required parameter not set.' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Fetch images using the correct method to handle the cursor
            const imagesCursor = db.collection('inmueble_images').find({ inmueble_id: parseInt(inmueble_id) });
            const images = await imagesCursor.toArray();

            // Check if images array is valid
            if (!Array.isArray(images)) {
                return res.status(500).json({ status: 'error', message: 'Error processing images data.' });
            }

            // Format image data
            const formattedImages = images.map(image => {
                if (image.image_data && image.image_data.$binary && image.image_data.$binary.base64) {
                    return {
                        data: image.image_data.$binary.base64, // Use base64 directly from the data structure
                        type: image.image_type,
                        id: image._id.toString(), // Convert MongoDB ObjectId to string
                        inmueble_id: image.inmueble_id
                    };
                } else {
                    console.error('Invalid image data:', image);
                    return null; // Handle cases where image data is missing or invalid
                }
            }).filter(image => image !== null); // Filter out any null values

            res.status(200).json({ status: 'success', images: formattedImages });
        } catch (error) {
            console.error('Error fetching images:', error.message);
            res.status(500).json({ status: 'error', message: 'Internal server error.' });
        }
    } else {
        res.status(405).json({ status: 'error', message: 'Invalid request method.' });
    }
}
