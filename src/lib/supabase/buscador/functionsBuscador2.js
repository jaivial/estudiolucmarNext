import { supabase } from '../supabaseClient.js';


export const fetchAllData = async (page, term, itemsPerPage) => {
    try {
        // Calculate the range for pagination
        const start = (page - 1) * itemsPerPage;
        const end = page * itemsPerPage;

        // Check if the term is an empty string
        let isTermEmpty = false;
        if (term.trim() === '') {
            isTermEmpty = true;
        }
        const pattern = `%${term.split(' ').join('%')}%`;

        // Count total number of items that match the search term
        const { data: totalItems, error: countError } = await supabase
            .from('inmuebles')
            .select('*')
            .ilike('direccion', isTermEmpty ? '%' : pattern);  // Use '%' if term is empty

        if (countError) {
            throw new Error(countError.message);
        }

        // Fetching data from 'edificios' table
        const { data: totalEdificios, error: errorcountEdificios } = await supabase
            .from('edificios')
            .select('*')
            .ilike('direccion', isTermEmpty ? '%' : pattern);  // Use '%' if term is empty
        console.log('totalEdificios', totalEdificios);

        if (errorcountEdificios) {
            throw new Error(errorcountEdificios.message);
        }

        const { data: totalEscaleras, error: errorcountEscaleras } = await supabase
            .from('escaleras')
            .select('*')
            .ilike('direccion', isTermEmpty ? '%' : pattern);  // Use '%' if term is empty
        console.log('totalEscaleras', totalEscaleras);

        if (errorcountEscaleras) {
            throw new Error(errorcountEscaleras.message);
        }

        const totalMergedDataCount = mergeData(totalItems, totalEdificios, totalEscaleras);
        console.log('totalMergedDataCount', totalMergedDataCount.length);

        async function processMergedData(mergedData) {
            for (const item of mergedData) {
                if (item.tipoAgrupacion === 1) {
                } else if (item.tipoAgrupacion === 2) {

                    const inmuebles_id = item.inmuebles_id;
                    if (inmuebles_id) {
                        let allInmuebleData = [];
                        for (const inmuebleID of inmuebles_id) {
                            const { data: inmuebleData, error: errorInmueble } = await supabase
                                .from('inmuebles')
                                .select('*')
                                .eq('id', inmuebleID);

                            if (errorInmueble) {
                                throw new Error(errorInmueble.message);
                            }
                            allInmuebleData.push(inmuebleData);
                        }
                        const allInmuebleDataFlat = allInmuebleData.flat();
                        item.nestedInmuebles = allInmuebleDataFlat;
                    }


                    const escaleras_id = item.escaleras_id;
                    if (escaleras_id) {
                        let allEscaleraData = [];
                        for (const escaleraID of escaleras_id) {
                            const { data: escaleraData, error: errorEscalera } = await supabase
                                .from('escaleras')
                                .select('*')
                                .eq('id', escaleraID);

                            if (errorEscalera) {
                                throw new Error(errorEscalera.message);
                            }
                            allEscaleraData.push(escaleraData);
                        }
                        const allEscaleraDataFlat = allEscaleraData.flat();
                        item.nestedEscaleras = allEscaleraDataFlat;
                    }

                    const nestedEscaleras = item.nestedEscaleras;
                    console.log('nestedEscaleras', nestedEscaleras);
                    for (const nestedEscalera of nestedEscaleras) {
                        const inmuebles_id_Escalaras = nestedEscalera.inmuebles_id;
                        console.log('inmuebles_id_Escalaras', inmuebles_id_Escalaras);
                        let allInmuebleDataEscaleras = [];
                        for (const inmuebleID of inmuebles_id_Escalaras) {
                            const { data: inmuebleData, error: errorInmueble } = await supabase
                                .from('inmuebles')
                                .select('*')
                                .eq('id', inmuebleID);

                            if (errorInmueble) {
                                throw new Error(errorInmueble.message);
                            }

                            allInmuebleDataEscaleras.push(inmuebleData);
                        }
                        const allInmuebleDataEscalerasFlat = allInmuebleDataEscaleras.flat();
                        nestedEscalera.nestedInmuebles = allInmuebleDataEscalerasFlat;

                        // Filter out nestedInmuebles whose id matches any id in nestedEscaleras.nestedInmuebles
                        const nestedInmueblesIds = item.nestedEscaleras.flatMap(escalera => escalera.nestedInmuebles).map(nestedInmueble => nestedInmueble.id);
                        console.log('nestedInmueblesIds to remove', nestedInmueblesIds);

                        item.nestedInmuebles = item.nestedInmuebles.filter(nestedInmueble => !nestedInmueblesIds.includes(nestedInmueble.id));
                        console.log('Final item.nestedInmuebles', item.nestedInmuebles);
                    }

                    // const inmuebles_id_Escalaras = item.nestedEscaleras.inmuebles_id;
                    // console.log('inmuebles_id_Escalaras', inmuebles_id_Escalaras);
                    // let allInmuebleDataEscaleras = [];
                    // for (const inmuebleID of inmuebles_id_Escalaras) {
                    //     const { data: inmuebleData, error: errorInmueble } = await supabase
                    //         .from('inmuebles')
                    //         .select('*')
                    //         .eq('id', inmuebleID);

                    //     if (errorInmueble) {
                    //         throw new Error(errorInmueble.message);
                    //     }
                    //     allInmuebleDataEscaleras.push(inmuebleData);
                    // }
                    // const allInmuebleDataEscalerasFlat = allInmuebleDataEscaleras.flat();
                    // item.nestedEscaleras.nestedInmuebles = allInmuebleDataEscalerasFlat;

                    console.log('item', item);



                } else if (item.tipoAgrupacion === 3) {
                    console.log('item', item);
                }
            }
        }
        processMergedData(totalMergedDataCount);


        const totalPages = Math.round(totalMergedDataCount.length / 6);
        const paginatedData = totalMergedDataCount.slice(start, end);
        console.log('paginatedData', paginatedData);




        const mergedData = paginatedData.slice(0, 6);
        console.log('mergedData', mergedData);

        return { mergedData, totalPages };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be handled by the calling function if necessary
    }
};

