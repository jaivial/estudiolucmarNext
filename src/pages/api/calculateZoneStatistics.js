import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { zoneName } = req.query;

        if (!zoneName) {
            return res.status(400).json({ message: 'zoneId is required' });
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
                        totalInmuebles: { $size: '$inmuebles' },
                        noticiaState1: {
                            $size: {
                                $filter: {
                                    input: '$inmuebles',
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.noticiastate', '1'] }
                                }
                            }
                        },
                        noticiaState0: {
                            $size: {
                                $filter: {
                                    input: '$inmuebles',
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.noticiastate', '0'] }
                                }
                            }
                        },
                        encargoState1: {
                            $size: {
                                $filter: {
                                    input: '$inmuebles',
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.encargoState', '1'] }
                                }
                            }
                        },
                        encargoState0: {
                            $size: {
                                $filter: {
                                    input: '$inmuebles',
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.encargoState', '0'] }
                                }
                            }
                        },
                        categoriaInquilino: {
                            $size: {
                                $filter: {
                                    input: '$inmuebles',
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.categoria', 'Inquilino'] }
                                }
                            }
                        },
                        categoriaVacio: {
                            $size: {
                                $filter: {
                                    input: '$inmuebles',
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.categoria', 'Vacio'] }
                                }
                            }
                        },
                        categoriaPropietario: {
                            $size: {
                                $filter: {
                                    input: '$inmuebles',
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.categoria', 'Propietario'] }
                                }
                            }
                        },
                        categoriaNull: {
                            $size: {
                                $filter: {
                                    input: '$inmuebles',
                                    as: 'inmueble',
                                    cond: { $eq: ['$$inmueble.categoria', null] }
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
                const percentageNoticias = totalElements > 0 ? (result.noticiaState1 / totalElements) * 100 : 0;
                const percentageEncargos = totalElements > 0 ? (result.encargoState1 / totalElements) * 100 : 0;
                const percentageInquilino = totalElements > 0 ? (result.categoriaInquilino / totalElements) * 100 : 0;
                const percentageVacio = totalElements > 0 ? (result.categoriaVacio / totalElements) * 100 : 0;
                const percentagePropietario = totalElements > 0 ? (result.categoriaPropietario / totalElements) * 100 : 0;
                const percentageNull = totalElements > 0 ? (result.categoriaNull / totalElements) * 100 : 0;

                // Attach the calculated percentages to the result
                result.percentageNoticias = percentageNoticias.toFixed(2);
                result.percentageEncargos = percentageEncargos.toFixed(2);
                result.percentageInquilino = percentageInquilino.toFixed(2);
                result.percentageVacio = percentageVacio.toFixed(2);
                result.percentagePropietario = percentagePropietario.toFixed(2);
                result.percentageNull = percentageNull.toFixed(2);

                res.status(200).json(result);
            } else {
                res.status(404).json({ message: 'No statistics found for the given zoneId' });
            }
        } catch (error) {
            console.error('Error fetching zone statistics:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
