import { supabase } from '../supabaseClient.js';

export const fetchAllData = async (page, term, itemsPerPage, zone = '', responsable = '', filternoticia = false, filterencargo = false, superficiemin = 0, superficiemax = 10000, yearmin = 1850, yearmax = new Date().getFullYear()) => {
    try {
        console.time('Total time');
        const isTermEmpty = !term || term.trim() === '';
        const pattern = isTermEmpty ? '%' : `%${term}%`;

        // Ensure boolean parameters are boolean
        filternoticia = filternoticia ? true : false;
        filterencargo = filterencargo ? true : false;

        const { data: searchData, error: searchError } = await supabase
            .rpc('search_in_nested_inmuebles', { pattern, page, itemsperpage: itemsPerPage, zone, responsable_filter: responsable, filternoticia, filterencargo, superficiemin, superficiemax, yearmin, yearmax });

        if (searchError) {
            throw new Error(searchError.message);
        }

        if (searchData.length === 0) {
            return { mergedData: [], totalPages: 0 };
        }

        console.log('searchData', searchData[0].total_count); // Debugging line

        const total = searchData.length > 0 ? searchData[0].total_count : 0;
        console.log('total', total);

        const totalPages = Math.ceil(total / itemsPerPage);

        console.timeEnd('Total time'); // End the timer
        return { mergedData: searchData, totalPages };

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be handled by the calling function if necessary
    }
};
