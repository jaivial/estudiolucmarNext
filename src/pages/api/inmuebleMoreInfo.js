import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            // Get the 'id' from the query parameters
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ message: 'ID is required' });
            }

            // Fetch the 'inmuebles' collection
            const inmueble = await db.collection('inmuebles').findOne({ id: parseInt(id) });

            if (!inmueble) {
                return res.status(404).json({ message: 'Inmueble not found' });
            }

            // Fetch the 'comentarios' collection
            const comentarios = await db.collection('comentarios').find({ comentario_id: parseInt(id) }).toArray();

            // Calculate dataUpdateTime based on the date_time of the comments
            let dataUpdateTime = 'red'; // Default to 'red' if there are no comments
            if (comentarios.length > 0) {
                const mostRecentComment = comentarios.reduce((latest, comment) => {
                    return new Date(comment.date_time) > new Date(latest.date_time) ? comment : latest;
                }, comentarios[0]);

                const mostRecentDate = new Date(mostRecentComment.date_time);
                const currentDate = new Date();
                const daysPassed = Math.floor((currentDate - mostRecentDate) / (1000 * 60 * 60 * 24));

                if (daysPassed > 90) {
                    dataUpdateTime = 'red';
                } else if (daysPassed > 30) {
                    dataUpdateTime = 'yellow';
                } else {
                    dataUpdateTime = 'green';
                }
            }

            // Combine data into a single object
            const data = {
                inmueble,
                comentarios,
                dataUpdateTime
            };

            // Return the data as a JSON response
            res.status(200).json(data);

        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
