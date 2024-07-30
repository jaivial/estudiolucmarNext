// fetchUser.js
import { supabase } from '../supabaseClient.js';
import Cookies from 'js-cookie';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import Toastify from 'toastify-js';
import { useRouter } from 'next/router';


const showToast = (message, backgroundColor) => {
  Toastify({
    text: message,
    duration: 2500,
    gravity: 'top',
    position: 'center',
    stopOnFocus: true,
    style: {
      borderRadius: '10px',
      backgroundImage: backgroundColor,
      textAlign: 'center',
    },
  }).showToast();
};




export const fetchUser = async (email, password) => {
  try {

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password);
    console.log('data', data); // Debugging line
    if (error) {
      throw new Error(error.message);
    }

    if (data.length === 0) { // If the user does not exist
      showToast('El usuario no existe', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
      return { successCredentials: false, error: error };

    } else if (data.length > 0) {
      const now = new Date();
      const expires = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      // Set cookies with a path of '/'
      Cookies.set('user_id', data[0].user_id, { expires: expires, path: '/' });
      Cookies.set('admin', data[0].admin, { expires: expires, path: '/' });
      console.log('cookies', Cookies.get()); // Debugging line

      try {
        const { data: activeUser, error: activeUserError } = await checkActiveUser(data[0].id);
        if (activeUserError) {
          throw new Error(activeUserError.message);
        }

        if (activeUser.length > 0) { // If the user is not active
          showToast('Usuario activo en otro dispositivo', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)'); // Display a toast message
        } else { // If the user is active
          try {

            const { success, message } = await handleUserSession();
            if (success) {
              localStorage.setItem('toastMessage', JSON.stringify({
                message: 'Sesión iniciada',
                style: 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)'
              }));
              window.location.href = '/home';
            } else {
              showToast(message, 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)'); // Display a toast message
            }

          } catch (error) {
            console.error('Error handling user session:', error.message);
            throw error; // Re-throw the error to be handled by the calling function if necessary
          }
        }
        return { successCredentials: true, error: error };
      } catch (error) {
        console.error('Error fetching user:', error.message);
        throw error; // Re-throw the error to be handled by the calling function if necessary
      }
    }

    return data;
  } catch (error) {
    console.error('Error fetching user:', error.message);
    throw error; // Re-throw the error to be handled by the calling function if necessary
  }
};

const checkActiveUser = async (user_id) => {
  try {
    const { data, error } = await supabase
      .from('active_sessions')
      .select('session_id', { count: 'exact' }) // Assuming 'id' is the primary key in your 'active_sessions' table
      .eq('user_id', user_id);

    if (error) {
      throw new Error(error.message);
    }

    return { data, error };
  } catch (error) {
    console.error('Error fetching user:', error.message);
    throw error; // Re-throw the error to be handled by the calling function if necessary
  }
};

const handleUserSession = async () => {
  try {
    const userID = Cookies.get('user_id');
    if (!userID) {
      return { success: false, message: 'Cookie not found.' };
    }

    // Generate a unique session ID
    const uniqueData = userID + new Date().getTime();
    const sessionID = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uniqueData));
    const sessionIDHex = Array.from(new Uint8Array(sessionID))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const { data, error } = await supabase
      .from('active_sessions')
      .insert([{ user_id: userID, session_id: sessionIDHex }], { upsert: true })
      .select();

    if (error) {
      throw new Error(error.message);
    }

    if (data.length > 0) { // If the user is active
      const now = new Date();
      const expires = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      Cookies.set('hashID', sessionIDHex, { expires: expires, path: '/' }); // 1/12 of a day = 2 hours
      return { success: true, message: 'User session set' };
    } else {
      return { success: false, message: 'User session setting went wrong' };
    }
  } catch (error) {
    console.error('Error handling user session:', error.message);
    return { success: false, message: 'An error occurred.' };
  }
};