// mergeData.js

export const mergeData = (inmuebles, edificios, escaleras) => {
    if (!Array.isArray(edificios)) {
        throw new Error('Edificios data is not an array or is undefined');
    }

    const mergedData = [];
    const usedEscaleras = new Set();
    const usedInmuebles = new Set();

    // Add edificios and nest their inmuebles and escaleras
    edificios.forEach(edificio => {
        // Verificamos si `inmuebles_id` y `escaleras_id` existen y son arrays
        const nestedInmuebles = Array.isArray(edificio.inmuebles_id)
            ? edificio.inmuebles_id.map(inmuebleId =>
                inmuebles.find(inmueble => inmueble.id === inmuebleId)
            ).filter(Boolean)
            : [];


        const nestedEscaleras = Array.isArray(edificio.escaleras_id)
            ? edificio.escaleras_id.map(escaleraId =>
                escaleras.find(escalera => escalera.id === Number(escaleraId))
            ).filter(Boolean)
            : [];


        nestedEscaleras.forEach(escalera => {
            usedEscaleras.add(escalera.id);
            const nestedInmueblesInEscalera = Array.isArray(escalera.inmuebles_id)
                ? escalera.inmuebles_id.map(inmuebleId =>
                    inmuebles.find(inmueble => inmueble.id === inmuebleId)
                ).filter(Boolean)
                : [];
            escalera.nestedInmuebles = nestedInmueblesInEscalera;
            nestedInmueblesInEscalera.forEach(inmueble => usedInmuebles.add(inmueble.id));
        });

        nestedInmuebles.forEach(inmueble => usedInmuebles.add(inmueble.id));

        mergedData.push({ ...edificio, nestedEscaleras, nestedInmuebles });
    });


    // Add remaining escaleras that are not part of any edificio
    escaleras.forEach(escalera => {
        if (!usedEscaleras.has(escalera.id)) {
            const nestedInmuebles = escalera.inmuebles_id?.map(inmuebleId =>
                inmuebles.find(inmueble => inmueble.id === inmuebleId)
            ).filter(Boolean) || [];
            escalera.nestedInmuebles = nestedInmuebles;
            nestedInmuebles.forEach(inmueble => usedInmuebles.add(inmueble.id));
            mergedData.push({ ...escalera, nestedInmuebles });
        }
    });

    // Add remaining inmuebles that are not part of any escalera or edificio
    inmuebles.forEach(inmueble => {
        if (!usedInmuebles.has(inmueble.id)) {
            mergedData.push(inmueble);
        }
    });

    return mergedData;
};
