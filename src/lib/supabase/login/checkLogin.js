import { supabase } from '../supabaseClient.js';
import cookie from 'cookie';

export const checkActiveUser = async (req) => {
    let user_id;
    let session_id;

    // Check if running on the server
    if (req) {
        const cookies = cookie.parse(req.headers.cookie || '');
        user_id = cookies.user_id;
        session_id = cookies.hashID;
    } else {
        // Use js-cookie for client-side (if needed)
        const Cookies = require('js-cookie');
        user_id = Cookies.get('user_id');
        session_id = Cookies.get('hashID');
    }

    if (!user_id || !session_id) {
        console.error('User ID or Session ID is missing');
        return null; // Return null or handle this case as needed
    }

    try {
        const { data, error } = await supabase
            .from('active_sessions')
            .select('*')
            .eq('user_id', user_id)
            .eq('session_id', session_id);

        if (error) {
            throw new Error(error.message);
        }

        return data; // Return the data or handle it as needed

    } catch (error) {
        console.error('Error fetching user:', error.message);
        throw error; // Re-throw the error to be handled by the calling function if necessary
    }
};
