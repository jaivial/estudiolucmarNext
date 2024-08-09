
import { supabase } from '../supabaseClient.js';

export const fetchAllData = async (page,
    term,
    itemsPerPage,
    zone = '',
    responsable = '',
    categoria = '',
    filternoticia = null,
    filterencargo = null,
    superficiemin = 0,
    superficiemax = 10000,
    yearmin = 1850,
    yearmax = new Date().getFullYear(),
    localizado = null,
    habitaciones = null,
    banos = null,
    tipo = null,
    aireacondicionado = null,
    ascensor = null,
    garaje = null,
    jardin = null,
    terraza = null,
    trastero = null) => {
    try {
        console.time('Total time');
        const isTermEmpty = !term || term.trim() === '';
        const pattern = isTermEmpty ? '%' : `%${term}%`;
        if (categoria == 'Sin información') {
            categoria = NULL;
        }
        const { data: searchData, error: searchError } = await supabase
            .rpc('search_in_nested_inmuebles', {
                pattern,
                page,
                itemsperpage: itemsPerPage,
                zone,
                responsable_filter: responsable,
                categoria_filter: categoria,
                filternoticia,
                filterencargo,
                superficiemin,
                superficiemax,
                yearmin,
                yearmax,
                localizado_filter: localizado,
                habitaciones_filter: habitaciones,         // Include the habitaciones filter
                banos_filter: banos,                       // Include the banos filter
                tipo_filter: tipo,                         // Include the tipo filter
                aireacondicionado_filter: aireacondicionado, // Include the aireacondicionado filter
                ascensor_filter: ascensor,                 // Include the ascensor filter
                garaje_filter: garaje,                     // Include the garaje filter
                jardin_filter: jardin,                     // Include the jardin filter
                terraza_filter: terraza,                   // Include the terraza filter
                trastero_filter: trastero                  // Include the trastero filter
            });

        if (searchError) {
            throw new Error(searchError.message);
        }

        if (searchData.length === 0) {
            return { mergedData: [], totalPages: 0 };
        }


        const total = searchData.length > 0 ? searchData[0].total_count : 0;
        let analyticsData = [];
        const responsablescount = searchData[0].responsables_count;
        const categoriascount = searchData[0].categorias_count;
        const zonascount = searchData[0].zonas_count;
        analyticsData.push({ name: 'Responsables', value: responsablescount });
        analyticsData.push({ name: 'Total', value: total });
        analyticsData.push({ name: 'Categorias', value: categoriascount });
        analyticsData.push({ name: 'Zonas', value: zonascount });
        console.log('analyticsData', analyticsData); // Debugging line to log the analytics data


        const totalPages = Math.ceil(total / itemsPerPage);

        console.timeEnd('Total time'); // End the timer
        return { mergedData: searchData, totalPages, total, analyticsData };

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Re-throw the error to be handled by the calling function if necessary
    }
};
