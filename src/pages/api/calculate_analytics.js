import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db('inmoprocrm'); // Use the correct database name

        const { pattern = '', selectedZone = '', selectedCategoria = '', selectedResponsable = '', filterNoticia = null, filterEncargo = null, superficieMin = 0, superficieMax = 20000, yearMin = 1800, yearMax = new Date().getFullYear(), localizado = null, garaje = null, aireacondicionado = null, ascensor = null, trastero = null, jardin = null, terraza = null, tipo, banos, habitaciones } = req.query;

        // Construir el objeto de consulta común
        const baseQuery = {
            $and: [
                { ano_construccion: { $gte: parseInt(yearMin, 10), $lte: parseInt(yearMax, 10) } },
                ...(selectedZone !== '' ? [{ zona: selectedZone }] : []),
                ...(selectedResponsable !== '' ? [{ responsable: selectedResponsable }] : []),
                ...(filterNoticia !== null ? [{ $or: [{ noticiastate: filterNoticia === 'true' ? true : false }, { noticiastate: { $exists: false } }] }] : []),
                ...(filterEncargo !== null ? [{ $or: [{ encargostate: filterEncargo === 'true' ? true : false }, { encargostate: { $exists: false } }] }] : []),
                ...(superficieMin !== null && superficieMax !== null ? [{ $or: [{ superficie: { $gte: parseInt(superficieMin, 10), $lte: parseInt(superficieMax, 10) } }, { superficie: { $exists: false } }] }] : []),
                ...(selectedCategoria !== '' ? [{ $or: [{ categoria: selectedCategoria === null ? { $exists: false } : selectedCategoria }, { categoria: { $exists: false } }] }] : []),
                ...(localizado !== null ? [{ $or: [{ localizado: localizado === 'true' ? true : false }, { localizado: { $exists: false } }] }] : []),
                ...(aireacondicionado !== 'undefined' ? [{ $or: [{ aireacondicionado: aireacondicionado === 'true' ? true : false }, { aireacondicionado: { $exists: false } }] }] : []),
                ...(ascensor !== 'undefined' ? [{ $or: [{ ascensor: ascensor === 'true' ? true : false }, { ascensor: { $exists: false } }] }] : []),
                ...(garaje !== 'undefined' ? [{ $or: [{ garaje: garaje === 'true' ? true : false }, { garaje: { $exists: false } }] }] : []),
                ...(trastero !== 'undefined' ? [{ $or: [{ trastero: trastero === 'true' ? true : false }, { trastero: { $exists: false } }] }] : []),
                ...(terraza !== 'undefined' ? [{ $or: [{ terraza: terraza === 'true' ? true : false }, { terraza: { $exists: false } }] }] : []),
                ...(jardin !== 'undefined' ? [{ $or: [{ jardin: jardin === 'true' ? true : false }, { jardin: { $exists: false } }] }] : []),
                ...(tipo !== 'undefined' ? [{ tipoagrupacion: parseInt(tipo, 10) }] : []),
                ...(habitaciones !== 'undefined' ? [{ $or: [{ habitaciones: parseInt(habitaciones, 10) }, { habitaciones: { $exists: false } }] }] : []),
                ...(banos !== 'undefined' ? [{ $or: [{ banyos: parseInt(banos, 10) }, { banyos: { $exists: false } }] }] : []),
            ]
        };

        // Agregación para documentos tipoagrupacion = 1 en la colección principal
        const aggregation1 = [
            { $match: { ...baseQuery, tipoagrupacion: 1, direccion: { $regex: pattern, $options: 'i' } } },
            {
                $group: {
                    _id: null,
                    totalTipoAgrupacionCount: { $sum: 1 },
                    responsablesCount: { $sum: { $cond: [{ $ifNull: ["$responsable", false] }, 1, 0] } },
                    categoriasCount: { $sum: { $cond: [{ $ifNull: ["$categoria", false] }, 1, 0] } },
                    localizadosCountTrue: { $sum: { $cond: [{ $eq: ["$localizado", true] }, 1, 0] } },
                    localizadosCountFalse: { $sum: { $cond: [{ $eq: ["$localizado", false] }, 1, 0] } },
                    noticiasCountTrue: { $sum: { $cond: [{ $eq: ["$noticiastate", true] }, 1, 0] } },
                    noticiasCountFalse: { $sum: { $cond: [{ $eq: ["$noticiastate", false] }, 1, 0] } },
                    encargosCountTrue: { $sum: { $cond: [{ $eq: ["$encargostate", true] }, 1, 0] } },
                    encargosCountFalse: { $sum: { $cond: [{ $eq: ["$encargostate", false] }, 1, 0] } },
                    zonasCount: { $sum: { $cond: [{ $ifNull: ["$zona", false] }, 1, 0] } }
                }
            }
        ];

        // Agregación para documentos tipoagrupacion = 2 en nestedinmuebles
        const aggregation2 = [
            { $match: { tipoagrupacion: 2 } },
            { $unwind: "$nestedinmuebles" },
            { $match: { "nestedinmuebles.direccion": { $regex: pattern, $options: 'i' }, ...baseQuery } },
            {
                $group: {
                    _id: null,
                    totalTipoAgrupacionCount: { $sum: 1 },
                    responsablesCount: { $sum: { $cond: [{ $ifNull: ["$nestedinmuebles.responsable", false] }, 1, 0] } },
                    categoriasCount: { $sum: { $cond: [{ $ifNull: ["$nestedinmuebles.categoria", false] }, 1, 0] } },
                    localizadosCountTrue: { $sum: { $cond: [{ $eq: ["$nestedinmuebles.localizado", true] }, 1, 0] } },
                    localizadosCountFalse: { $sum: { $cond: [{ $eq: ["$nestedinmuebles.localizado", false] }, 1, 0] } },
                    noticiasCountTrue: { $sum: { $cond: [{ $eq: ["$nestedinmuebles.noticiastate", true] }, 1, 0] } },
                    noticiasCountFalse: { $sum: { $cond: [{ $eq: ["$nestedinmuebles.noticiastate", false] }, 1, 0] } },
                    encargosCountTrue: { $sum: { $cond: [{ $eq: ["$nestedinmuebles.encargostate", true] }, 1, 0] } },
                    encargosCountFalse: { $sum: { $cond: [{ $eq: ["$nestedinmuebles.encargostate", false] }, 1, 0] } },
                    zonasCount: { $sum: { $cond: [{ $ifNull: ["$nestedinmuebles.zona", false] }, 1, 0] } }
                }
            }
        ];

        // Agregación para documentos tipoagrupacion = 2 en nestedescaleras.nestedinmuebles
        const aggregation3 = [
            { $match: { tipoagrupacion: 2 } },
            { $unwind: "$nestedescaleras" },
            { $unwind: "$nestedescaleras.nestedinmuebles" },
            { $match: { "nestedescaleras.nestedinmuebles.direccion": { $regex: pattern, $options: 'i' }, ...baseQuery } },
            {
                $group: {
                    _id: null,
                    totalTipoAgrupacionCount: { $sum: 1 },
                    responsablesCount: { $sum: { $cond: [{ $ifNull: ["$nestedescaleras.nestedinmuebles.responsable", false] }, 1, 0] } },
                    categoriasCount: { $sum: { $cond: [{ $ifNull: ["$nestedescaleras.nestedinmuebles.categoria", false] }, 1, 0] } },
                    localizadosCountTrue: { $sum: { $cond: [{ $eq: ["$nestedescaleras.nestedinmuebles.localizado", true] }, 1, 0] } },
                    localizadosCountFalse: { $sum: { $cond: [{ $eq: ["$nestedescaleras.nestedinmuebles.localizado", false] }, 1, 0] } },
                    noticiasCountTrue: { $sum: { $cond: [{ $eq: ["$nestedescaleras.nestedinmuebles.noticiastate", true] }, 1, 0] } },
                    noticiasCountFalse: { $sum: { $cond: [{ $eq: ["$nestedescaleras.nestedinmuebles.noticiastate", false] }, 1, 0] } },
                    encargosCountTrue: { $sum: { $cond: [{ $eq: ["$nestedescaleras.nestedinmuebles.encargostate", true] }, 1, 0] } },
                    encargosCountFalse: { $sum: { $cond: [{ $eq: ["$nestedescaleras.nestedinmuebles.encargostate", false] }, 1, 0] } },
                    zonasCount: { $sum: { $cond: [{ $ifNull: ["$nestedescaleras.nestedinmuebles.zona", false] }, 1, 0] } }
                }
            }
        ];

        // Ejecutar las agregaciones
        const result1 = await db.collection('inmuebles').aggregate(aggregation1).toArray();
        const result2 = await db.collection('inmuebles').aggregate(aggregation2).toArray();
        const result3 = await db.collection('inmuebles').aggregate(aggregation3).toArray();

        // Consolidar resultados
        const totalResult = {
            totalTipoAgrupacionCount: (result1[0]?.totalTipoAgrupacionCount || 0) + (result2[0]?.totalTipoAgrupacionCount || 0) + (result3[0]?.totalTipoAgrupacionCount || 0),
            responsablesCount: (result1[0]?.responsablesCount || 0) + (result2[0]?.responsablesCount || 0) + (result3[0]?.responsablesCount || 0),
            categoriasCount: (result1[0]?.categoriasCount || 0) + (result2[0]?.categoriasCount || 0) + (result3[0]?.categoriasCount || 0),
            localizadosCount: {
                true: (result1[0]?.localizadosCountTrue || 0) + (result2[0]?.localizadosCountTrue || 0) + (result3[0]?.localizadosCountTrue || 0),
                false: (result1[0]?.localizadosCountFalse || 0) + (result2[0]?.localizadosCountFalse || 0) + (result3[0]?.localizadosCountFalse || 0)
            },
            noticiasCount: {
                true: (result1[0]?.noticiasCountTrue || 0) + (result2[0]?.noticiasCountTrue || 0) + (result3[0]?.noticiasCountTrue || 0),
                false: (result1[0]?.noticiasCountFalse || 0) + (result2[0]?.noticiasCountFalse || 0) + (result3[0]?.noticiasCountFalse || 0)
            },
            encargosCount: {
                true: (result1[0]?.encargosCountTrue || 0) + (result2[0]?.encargosCountTrue || 0) + (result3[0]?.encargosCountTrue || 0),
                false: (result1[0]?.encargosCountFalse || 0) + (result2[0]?.encargosCountFalse || 0) + (result3[0]?.encargosCountFalse || 0)
            },
            zonasCount: (result1[0]?.zonasCount || 0) + (result2[0]?.zonasCount || 0) + (result3[0]?.zonasCount || 0)
        };

        res.status(200).json(totalResult);
    } catch (e) {
        console.error('API Error:', e.message, e.stack);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}
