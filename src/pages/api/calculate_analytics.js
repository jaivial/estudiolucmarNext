async function getFilteredCategoriesAndResponsiblesByAddress(db, pattern) {
    try {
        // Si pattern es una cadena vacía, no usamos regex para permitir coincidencias completas
        const regex = pattern ? new RegExp(pattern, 'i') : null;

        // Crear pipeline base
        const pipeline = [];

        if (pattern) {
            pipeline.push({
                $match: {
                    $or: [
                        {
                            $and: [
                                { tipoagrupacion: 2 },
                                {
                                    $or: [
                                        { 'nestedinmuebles.direccion': regex },
                                        { 'nestedescaleras.nestedinmuebles.direccion': regex }
                                    ]
                                }
                            ]
                        },
                        {
                            $and: [
                                { tipoagrupacion: 1 },
                                { 'direccion': regex }
                            ]
                        }
                    ]
                }
            });
        } else {
            // Si no hay patrón, buscar en todos los documentos de tipoagrupacion 1
            pipeline.push({
                $match: {
                    tipoagrupacion: 1
                }
            });
        }

        // Agrupar los resultados para obtener valores únicos de 'categoria' y 'responsable'
        pipeline.push({
            $group: {
                _id: null,
                categories: { $addToSet: '$categoria' },
                responsibles: { $addToSet: '$responsable' }
            }
        });

        // Ejecutar la agregación
        const result = await db.collection('inmuebles').aggregate(pipeline).toArray();

        const uniqueCategories = result.length ? result[0].categories : [];
        const uniqueResponsibles = result.length ? result[0].responsibles : [];

        console.log('uniqueCategories', uniqueCategories);
        console.log('uniqueResponsibles', uniqueResponsibles);

        // Devolver los resultados
        return {
            categories: uniqueCategories,
            responsibles: uniqueResponsibles
        };
    } catch (error) {
        console.error("Error al obtener categorías y responsables filtrados por dirección: ", error);
        throw error; // Manejo de errores
    }
}
