import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';

// Function to calculate the size of the buffer in KB
function calculateFileSizeInKB(buffer) {
    return (buffer.length / 1024).toFixed(2); // Size in KB with two decimal places
}


export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        if (req.method === 'POST') {
            const { inmueble_id, images } = req.body;
            console.log('inmueble_id', inmueble_id);
            console.log('images', images);

            if (!Array.isArray(images) || images.length === 0) {
                return res.status(400).json({ status: 'error', message: 'No images provided.' });
            }

            const fileNames = [];

            for (const file of images) {
                // Verify that the image data exists
                if (!file.data || !file.mimetype) {
                    return res.status(400).json({ status: 'error', message: 'Invalid image data.' });
                }

                // Convert the image data to a Buffer
                const imageData = Buffer.from(file.data, 'base64');
                const imageType = file.mimetype;

                // Calculate and log the file size in KB
                const fileSizeInKB = calculateFileSizeInKB(imageData);
                console.log(`File size: ${fileSizeInKB} KB`);
                // Create document for MongoDB
                const imageDocument = {
                    _id: new ObjectId(),
                    inmueble_id: inmueble_id, // Assuming inmueble_id is a valid ObjectId
                    image_data: {
                        $binary: {
                            base64: imageData.toString('base64'),
                            subType: '00',
                        },
                    },
                    image_type: imageType,
                };

                // Insert the image metadata into MongoDB
                const result = await db.collection('inmueble_images').insertOne(imageDocument);
                fileNames.push(result.insertedId.toString());
            }

            res.status(200).json({
                status: 'success',
                message: `${images.length} images uploaded and saved successfully.`,
                fileNames: fileNames,
            });
        } else {
            res.status(405).json({ status: 'error', message: 'Method not allowed.' });
        }
    } catch (error) {
        console.error('Error processing images:', error.message);
        res.status(500).json({ status: 'error', message: `Error processing images: ${error.message}` });
    }
}
