import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    // Ejecuta el middleware CORS
    await runMiddleware(req, res, cors);

    if (req.method === 'POST') {
        try {
            const encargoFinalizado = req.body;

            // Conexión a la base de datos
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // INSERT NEW VENTA DATA
            // Convertir el asesorID a ObjectId para la consulta
            const asesorID = (encargoFinalizado.asesorID);

            // Buscamos el _id del asesor en la colección 'users' por el campo 'user_id'
            const user = await db.collection('users').findOne({
                user_id: asesorID
            });

            if (!user) {
                return res.status(404).json({ message: 'Asesor no encontrado' });
            }

            // Creamos un nuevo documento en la colección 'ventas'
            const ventaData = {
                ...encargoFinalizado,
                user_id: user._id, // Asignamos el _id del asesor encontrado
            };

            const result = await db.collection('ventas').insertOne(ventaData);

            // UPDATE THE STATE OF THE INMUEBLE
            // Use Promise.all to perform multiple deletions in parallel
            const encargoID = parseInt(encargoFinalizado.encargoID, 10);
            await Promise.all([
                db.collection('encargos').deleteMany({ encargo_id: encargoID }),
                db.collection('noticias').deleteMany({ noticia_id: encargoID })
            ]);

            // Find the inmueble directly by id
            const inmueble = await db.collection('inmuebles').findOne({ id: encargoID });

            if (inmueble) {
                // Update the fields if the inmueble is found
                await db.collection('inmuebles').updateOne(
                    { id: encargoID },
                    { $set: { noticiastate: false, encargostate: false } }
                );
            } else {
                // If not found, perform a search in nested arrays
                const query = { tipoagrupacion: 2 };
                const updateOperation = {
                    $set: { "nestedinmuebles.$[item].noticiastate": false, "nestedinmuebles.$[item].encargostate": false }
                };

                // Look for nestedinmuebles
                const result = await db.collection('inmuebles').updateOne(
                    query,
                    updateOperation,
                    { arrayFilters: [{ "item.id": encargoID }] }
                );

                if (result.matchedCount === 0) {
                    // If still not found, look into nestedescaleras.nestedinmuebles
                    await db.collection('inmuebles').updateOne(
                        query,
                        {
                            $set: {
                                "nestedescaleras.$[escalera].nestedinmuebles.$[item].noticiastate": false,
                                "nestedescaleras.$[escalera].nestedinmuebles.$[item].encargostate": false
                            }
                        },
                        {
                            arrayFilters: [
                                { "escalera.nestedinmuebles.id": encargoID },
                                { "item.id": encargoID }
                            ]
                        }
                    );
                }
            }


            // UPDATE PEDIDO STATE
            // Update the pedido to set 'pedido' to false
            if (encargoFinalizado.pedidoID) {
                await db.collection('clientes').updateOne(
                    { _id: new ObjectId(encargoFinalizado.pedidoID) },
                    { $set: { pedido: false } }
                );
            }

            // SET NEW ASSOCIATION OF CLIENT WHO BOUGHT THE INMUEBLE
            // If tipoEncargo === 'Venta', update inmuebles_asociados_propietario
            if (encargoFinalizado.tipoEncargo === 'Venta' && encargoFinalizado.inmuebleID && encargoFinalizado.direccionInmueble) {
                await db.collection('clientes').updateOne(
                    { _id: new ObjectId(encargoFinalizado.pedidoID) },
                    {
                        $push: {
                            inmuebles_asociados_propietario: {
                                id: encargoFinalizado.inmuebleID,
                                direccion: encargoFinalizado.direccionInmueble
                            }
                        }
                    }
                );
            }

            // If tipoEncargo === 'Venta', remove the inmueble from inmuebles_asociados_propietario
            if (encargoFinalizado.tipoEncargo === 'Venta' && encargoFinalizado.inmuebleID) {
                // Remove the inmueble from inmuebles_asociados_propietario for the client
                await db.collection('clientes').updateOne(
                    { _id: new ObjectId(encargoFinalizado.clienteID) },  // Match by clienteID
                    {
                        $pull: {
                            inmuebles_asociados_propietario: {
                                id: encargoFinalizado.inmuebleID  // Remove the inmueble with this ID
                            }
                        }
                    }
                );
            }



            res.status(200).json({ message: 'Encargo finalizado con éxito', ventaId: result.insertedId });
        } catch (error) {
            console.error('Error al finalizar encargo:', error);
            res.status(500).json({ message: 'Error al finalizar encargo', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
