import clientPromise from '../../mongodb';
import Cookies from 'js-cookie';
import 'toastify-js/src/toastify.css'; // Import Toastify CSS
import Toastify from 'toastify-js';

// Function to show toast messages
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

// Fetch user by email and password
export const fetchUser = async (email, password) => {
    const client = await clientPromise;
    try {
        const db = client.db('inmoprocrm');
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email, password });

        if (!user) {
            showToast('El usuario no existe', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            return { success: false, error: null };
        }

        const now = new Date();
        const expires = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours
        Cookies.set('user_id', user.user_id, { expires, path: '/' });
        Cookies.set('admin', user.admin, { expires, path: '/' });

        const { data: activeUser, error: activeUserError } = await checkActiveUser(client, user.id);
        if (activeUserError) {
            throw new Error(activeUserError);
        }

        if (activeUser.length > 0) {
            showToast('Usuario activo en otro dispositivo', 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
        } else {
            const { success, message } = await handleUserSession(client, user.user_id);
            if (success) {
                showToast(message, 'linear-gradient(to right bottom, #00603c, #006f39, #007d31, #008b24, #069903)');
            } else {
                showToast(message, 'linear-gradient(to right bottom, #c62828, #b92125, #ac1a22, #a0131f, #930b1c)');
            }
        }

        return { success: true, error: null };

    } catch (error) {
        console.error('Error fetching user:', error.message);
        return { success: false, error: error.message };
    }
};

// Check if the user is active on another device
const checkActiveUser = async (client, user_id) => {
    try {
        const db = client.db('inmoprocrm');
        const activeSessionsCollection = db.collection('active_sessions');

        const activeUser = await activeSessionsCollection.find({ user_id }).toArray();

        return { data: activeUser, error: null };
    } catch (error) {
        console.error('Error checking active user:', error.message);
        return { data: null, error: error.message };
    }
};

// Handle the user session by generating and storing a session ID
const handleUserSession = async (client, userID) => {
    try {
        // Generate a unique session ID
        const uniqueData = userID + new Date().getTime();
        const sessionID = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uniqueData));
        const sessionIDHex = Array.from(new Uint8Array(sessionID))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        const db = client.db('inmoprocrm');
        const activeSessionsCollection = db.collection('active_sessions');

        const result = await activeSessionsCollection.insertOne({
            user_id: userID,
            session_id: sessionIDHex,
            date_time: new Date(),
        });

        if (result.insertedId) {
            const now = new Date();
            const expires = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours
            Cookies.set('hashID', sessionIDHex, { expires, path: '/' });
            return { success: true, message: 'User session set' };
        } else {
            return { success: false, message: 'User session setting went wrong' };
        }
    } catch (error) {
        console.error('Error handling user session:', error.message);
        return { success: false, message: 'An error occurred.' };
    }
};
