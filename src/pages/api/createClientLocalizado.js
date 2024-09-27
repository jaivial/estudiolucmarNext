import cors, { runMiddleware } from '../../utils/cors';
import { v4 as uuidv4 } from 'uuid';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'POST') {
        try {
            const { nombre, apellido, telefono, dni, tipoDeCliente, inmuebleId, direccion } = req.body;
            const clienteData = {
                nombre,
                apellido,
                telefono,
                dni,
                tipo_de_cliente: tipoDeCliente,
                inmuebles_asociados_informador: [],
                inmuebles_asociados_propietario: [],
                inmuebles_asociados_copropietario: [],
                inmuebles_asociados_inquilino: [],
                inmueblesDetalle: [],
                client_id: uuidv4(),
            };

            console.log(nombre, apellido, telefono, dni, tipoDeCliente, inmuebleId, direccion);

            if (tipoDeCliente.includes('informador')) {
                clienteData.inmuebles_asociados_informador.push({ id: inmuebleId, direccion });
            }
            if (tipoDeCliente.includes('propietario')) {
                clienteData.inmuebles_asociados_propietario.push({ id: inmuebleId, direccion });
            }
            if (tipoDeCliente.includes('copropietario')) {
                clienteData.inmuebles_asociados_copropietario.push({ id: inmuebleId, direccion });
            }
            if (tipoDeCliente.includes('inquilino')) {
                clienteData.inmuebles_asociados_inquilino.push({ id: inmuebleId, direccion });
            }

            const client = await clientPromise;
            const db = client.db('inmoprocrm');
            const result = await db.collection('clientes').insertOne(clienteData);
            res.status(201).json({ message: 'Cliente creado con éxito', clienteId: result.insertedId });
        } catch (error) {
            console.error('Error al crear cliente:', error);
            res.status(500).json({ message: 'Error al crear cliente', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
