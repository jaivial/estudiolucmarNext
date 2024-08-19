/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/
use('inmoprocrm');

const pattern = 'mongo';
const selectedZone = '';  // Reemplaza con el valor real
const selectedResponsable = '';  // Reemplaza con el valor real
const filterNoticia = null;  // Reemplaza con el valor real ('true' o 'false')
const filterEncargo = null;  // Reemplaza con el valor real
const yearMin = 1800;  // Reemplaza con el valor real
const yearMax = 2024;  // Reemplaza con el valor real
const superficieMin = 0;  // Reemplaza con el valor real
const superficieMax = 2000;  // Reemplaza con el valor real
const selectedCategoria = '';  // Reemplaza con el valor real
const localizado = null;  // Reemplaza con el valor real
const aireacondicionado = 'undefined';  // Reemplaza con el valor real
const ascensor = 'undefined';  // Reemplaza con el valor real
const garaje = 'undefined';  // Reemplaza con el valor real
const trastero = 'undefined';  // Reemplaza con el valor real
const terraza = 'undefined';  // Reemplaza con el valor real
const jardin = 'undefined';  // Reemplaza con el valor real
const habitaciones = 'undefined';  // Reemplaza con el valor real (null o número entero)
const banos = 'undefined';  // Reemplaza con el valor real (null o número entero)


