// Convertimos los valores de los filtros booleanos en nuevas variables
const filterNoticiaValue = filterNoticia === 'true' ? true : filterNoticia === 'false' ? false : null;
const filterEncargoValue = filterEncargo === 'true' ? true : filterEncargo === 'false' ? false : null;
const localizadoValue = localizado === 'true' ? true : localizado === 'false' ? false : null;
const aireacondicionadoValue = aireacondicionado === 'true' ? true : aireacondicionado === 'false' ? false : 'undefined';
const ascensorValue = ascensor === 'true' ? true : ascensor === 'false' ? false : 'undefined';
const garajeValue = garaje === 'true' ? true : garaje === 'false' ? false : 'undefined';
const trasteroValue = trastero === 'true' ? true : trastero === 'false' ? false : 'undefined';
const terrazaValue = terraza === 'true' ? true : terraza === 'false' ? false : 'undefined';
const jardinValue = jardin === 'true' ? true : jardin === 'false' ? false : 'undefined';

const result = await db.collection('inmuebles').aggregate([
    // Filtramos los documentos donde la dirección coincide con el patrón proporcionado
    {
        $match: {
            'direccion': {
                $regex: pattern,
                $options: 'i'
            }
        }
    },

    // Desenrollamos el array de nestedinmuebles para aplicar filtros a cada subdocumento
    {
        $unwind: {
            path: "$nestedinmuebles",
            preserveNullAndEmptyArrays: true
        }
    },

    // Aplicamos los filtros solicitados a los subdocumentos de nestedinmuebles
    {
        $match: {
            ...(selectedZone !== '' ? { "nestedinmuebles.zona": selectedZone } : {}),
            ...(selectedResponsable !== '' ? {
                $or: [
                    { "nestedinmuebles.responsable": selectedResponsable },
                    { "nestedinmuebles.responsable": { $exists: false } },
                    { "nestedinmuebles.responsable": null }
                ]
            } : {}),
            ...(filterNoticiaValue !== null ? {
                $or: [
                    { "nestedinmuebles.noticiastate": filterNoticiaValue },
                    { "nestedinmuebles.noticiastate": { $exists: false } },
                    { "nestedinmuebles.noticiastate": null }
                ]
            } : {}),
            ...(filterEncargoValue !== null ? {
                $or: [
                    { "nestedinmuebles.encargostate": filterEncargoValue },
                    { "nestedinmuebles.encargostate": { $exists: false } },
                    { "nestedinmuebles.encargostate": null }
                ]
            } : {}),
            ...(selectedCategoria !== '' ? { "nestedinmuebles.categoria": selectedCategoria } : {}),
            ...(localizadoValue !== null ? { "nestedinmuebles.localizado": localizadoValue } : {}),
            ...(aireacondicionadoValue !== 'undefined' ? { "nestedinmuebles.aireacondicionado": aireacondicionadoValue } : {}),
            ...(ascensorValue !== 'undefined' ? { "nestedinmuebles.ascensor": ascensorValue } : {}),
            ...(garajeValue !== 'undefined' ? { "nestedinmuebles.garaje": garajeValue } : {}),
            ...(trasteroValue !== 'undefined' ? { "nestedinmuebles.trastero": trasteroValue } : {}),
            ...(terrazaValue !== 'undefined' ? { "nestedinmuebles.terraza": terrazaValue } : {}),
            ...(jardinValue !== 'undefined' ? { "nestedinmuebles.jardin": jardinValue } : {}),
            ...(habitaciones !== 'undefined' ? { "nestedinmuebles.habitaciones": habitaciones } : {}),
            ...(banos !== 'undefined' ? { "nestedinmuebles.banyos": banos } : {})
        }
    },

    // Agrupamos los resultados por responsables, categorias, zonas, y los estados booleanos, contando el número de coincidencias
    {
        $group: {
            _id: null,
            responsables: {
                $push: "$nestedinmuebles.responsable"
            },
            categorias: {
                $push: "$nestedinmuebles.categoria"
            },
            zonas: {
                $push: "$nestedinmuebles.zona"
            },
            noticiastate: {
                $push: "$nestedinmuebles.noticiastate"
            },
            encargostate: {
                $push: "$nestedinmuebles.encargostate"
            },
            localizado: {
                $push: "$nestedinmuebles.localizado"
            },
            totalInmuebles: {
                $sum: 1
            }
        }
    },

    // Desenrollamos y contamos las ocurrencias de cada responsable, categoría, zona, y estados booleanos
    {
        $project: {
            responsables: {
                $arrayToObject: {
                    $map: {
                        input: { $setUnion: ["$responsables", []] }, // Eliminamos duplicados
                        as: "responsable",
                        in: {
                            k: "$$responsable",
                            v: {
                                $size: {
                                    $filter: {
                                        input: "$responsables",
                                        as: "r",
                                        cond: { $eq: ["$$r", "$$responsable"] }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            categorias: {
                $arrayToObject: {
                    $map: {
                        input: { $setUnion: ["$categorias", []] }, // Eliminamos duplicados
                        as: "categoria",
                        in: {
                            k: "$$categoria",
                            v: {
                                $size: {
                                    $filter: {
                                        input: "$categorias",
                                        as: "c",
                                        cond: { $eq: ["$$c", "$$categoria"] }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            zonas: {
                $arrayToObject: {
                    $map: {
                        input: { $setUnion: ["$zonas", []] }, // Eliminamos duplicados
                        as: "zona",
                        in: {
                            k: "$$zona",
                            v: {
                                $size: {
                                    $filter: {
                                        input: "$zonas",
                                        as: "z",
                                        cond: { $eq: ["$$z", "$$zona"] }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            noticiastate: {
                $arrayToObject: {
                    $map: {
                        input: [true, false],
                        as: "state",
                        in: {
                            k: { $toString: "$$state" }, // Clave: "true" o "false"
                            v: {
                                $size: {
                                    $filter: {
                                        input: "$noticiastate",
                                        as: "n",
                                        cond: { $eq: ["$$n", "$$state"] }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            encargostate: {
                $arrayToObject: {
                    $map: {
                        input: [true, false],
                        as: "state",
                        in: {
                            k: { $toString: "$$state" }, // Clave: "true" o "false"
                            v: {
                                $size: {
                                    $filter: {
                                        input: "$encargostate",
                                        as: "e",
                                        cond: { $eq: ["$$e", "$$state"] }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            localizado: {
                $arrayToObject: {
                    $map: {
                        input: [true, false],
                        as: "state",
                        in: {
                            k: { $toString: "$$state" }, // Clave: "true" o "false"
                            v: {
                                $size: {
                                    $filter: {
                                        input: "$localizado",
                                        as: "l",
                                        cond: { $eq: ["$$l", "$$state"] }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            totalInmuebles: 1
        }
    }
]).toArray();

console.log('analyticsResults', result);