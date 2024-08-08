import { supabase } from '../supabaseClient.js';

export const fetchAllData = async (page, term, itemsPerPage, zone = '', responsable = '') => {
    try {
        console.time('Total time');
        const isTermEmpty = !term || term.trim() === '';
        const pattern = isTermEmpty ? '%' : `%${term}%`;

        // Search in both the direccion column and nestedInmuebles.direccion
        const { data: searchData, error: searchError } = await supabase
            .rpc('search_in_nested_inmuebles', { pattern, page, itemsperpage: itemsPerPage, zone, responsable_filter: responsable });

        if (searchError) {
            throw new Error(searchError.message);
        }

        if (searchData.length === 0) {
            return { mergedData: [], totalPages: 0 };
        }

        console.log('searchData', searchData[0].total_count); // Debugging line

        // Extract total count from the first row if exists
        const total = searchData.length > 0 ? searchData[0].total_count : 0;
        console.log('total', total);

        // Calculate the total number of pages
        const totalPages = Math.ceil(total / itemsPerPage);

        console.timeEnd('Total time'); // End the timer
        return { mergedData: searchData, totalPages };

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be handled by the calling function if necessary
    }
};
