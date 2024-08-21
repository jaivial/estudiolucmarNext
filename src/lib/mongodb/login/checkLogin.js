import getConnection from "../../db.js";
import { ObjectId } from "mongodb";
import Cookies from 'js-cookie';
import cookie from 'cookie'; // Import cookie module

export const checkLogin = async (req) => {
    let user_id;
    let session_id;

    // Check if running on the server
    if (req) {
        const cookies = cookie.parse(req.headers.cookie || '');
        user_id = parseInt(cookies.user_id);
        session_id = cookies.sessionID;
        console.log('user_id', user_id);
        console.log('session_id', session_id);
    } else {
        // Use js-cookie for client-side (if needed)
        user_id = Cookies.get('user_id');
        session_id = Cookies.get('sessionID');
    }

    if (!user_id || !session_id) {
        console.error('User ID or Session ID is missing');
        return false; // Return false if user ID or session ID is missing
    }

    try {
        const client = await getConnection();
        const db = client.db(process.env.MONGODB_DATABASE);
        console.log('user_id', user_id);
        console.log('session_id', session_id);
        // Query the MongoDB collection
        const query = { user_id: user_id, session_id: session_id }; // Convert user_id to an integer
        const data = await db.collection('active_sessions').findOne(query);

        if (!data) {
            console.error('No session found for the provided User ID and Session ID');
            return false; // Return false if no session is found
        }

        return true; // Return true if a session is found

    } catch (error) {
        console.error('Error fetching user session:', error.message);
        return false; // Return false in case of an error
    }
};