db.inmuebles.aggregate([
    {
        $match: {
            'direccion': { $regex: pattern, $options: 'i' }
        }
    },
    {
        $addFields: {
            topLevelCategoria: "$categoria",
            topLevelResponsable: "$responsable"
        }
    },
    {
        $unwind: {
            path: "$nestedinmuebles",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $unwind: {
            path: "$nestedescaleras",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $unwind: {
            path: "$nestedescaleras.nestedinmuebles",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $match: {
            $and: [
                {
                    $or: [
                        {
                            tipoagrupacion: 1,
                            ano_construccion: { $gte: yearMin, $lte: yearMax },
                            ...(selectedZone !== '' ? { zona: selectedZone } : {}),
                            ...(selectedResponsable !== '' ? { responsable: selectedResponsable } : {}),
                            ...(filterNoticia !== null ? { noticiastate: filterNoticia === 'true' } : {}),
                            ...(filterEncargo !== null ? { encargostate: filterEncargo === 'true' } : {}),
                            ...(superficieMin !== null && superficieMax !== null ? { superficie: { $gte: superficieMin, $lte: superficieMax } } : {}),
                            ...(selectedCategoria !== '' ? { categoria: selectedCategoria } : {}),
                            ...(localizado !== null ? { localizado: localizado === 'true' } : {}),
                            ...(aireacondicionado !== 'undefined' ? { aireacondicionado: aireacondicionado === 'true' } : {}),
                            ...(ascensor !== 'undefined' ? { ascensor: ascensor === 'true' } : {}),
                            ...(garaje !== 'undefined' ? { garaje: garaje === 'true' } : {}),
                            ...(trastero !== 'undefined' ? { trastero: trastero === 'true' } : {}),
                            ...(terraza !== 'undefined' ? { terraza: terraza === 'true' } : {}),
                            ...(jardin !== 'undefined' ? { jardin: jardin === 'true' } : {}),
                            ...(habitaciones !== 'undefined' ? { habitaciones: habitaciones } : {}),
                            ...(banos !== 'undefined' ? { banyos: banos } : {})
                        },
                        {
                            tipoagrupacion: 2,
                            "nestedinmuebles.ano_construccion": { $gte: yearMin, $lte: yearMax },
                            ...(selectedZone !== '' ? { "nestedinmuebles.zona": selectedZone } : {}),
                            ...(selectedResponsable !== '' ? { "nestedinmuebles.responsable": selectedResponsable } : {}),
                            ...(filterNoticia !== null ? { "nestedinmuebles.noticiastate": filterNoticia === 'true' } : {}),
                            ...(filterEncargo !== null ? { "nestedinmuebles.encargostate": filterEncargo === 'true' } : {}),
                            ...(superficieMin !== null && superficieMax !== null ? { "nestedinmuebles.superficie": { $gte: superficieMin, $lte: superficieMax } } : {}),
                            ...(selectedCategoria !== '' ? { "nestedinmuebles.categoria": selectedCategoria } : {}),
                            ...(localizado !== null ? { "nestedinmuebles.localizado": localizado === 'true' } : {}),
                            ...(aireacondicionado !== 'undefined' ? { "nestedinmuebles.aireacondicionado": aireacondicionado === 'true' } : {}),
                            ...(ascensor !== 'undefined' ? { "nestedinmuebles.ascensor": ascensor === 'true' } : {}),
                            ...(garaje !== 'undefined' ? { "nestedinmuebles.garaje": garaje === 'true' } : {}),
                            ...(trastero !== 'undefined' ? { "nestedinmuebles.trastero": trastero === 'true' } : {}),
                            ...(terraza !== 'undefined' ? { "nestedinmuebles.terraza": terraza === 'true' } : {}),
                            ...(jardin !== 'undefined' ? { "nestedinmuebles.jardin": jardin === 'true' } : {}),
                            ...(habitaciones !== 'undefined' ? { "nestedinmuebles.habitaciones": habitaciones } : {}),
                            ...(banos !== 'undefined' ? { "nestedinmuebles.banyos": banos } : {})
                        }
                    ]
                }
            ]
        }
    },
    {
        $facet: {
            responsables: [
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $ifNull: ["$nestedescaleras.nestedinmuebles.responsable", false] },
                                "$nestedescaleras.nestedinmuebles.responsable",
                                {
                                    $cond: [
                                        { $ifNull: ["$nestedinmuebles.responsable", false] },
                                        "$nestedinmuebles.responsable",
                                        "$topLevelResponsable"
                                    ]
                                }
                            ]
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        responsables: {
                            $push: {
                                k: { $ifNull: ["$_id", "Vacío"] },
                                v: "$count"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        responsables: { $arrayToObject: "$responsables" }
                    }
                }
            ],
            categorias: [
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $ifNull: ["$nestedescaleras.nestedinmuebles.categoria", false] },
                                "$nestedescaleras.nestedinmuebles.categoria",
                                {
                                    $cond: [
                                        { $ifNull: ["$nestedinmuebles.categoria", false] },
                                        "$nestedinmuebles.categoria",
                                        "$topLevelCategoria"
                                    ]
                                }
                            ]
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        categorias: {
                            $push: {
                                k: { $ifNull: ["$_id", "Vacío"] },
                                v: "$count"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        categorias: { $arrayToObject: "$categorias" }
                    }
                }
            ],
            noticiastate: [
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $ifNull: ["$nestedinmuebles.noticiastate", "$noticiastate"] },
                                { $ifNull: ["$nestedinmuebles.noticiastate", false] },
                                "$noticiastate"
                            ]
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        value: "$_id",
                        count: 1
                    }
                }
            ],
            encargostate: [
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $ifNull: ["$nestedinmuebles.encargostate", "$encargostate"] },
                                { $ifNull: ["$nestedinmuebles.encargostate", false] },
                                "$encargostate"
                            ]
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        value: "$_id",
                        count: 1
                    }
                }
            ],
            localizado: [
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $ifNull: ["$nestedinmuebles.localizado", "$localizado"] },
                                { $ifNull: ["$nestedinmuebles.localizado", false] },
                                "$localizado"
                            ]
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        value: "$_id",
                        count: 1
                    }
                }
            ],
            totalInmuebles: [
                {
                    $count: "total"
                }
            ]
        }
    },
    {
        $project: {
            _id: 0,
            responsables: { $first: "$responsables.responsables" },
            categorias: { $first: "$categorias.categorias" },
            noticiastate: "$noticiastate",
            encargostate: "$encargostate",
            localizado: "$localizado",
            totalInmuebles: { $arrayElemAt: ["$totalInmuebles.total", 0] }
        }
    }
]);
