import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {

  // Run CORS middleware
  await runMiddleware(req, res, cors);


    if (req.method === 'GET') {
        const { zoneName } = req.query;

        if (!zoneName) {
            return res.status(400).json({ message: 'zoneName is required' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Fetch statistics for the specific zone
            const zoneStatistics = await db.collection('map_zones').aggregate([
                { $match: { zone_name: zoneName } },
                {
                    $lookup: {
                        from: 'inmuebles',
                        localField: 'zone_name',
                        foreignField: 'zona',
                        as: 'inmuebles'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        zone_name: 1,
                        zone_responsable: 1,
                        totalInmuebles: { $size: { $ifNull: ['$inmuebles', []] } },
                        // Count states within the primary inmuebles
                        noticiaState1: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.noticiastate', '1'] }
                                }
                            }
                        },
                        noticiaState0: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.noticiastate', '0'] }
                                }
                            }
                        },
                        encargoState1: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.encargoState', '1'] }
                                }
                            }
                        },
                        encargoState0: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.encargoState', '0'] }
                                }
                            }
                        },
                        categoriaInquilino: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.categoria', 'Inquilino'] }
                                }
                            }
                        },
                        categoriaVacio: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.categoria', 'Vacio'] }
                                }
                            }
                        },
                        categoriaPropietario: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.categoria', 'Propietario'] }
                                }
                            }
                        },
                        categoriaNull: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.categoria', null] }
                                }
                            }
                        },

                        // Count states within nested inmuebles
                        nestedNoticiaState1: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $size: {
                                            $filter: {
                                                input: { $ifNull: ['$$inmueble.nestedinmuebles', []] },
                                                as: 'nested',
                                                cond: { $eq: ['$$nested.noticiastate', '1'] }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        nestedNoticiaState0: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $size: {
                                            $filter: {
                                                input: { $ifNull: ['$$inmueble.nestedinmuebles', []] },
                                                as: 'nested',
                                                cond: { $eq: ['$$nested.noticiastate', '0'] }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        nestedEncargoState1: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $size: {
                                            $filter: {
                                                input: { $ifNull: ['$$inmueble.nestedinmuebles', []] },
                                                as: 'nested',
                                                cond: { $eq: ['$$nested.encargoState', '1'] }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        nestedEncargoState0: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $size: {
                                            $filter: {
                                                input: { $ifNull: ['$$inmueble.nestedinmuebles', []] },
                                                as: 'nested',
                                                cond: { $eq: ['$$nested.encargoState', '0'] }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        nestedCategoriaInquilino: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $size: {
                                            $filter: {
                                                input: { $ifNull: ['$$inmueble.nestedinmuebles', []] },
                                                as: 'nested',
                                                cond: { $eq: ['$$nested.categoria', 'Inquilino'] }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        nestedCategoriaVacio: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $size: {
                                            $filter: {
                                                input: { $ifNull: ['$$inmueble.nestedinmuebles', []] },
                                                as: 'nested',
                                                cond: { $eq: ['$$nested.categoria', 'Vacio'] }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        nestedCategoriaPropietario: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $size: {
                                            $filter: {
                                                input: { $ifNull: ['$$inmueble.nestedinmuebles', []] },
                                                as: 'nested',
                                                cond: { $eq: ['$$nested.categoria', 'Propietario'] }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        nestedCategoriaNull: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $size: {
                                            $filter: {
                                                input: { $ifNull: ['$$inmueble.nestedinmuebles', []] },
                                                as: 'nested',
                                                cond: { $eq: ['$$nested.categoria', null] }
                                            }
                                        }
                                    }
                                }
                            }
                        },

                        // Count states within nested escalera nested inmuebles
                        escaleraNestedNoticiaState1: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $sum: {
                                            $map: {
                                                input: { $ifNull: ['$$inmueble.nestedescaleras', []] },
                                                as: 'escalera',
                                                in: {
                                                    $size: {
                                                        $filter: {
                                                            input: { $ifNull: ['$$escalera.nestedinmuebles', []] },
                                                            as: 'nested',
                                                            cond: { $eq: ['$$nested.noticiastate', '1'] }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        escaleraNestedNoticiaState0: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $sum: {
                                            $map: {
                                                input: { $ifNull: ['$$inmueble.nestedescaleras', []] },
                                                as: 'escalera',
                                                in: {
                                                    $size: {
                                                        $filter: {
                                                            input: { $ifNull: ['$$escalera.nestedinmuebles', []] },
                                                            as: 'nested',
                                                            cond: { $eq: ['$$nested.noticiastate', '0'] }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        escaleraNestedEncargoState1: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $sum: {
                                            $map: {
                                                input: { $ifNull: ['$$inmueble.nestedescaleras', []] },
                                                as: 'escalera',
                                                in: {
                                                    $size: {
                                                        $filter: {
                                                            input: { $ifNull: ['$$escalera.nestedinmuebles', []] },
                                                            as: 'nested',
                                                            cond: { $eq: ['$$nested.encargoState', '1'] }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        escaleraNestedEncargoState0: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $sum: {
                                            $map: {
                                                input: { $ifNull: ['$$inmueble.nestedescaleras', []] },
                                                as: 'escalera',
                                                in: {
                                                    $size: {
                                                        $filter: {
                                                            input: { $ifNull: ['$$escalera.nestedinmuebles', []] },
                                                            as: 'nested',
                                                            cond: { $eq: ['$$nested.encargoState', '0'] }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        escaleraNestedCategoriaInquilino: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $sum: {
                                            $map: {
                                                input: { $ifNull: ['$$inmueble.nestedescaleras', []] },
                                                as: 'escalera',
                                                in: {
                                                    $size: {
                                                        $filter: {
                                                            input: { $ifNull: ['$$escalera.nestedinmuebles', []] },
                                                            as: 'nested',
                                                            cond: { $eq: ['$$nested.categoria', 'Inquilino'] }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        escaleraNestedCategoriaVacio: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $sum: {
                                            $map: {
                                                input: { $ifNull: ['$$inmueble.nestedescaleras', []] },
                                                as: 'escalera',
                                                in: {
                                                    $size: {
                                                        $filter: {
                                                            input: { $ifNull: ['$$escalera.nestedinmuebles', []] },
                                                            as: 'nested',
                                                            cond: { $eq: ['$$nested.categoria', 'Vacio'] }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        escaleraNestedCategoriaPropietario: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $sum: {
                                            $map: {
                                                input: { $ifNull: ['$$inmueble.nestedescaleras', []] },
                                                as: 'escalera',
                                                in: {
                                                    $size: {
                                                        $filter: {
                                                            input: { $ifNull: ['$$escalera.nestedinmuebles', []] },
                                                            as: 'nested',
                                                            cond: { $eq: ['$$nested.categoria', 'Propietario'] }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        escaleraNestedCategoriaNull: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ['$inmuebles', []] },
                                    as: 'inmueble',
                                    in: {
                                        $sum: {
                                            $map: {
                                                input: { $ifNull: ['$$inmueble.nestedescaleras', []] },
                                                as: 'escalera',
                                                in: {
                                                    $size: {
                                                        $filter: {
                                                            input: { $ifNull: ['$$escalera.nestedinmuebles', []] },
                                                            as: 'nested',
                                                            cond: { $eq: ['$$nested.categoria', null] }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ]).toArray();

            if (zoneStatistics.length > 0) {
                const result = zoneStatistics[0];

                // Calculate percentages
                const totalElements = result.totalInmuebles || 0;
                const percentageNoticias = totalElements > 0 ? (result.noticiaState1 + result.nestedNoticiaState1 + result.escaleraNestedNoticiaState1) / totalElements * 100 : 0;
                const percentageEncargos = totalElements > 0 ? (result.encargoState1 + result.nestedEncargoState1 + result.escaleraNestedEncargoState1) / totalElements * 100 : 0;
                const percentageInquilino = totalElements > 0 ? (result.categoriaInquilino + result.nestedCategoriaInquilino + result.escaleraNestedCategoriaInquilino) / totalElements * 100 : 0;
                const percentageVacio = totalElements > 0 ? (result.categoriaVacio + result.nestedCategoriaVacio + result.escaleraNestedCategoriaVacio) / totalElements * 100 : 0;
                const percentagePropietario = totalElements > 0 ? (result.categoriaPropietario + result.nestedCategoriaPropietario + result.escaleraNestedCategoriaPropietario) / totalElements * 100 : 0;
                const percentageNull = totalElements > 0 ? (result.categoriaNull + result.nestedCategoriaNull + result.escaleraNestedCategoriaNull) / totalElements * 100 : 0;

                // Attach the calculated percentages to the result
                result.percentageNoticias = percentageNoticias.toFixed(2);
                result.percentageEncargos = percentageEncargos.toFixed(2);
                result.percentageInquilino = percentageInquilino.toFixed(2);
                result.percentageVacio = percentageVacio.toFixed(2);
                result.percentagePropietario = percentagePropietario.toFixed(2);
                result.percentageNull = percentageNull.toFixed(2);

                res.status(200).json(result);
            } else {
                res.status(404).json({ message: 'No statistics found for the given zoneName' });
            }
        } catch (error) {
            console.log('Error fetching zone statistics: here', error.message);
            console.error('Error fetching zone statistics: here', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
