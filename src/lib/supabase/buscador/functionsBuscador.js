import { supabase } from '../supabaseClient.js';

export const fetchAllData = async (page, term, itemsPerPage) => {
    try {
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
        const totalPages = Math.ceil(totalMergedDataCount.length / 6);


        // Fetching the actual data from 'inmuebles' table
        const { data: inmuebles, error: errorInmuebles } = await supabase
            .from('inmuebles')
            .select('*')
            .ilike('direccion', isTermEmpty ? '%' : pattern)  // Use '%' if term is empty
            .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

        if (errorInmuebles) {
            throw new Error(errorInmuebles.message);
        }

        // Fetching data from 'edificios' table
        const { data: edificios, error: errorEdificios } = await supabase
            .from('edificios')
            .select('*');

        if (errorEdificios) {
            throw new Error(errorEdificios.message);
        }

        // Fetching data from 'escaleras' table
        const { data: escaleras, error: errorEscaleras } = await supabase
            .from('escaleras')
            .select('*');

        if (errorEscaleras) {
            throw new Error(errorEscaleras.message);
        }

        const premergedData = mergeData(inmuebles, edificios, escaleras);
        const mergedData = premergedData.slice(0, 6);
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
