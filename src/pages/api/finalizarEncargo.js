import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    // Ejecuta el middleware CORS
    await runMiddleware(req, res, cors);

    if (req.method === 'POST') {
        try {
            const encargoFinalizado = req.body;

            console.log(encargoFinalizado);

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
                // Update the fields if the inmueble is found at the top level
                await db.collection('inmuebles').updateOne(
                    { id: encargoID },
                    { $set: { noticiastate: false, encargostate: false } }
                );
            } else {
                // If not found, perform a search in nestedinmuebles
                let result = await db.collection('inmuebles').updateOne(
                    { "nestedinmuebles.id": encargoID },  // Query where nestedinmuebles contains encargoID
                    {
                        $set: {
                            "nestedinmuebles.$[item].noticiastate": false,
                            "nestedinmuebles.$[item].encargostate": false
                        }
                    },
                    {
                        arrayFilters: [{ "item.id": encargoID }]  // Filter to match the item with encargoID
                    }
                );

                // If not found in nestedinmuebles, look in nestedescaleras.nestedinmuebles
                if (result.matchedCount === 0) {
                    result = await db.collection('inmuebles').updateOne(
                        { "nestedescaleras.nestedinmuebles.id": encargoID },  // Query where nestedinmuebles inside nestedescaleras contains encargoID
                        {
                            $set: {
                                "nestedescaleras.$[escalera].nestedinmuebles.$[item].noticiastate": false,
                                "nestedescaleras.$[escalera].nestedinmuebles.$[item].encargostate": false
                            }
                        },
                        {
                            arrayFilters: [
                                { "escalera.nestedinmuebles.id": encargoID },  // Filter to match the escalera's nestedinmuebles
                                { "item.id": encargoID }  // Filter to match the nestedinmueble with encargoID
                            ]
                        }
                    );
                }

                // If no match found in either case, handle the error or fallback logic
                if (result.matchedCount === 0) {
                    // Handle the case where no document or nested document was found
                    return res.status(404).json({ message: 'Inmueble not found in nested arrays' });
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
                await db.collection('clientes').updateMany(
                    {
                        _id: { $ne: new ObjectId(encargoFinalizado.pedidoID) }  // Exclude the current tenant by pedidoID
                    },
                    {
                        $pull: {
                            inmuebles_asociados_propietario: {
                                id: encargoFinalizado.inmuebleID  // Remove the inmueble from any other inquilino arrays
                            }
                        }
                    }
                );

            }



            // Handle case when tipoEncargo === 'Alquiler'
            if (encargoFinalizado.tipoEncargo === 'Alquiler' && encargoFinalizado.inmuebleID && encargoFinalizado.direccionInmueble) {

                // 1. For the client with _id === encargoFinalizado.pedidoID (tenant):
                await db.collection('clientes').updateOne(
                    { _id: new ObjectId(encargoFinalizado.pedidoID) },  // Match by pedidoID
                    {
                        // Pull from inmuebles_asociados_propietario if the inmueble exists
                        $pull: {
                            inmuebles_asociados_propietario: {
                                id: encargoFinalizado.inmuebleID  // Remove the inmueble from propietario array if it exists
                            }
                        }
                    }
                );

                // Add the inmueble to inmuebles_asociados_inquilino (tenant's list)
                await db.collection('clientes').updateOne(
                    { _id: new ObjectId(encargoFinalizado.pedidoID) },  // Match by pedidoID
                    {
                        // Push the inmueble into the inmuebles_asociados_inquilino array
                        $push: {
                            inmuebles_asociados_inquilino: {
                                id: encargoFinalizado.inmuebleID,           // Add inmuebleID
                                direccion: encargoFinalizado.direccionInmueble // Add the address
                            }
                        }
                    }
                );

                // 2. For the client with _id === encargoFinalizado.clienteID (owner):
                await db.collection('clientes').updateOne(
                    { _id: new ObjectId(encargoFinalizado.clienteID) },  // Match by clienteID (owner)
                    {
                        // Pull from inmuebles_asociados_inquilino if the inmueble exists
                        $pull: {
                            inmuebles_asociados_inquilino: {
                                id: encargoFinalizado.inmuebleID  // Remove the inmueble from inquilino array if it exists
                            }
                        }
                    }
                );
                // 3. Pull from inmuebles_asociados_inquilino on ALL OTHER DOCUMENTS
                // This ensures only one tenant is associated with the property
                await db.collection('clientes').updateMany(
                    {
                        _id: { $ne: new ObjectId(encargoFinalizado.pedidoID) }  // Exclude the current tenant by pedidoID
                    },
                    {
                        $pull: {
                            inmuebles_asociados_inquilino: {
                                id: encargoFinalizado.inmuebleID  // Remove the inmueble from any other inquilino arrays
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
