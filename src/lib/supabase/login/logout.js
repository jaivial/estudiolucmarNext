import { supabase } from '../supabaseClient.js';
import Cookies from 'js-cookie';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import Toastify from 'toastify-js';

export const logout = async () => {
    try {
        const { data, error } = await supabase
            .from('active_sessions')
            .delete()
            .eq('user_id', Cookies.get('user_id'))
            .select();

        console.log('logout', data); // Debugging line
        if (error) {
            throw new Error(error.message);
        }

        if (data) { // If the user is active
            Cookies.remove('hashID', { path: '/' });
            Cookies.remove('user_id', { path: '/' });
            return { success: true, message: 'User session deleted' };
        } else {
            return { success: false, message: 'User session not found' };
        }
    } catch (error) {
        console.error('Error handling user session:', error.message);
        return { success: false, message: 'An error occurred.' };
    }
};