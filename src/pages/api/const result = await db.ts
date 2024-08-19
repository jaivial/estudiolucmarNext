  const result = await db.collection('inmuebles').aggregate([
            { $match: { 'direccion': { $regex: pattern, $options: 'i' } } },
            { $addFields: { topLevelCategoria: "$categoria", topLevelResponsable: "$responsable" } },
            { $unwind: { path: "$nestedinmuebles", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$nestedescaleras", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$nestedescaleras.nestedinmuebles", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    noticiastate: {
                        $cond: {
                            if: { $ifNull: ["$nestedescaleras.nestedinmuebles.noticiastate", false] },
                            then: "$nestedescaleras.nestedinmuebles.noticiastate",
                            else: {
                                $cond: {
                                    if: { $ifNull: ["$nestedinmuebles.noticiastate", false] },
                                    then: "$nestedinmuebles.noticiastate",
                                    else: "$noticiastate"
                                }
                            }
                        }
                    },
                    encargostate: {
                        $cond: {
                            if: { $ifNull: ["$nestedescaleras.nestedinmuebles.encargostate", false] },
                            then: "$nestedescaleras.nestedinmuebles.encargostate",
                            else: {
                                $cond: {
                                    if: { $ifNull: ["$nestedinmuebles.encargostate", false] },
                                    then: "$nestedinmuebles.encargostate",
                                    else: "$encargostate"
                                }
                            }
                        }
                    },
                    localizado: {
                        $cond: {
                            if: { $ifNull: ["$nestedescaleras.nestedinmuebles.localizado", false] },
                            then: "$nestedescaleras.nestedinmuebles.localizado",
                            else: {
                                $cond: {
                                    if: { $ifNull: ["$nestedinmuebles.localizado", false] },
                                    then: "$nestedinmuebles.localizado",
                                    else: "$localizado"
                                }
                            }
                        }
                    }
                }
            },
            {
                $match: {
                    $and: [
                        {
                            $or: [
                                {
                                    tipoagrupacion: 1,
                                    ...(selectedZone !== '' ? { zona: selectedZone } : {}),
                                    ...(selectedResponsable !== '' ? { $or: [{ responsable: selectedResponsable }, { responsable: { $exists: false } }, { responsable: null }] } : {}),
                                    ...(filterNoticia !== null ? { $or: [{ noticiastate: filterNoticia === 'true' }, { noticiastate: { $exists: false } }, { noticiastate: null }] } : {}),
                                    ...(filterEncargo !== null ? { $or: [{ encargostate: filterEncargo === 'true' }, { encargostate: { $exists: false } }, { encargostate: null }] } : {}),
                                    ...(localizado !== null ? { localizado: localizado === 'true' } : {}),
                                    ...(selectedCategoria !== '' ? { categoria: selectedCategoria } : {}),
                                    ...(aireacondicionado !== 'undefined' ? { aireacondicionado: aireacondicionado === 'true' } : {}),
                                    ...(ascensor !== 'undefined' ? { ascensor: ascensor === 'true' } : {}),
                                    ...(garaje !== 'undefined' ? { garaje: garaje === 'true' } : {}),
                                    ...(trastero !== 'undefined' ? { trastero: trastero === 'true' } : {}),
                                    ...(terraza !== 'undefined' ? { terraza: terraza === 'true' } : {}),
                                    ...(jardin !== 'undefined' ? { jardin: jardin === 'true' } : {}),
                                    ...(habitaciones !== 'undefined' ? { habitaciones } : {}),
                                    ...(banos !== 'undefined' ? { banyos: banos } : {})
                                },
                                {
                                    ...(selectedZone !== '' ? { "nestedinmuebles.zona": selectedZone } : {}),
                                    ...(selectedResponsable !== '' ? { $or: [{ "nestedinmuebles.responsable": selectedResponsable }, { "nestedinmuebles.responsable": { $exists: false } }, { "nestedinmuebles.responsable": null }] } : {}),
                                    ...(filterNoticia !== null ? { $or: [{ "nestedinmuebles.noticiastate": filterNoticia === 'true' }, { "nestedinmuebles.noticiastate": { $exists: false } }, { "nestedinmuebles.noticiastate": null }] } : {}),
                                    ...(filterEncargo !== null ? { $or: [{ "nestedinmuebles.encargostate": filterEncargo === 'true' }, { "nestedinmuebles.encargostate": { $exists: false } }, { "nestedinmuebles.encargostate": null }] } : {}),
                                    ...(selectedCategoria !== '' ? { "nestedinmuebles.categoria": selectedCategoria } : {}),
                                    ...(localizado !== null ? { "nestedinmuebles.localizado": localizado === 'true' } : {}),
                                    ...(aireacondicionado !== 'undefined' ? { "nestedinmuebles.aireacondicionado": aireacondicionado === 'true' } : {}),
                                    ...(ascensor !== 'undefined' ? { "nestedinmuebles.ascensor": ascensor === 'true' } : {}),
                                    ...(garaje !== 'undefined' ? { "nestedinmuebles.garaje": garaje === 'true' } : {}),
                                    ...(trastero !== 'undefined' ? { "nestedinmuebles.trastero": trastero === 'true' } : {}),
                                    ...(terraza !== 'undefined' ? { "nestedinmuebles.terraza": terraza === 'true' } : {}),
                                    ...(jardin !== 'undefined' ? { "nestedinmuebles.jardin": jardin === 'true' } : {}),
                                    ...(habitaciones !== 'undefined' ? { "nestedinmuebles.habitaciones": habitaciones } : {}),
                                    ...(banos !== 'undefined' ? { "nestedinmuebles.banyos": banos } : {}),

                                    // Aplicar filtros también en nestedescaleras.nestedinmuebles
                                    ...(selectedZone !== '' ? { "nestedescaleras.nestedinmuebles.zona": selectedZone } : {}),
                                    ...(selectedResponsable !== '' ? { $or: [{ "nestedescaleras.nestedinmuebles.responsable": selectedResponsable }, { "nestedescaleras.nestedinmuebles.responsable": { $exists: false } }, { "nestedescaleras.nestedinmuebles.responsable": null }] } : {}),
                                    ...(filterNoticia !== null ? { $or: [{ "nestedescaleras.nestedinmuebles.noticiastate": filterNoticia === 'true' }, { "nestedescaleras.nestedinmuebles.noticiastate": { $exists: false } }, { "nestedescaleras.nestedinmuebles.noticiastate": null }] } : {}),
                                    ...(filterEncargo !== null ? { $or: [{ "nestedescaleras.nestedinmuebles.encargostate": filterEncargo === 'true' }, { "nestedescaleras.nestedinmuebles.encargostate": { $exists: false } }, { "nestedescaleras.nestedinmuebles.encargostate": null }] } : {}),
                                    ...(selectedCategoria !== '' ? { "nestedescaleras.nestedinmuebles.categoria": selectedCategoria } : {}),
                                    ...(localizado !== null ? { "nestedescaleras.nestedinmuebles.localizado": localizado === 'true' } : {}),
                                    ...(aireacondicionado !== 'undefined' ? { "nestedescaleras.nestedinmuebles.aireacondicionado": aireacondicionado === 'true' } : {}),
                                    ...(ascensor !== 'undefined' ? { "nestedescaleras.nestedinmuebles.ascensor": ascensor === 'true' } : {}),
                                    ...(garaje !== 'undefined' ? { "nestedescaleras.nestedinmuebles.garaje": garaje === 'true' } : {}),
                                    ...(trastero !== 'undefined' ? { "nestedescaleras.nestedinmuebles.trastero": trastero === 'true' } : {}),
                                    ...(terraza !== 'undefined' ? { "nestedescaleras.nestedinmuebles.terraza": terraza === 'true' } : {}),
                                    ...(jardin !== 'undefined' ? { "nestedescaleras.nestedinmuebles.jardin": jardin === 'true' } : {}),
                                    ...(habitaciones !== 'undefined' ? { "nestedescaleras.nestedinmuebles.habitaciones": habitaciones } : {}),
                                    ...(banos !== 'undefined' ? { "nestedescaleras.nestedinmuebles.banyos": banos } : {})
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
                                        {
                                            $cond: [
                                                { $or: [{ $eq: ["$nestedescaleras.nestedinmuebles.responsable", ""] }, { $eq: ["$nestedescaleras.nestedinmuebles.responsable", "NULL"] }] },
                                                "NULL",
                                                "$nestedescaleras.nestedinmuebles.responsable"
                                            ]
                                        },
                                        {
                                            $cond: [
                                                { $ifNull: ["$nestedinmuebles.responsable", false] },
                                                {
                                                    $cond: [
                                                        { $or: [{ $eq: ["$nestedinmuebles.responsable", ""] }, { $eq: ["$nestedinmuebles.responsable", "NULL"] }] },
                                                        "NULL",
                                                        "$nestedinmuebles.responsable"
                                                    ]
                                                },
                                                {
                                                    $cond: [
                                                        { $or: [{ $eq: ["$topLevelResponsable", ""] }, { $eq: ["$topLevelResponsable", "NULL"] }] },
                                                        "NULL",
                                                        "$topLevelResponsable"
                                                    ]
                                                }
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
                                        k: { $ifNull: ["$_id", "NULL"] },
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
                                        {
                                            $cond: [
                                                {
                                                    $or: [
                                                        { $eq: ["$nestedescaleras.nestedinmuebles.categoria", null] },
                                                        { $eq: ["$nestedescaleras.nestedinmuebles.categoria", "NULL"] }
                                                    ]
                                                },
                                                "Sin categoría",
                                                "$nestedescaleras.nestedinmuebles.categoria"
                                            ]
                                        },
                                        {
                                            $cond: [
                                                { $ifNull: ["$nestedinmuebles.categoria", false] },
                                                {
                                                    $cond: [
                                                        {
                                                            $or: [
                                                                { $eq: ["$nestedinmuebles.categoria", null] },
                                                                { $eq: ["$nestedinmuebles.categoria", "NULL"] }
                                                            ]
                                                        },
                                                        "Sin categoría",
                                                        "$nestedinmuebles.categoria"
                                                    ]
                                                },
                                                {
                                                    $cond: [
                                                        {
                                                            $or: [
                                                                { $eq: ["$topLevelCategoria", null] },
                                                                { $eq: ["$topLevelCategoria", "NULL"] }
                                                            ]
                                                        },
                                                        "Sin categoría",
                                                        "$topLevelCategoria"
                                                    ]
                                                }
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
                                        k: { $ifNull: ["$_id", "Sin categoría"] },
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

                    zonas: [
                        {
                            $group: {
                                _id: {
                                    $cond: [
                                        { $ifNull: ["$nestedescaleras.nestedinmuebles.zona", false] },
                                        {
                                            $cond: [
                                                { $or: [{ $eq: ["$nestedescaleras.nestedinmuebles.zona", ""] }, { $eq: ["$nestedescaleras.nestedinmuebles.zona", "NULL"] }] },
                                                "NULL",
                                                "$nestedescaleras.nestedinmuebles.zona"
                                            ]
                                        },
                                        {
                                            $cond: [
                                                { $ifNull: ["$nestedinmuebles.zona", false] },
                                                {
                                                    $cond: [
                                                        { $or: [{ $eq: ["$nestedinmuebles.zona", ""] }, { $eq: ["$nestedinmuebles.zona", "NULL"] }] },
                                                        "NULL",
                                                        "$nestedinmuebles.zona"
                                                    ]
                                                },
                                                {
                                                    $cond: [
                                                        { $or: [{ $eq: ["$zona", ""] }, { $eq: ["$zona", "NULL"] }] },
                                                        "NULL",
                                                        "$zona"
                                                    ]
                                                }
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
                                zonas: {
                                    $push: {
                                        k: { $ifNull: ["$_id", "NULL"] },
                                        v: "$count"
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                zonas: { $arrayToObject: "$zonas" }
                            }
                        }
                    ],


                    noticiastate: [
                        {
                            $group: {
                                _id: "$noticiastate",
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
                                _id: "$encargostate",
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
                                _id: "$localizado",
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
                    zonas: { $first: "$zonas.zonas" },
                    noticiastate: "$noticiastate",
                    encargostate: "$encargostate",
                    localizado: "$localizado",
                    totalInmuebles: { $arrayElemAt: ["$totalInmuebles.total", 0] }
                }
            }
        ]).toArray();

        console.log('analyticsResults', result);
