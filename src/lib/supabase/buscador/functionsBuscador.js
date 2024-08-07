import { supabase } from '../supabaseClient.js';

export const fetchAllData = async (page, term, itemsPerPage) => {
    try {
        console.time('Total time');
        const isTermEmpty = !term || term.trim() === '';
        const pattern = isTermEmpty ? '%' : `%${term}%`;

        // Count total number of items that match the search term
        const { count: totalItems, error: countError } = await supabase
            .from('inmuebles')
            .select('*', { count: 'exact', head: true })
            .or(`direccion.ilike.${pattern}`);

        if (countError) {
            throw new Error(countError.message);
        }

        const total = totalItems;
        console.log('total', total);
        console.timeEnd('Count total items');

        console.time('Total fetchData time');
        // Search in both the direccion column and nestedInmuebles.direccion
        const { data: searchData, error: searchError } = await supabase
            .rpc('search_in_nested_inmuebles', { pattern, page, itemsPerPage });

        if (searchError) {
            throw new Error(searchError.message);
        }

        // Calculate the total number of pages
        const totalPages = Math.ceil(total / 6);
        console.timeEnd('Total time');
        return { mergedData: searchData, totalPages };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be handled by the calling function if necessary
    }
};
