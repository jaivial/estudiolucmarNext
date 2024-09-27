import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm'); // Use the correct database name

            // Fetch clients from the 'clientes' collection
            const clientesCollection = db.collection('clientes');
            const clientes = await clientesCollection.find({}, { projection: { nombre: 1, apellido: 1, telefono: 1 } }).toArray();

            // Map the results to the format required by the frontend
            const options = clientes.map(cliente => ({
                label: `${cliente.nombre} ${cliente.apellido} - ${cliente.telefono}`,
                value: cliente.telefono
            }));

            // Send the formatted data as JSON
            res.status(200).json(options);
        } catch (error) {
            console.error('Error fetching client phone numbers:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
