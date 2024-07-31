import { supabase } from '../supabaseClient.js';

export const fetchAllData = async (page, term, itemsPerPage) => {
    try {
        // Check if the term is an empty string
        let isTermEmpty = false;
        if (term.trim() === '') {
            isTermEmpty = true;
        }
        const pattern = `%${term.split(' ').join('%')}%`;

        // Fetching data from 'inmuebles' table
        const { data: inmuebles, error: errorInmuebles } = await supabase
            .from('inmuebles')
            .select('*')
            .ilike('direccion', isTermEmpty ? '%' : pattern);

        if (errorInmuebles) {
            throw new Error(errorInmuebles.message);
        }

        // Fetching data from 'edificios' table
        const { data: edificios, error: errorEdificios } = await supabase
            .from('edificios')
            .select('*')
            .ilike('direccion', isTermEmpty ? '%' : pattern);

        if (errorEdificios) {
            throw new Error(errorEdificios.message);
        }

        // Fetching data from 'escaleras' table
        const { data: escaleras, error: errorEscaleras } = await supabase
            .from('escaleras')
            .select('*')
            .ilike('direccion', isTermEmpty ? '%' : pattern);

        if (errorEscaleras) {
            throw new Error(errorEscaleras.message);
        }

        // Merge data
        const mergedData = mergeData(inmuebles, edificios, escaleras);

        async function processMergedData(mergedData) {
            for (const item of mergedData) {
                if (item.tipoAgrupacion === 1) {
                    console.log('item', item);
                } else if (item.tipoAgrupacion === 2) {
                    console.log('item', item);
                    const inmuebles_id = item.inmuebles_id;
                    console.log('inmuebles_id', inmuebles_id);

                    for (const inmuebleID of inmuebles_id) {
                        console.log('inmueble', inmuebleID);

                        const { data: inmuebleData, error: errorInmueble } = await supabase
                            .from('inmuebles')
                            .select('*')
                            .eq('id', inmuebleID);

                        if (errorInmueble) {
                            throw new Error(errorInmueble.message);
                        }

                        console.log('inmuebleData', inmuebleData);

                    }
                } else if (item.tipoAgrupacion === 3) {
                    console.log('item', item);
                }
            }
        }

        processMergedData(mergedData);
        // mergedData.forEach(item => {
        //     if (item.tipoAgrupacion === 1) {
        //         // Revisar inmuebles
        //         const { data: edificioInmuebles, error: errorEdificioInmuebles } = supabase
        //             .from('edificios')
        //             .select('*')
        //             .contains('inmuebles_id->inmuebles_id', [item.id]);

        //         if (errorEdificioInmuebles) {
        //             throw new Error(errorEdificioInmuebles.message);
        //         }

        //         edificioInmuebles.forEach(edificio => {
        //             if (!item.nestedInmuebles) item.nestedInmuebles = [];
        //             item.nestedInmuebles.push(edificio);
        //         });

        //         // Revisar escaleras
        //         const { data: escaleraInmuebles, error: errorEscaleraInmuebles } =  supabase
        //             .from('escaleras')
        //             .select('*')
        //             .contains('inmuebles_id->inmuebles_id', [item.id]);

        //         if (errorEscaleraInmuebles) {
        //             throw new Error(errorEscaleraInmuebles.message);
        //         }

        //         for (const escalera of escaleraInmuebles) {
        //             if (!item.nestedEscaleras) item.nestedEscaleras = [];
        //             item.nestedEscaleras.push(escalera);

        //             const { data: edificioEscaleras, error: errorEdificioEscaleras }  supabase
        //                 .from('edificios')
        //                 .select('*')
        //                 .contains('escaleras_id->escaleras_id', [escalera.id]);

        //             if (errorEdificioEscaleras) {
        //                 throw new Error(errorEdificioEscaleras.message);
        //             }

        //             edificioEscaleras.forEach(edificio => {
        //                 if (!escalera.nestedInmuebles) escalera.nestedInmuebles = [];
        //                 escalera.nestedInmuebles.push(edificio);
        //             });
        //         }
        //     }
        // });
        const totalPages = Math.ceil(mergedData.length / itemsPerPage);
        const paginatedData = mergedData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

        return { mergedData: paginatedData, totalPages };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be handled by the calling function if necessary
    }
};

// mergeData.js

export const mergeData = (inmuebles, edificios, escaleras) => {
    const mergedData = [];
    const usedEscaleras = new Set();
    const usedInmuebles = new Set();

    // Add edificios and nest their inmuebles and escaleras
    edificios.forEach(edificio => {
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

    // Add remaining inmuebles that are not part of any escalera o edificio
    inmuebles.forEach(inmueble => {
        if (!usedInmuebles.has(inmueble.id)) {
            mergedData.push(inmueble);
        }
    });

    return mergedData;
};
