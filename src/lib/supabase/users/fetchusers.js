import { supabase } from '../supabaseClient.js';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS

export const fetchUserName = async (user_id) => {
    try {

        const { data, error } = await supabase
            .from('users')
            .select('nombre')
            .eq('user_id', user_id);

        if (error) {
            throw new Error(error.message);
        }

        if (data.length === 0) { // Check if data array is empty
            throw new Error('User not found');
        }

        return data[0].nombre; // Return the user name
    } catch (error) {
        console.error('Error fetching user:', error.message);
        throw error; // Re-throw the error to be handled by the calling function if necessary
    }
};
