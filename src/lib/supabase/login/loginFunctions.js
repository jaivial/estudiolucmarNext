// fetchUser.js
import { supabase } from '../supabaseClient.js'; // Ensure the correct path to your SupabaseCredentials.js file

export const fetchUser = async (email, password) => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).eq('password', password);
    console.log('data', data); // Debugging line
    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error fetching user:', error.message);
    throw error; // Re-throw the error to be handled by the calling function if necessary
  }
};
