import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { nombre, apellido, dni, email, telefono, interes, rango_precios } = req.body;

        console.log('Datos recibidos en la API:', req.body);

        // Validación básica
        if (!nombre || !apellido || !telefono || !interes || typeof rango_precios !== 'object' || typeof rango_precios.min !== 'number' || typeof rango_precios.max !== 'number') {
            console.error('Validación fallida:', {
                nombre: Boolean(nombre),
                apellido: Boolean(apellido),
                email: Boolean(email),
                telefono: Boolean(telefono),
                interes: Boolean(interes),
                rango_precios: typeof rango_precios === 'object' && typeof rango_precios.min === 'number' && typeof rango_precios.max === 'number'
            });
            return res.status(400).json({ message: 'Faltan campos obligatorios o el formato es incorrecto' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Inserta el nuevo comprador
            const result = await db.collection('compradores').insertOne({
                nombre,
                apellido,
                dni: dni || null,
                email,
                telefono, // Añadir el campo teléfono en la inserción
                interes,
                rango_precios,
                createdAt: new Date(),
            });

            // Recupera el documento recién insertado
            const newComprador = await db.collection('compradores').findOne({ _id: result.insertedId });
            console.log('Nuevo comprador:', newComprador);

            res.status(201).json(newComprador);
        } catch (error) {
            console.error('Error adding new comprador:', error);
            res.status(500).json({ message: 'Error al agregar el comprador', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
