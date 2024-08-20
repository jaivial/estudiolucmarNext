import clientPromise from '../../lib/mongodb';
import Cookies from 'cookies';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;

        const { email, password } = req.body;

        const db = client.db('inmoprocrm'); // Ensure the correct database name
        const user = await db.collection('users').findOne({ email, password });


        if (!user) {
            res.status(200).json({ success: false, message: 'User not found' });
            return;
        }

        const activeUser = await db.collection('active_sessions').find({ user_id: user.user_id }).toArray();
        console.log('activeUser', activeUser.length);
        if (activeUser.length > 0) {
            res.status(200).json({ success: false, message: 'User active on another device' });
            return;
        }

        // Generate a unique session ID
        const uniqueData = user.user_id + new Date().getTime();
        const sessionID = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(uniqueData));
        const sessionIDHex = Array.from(new Uint8Array(sessionID))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        const result = await db.collection('active_sessions').insertOne({
            user_id: user.user_id,
            session_id: sessionIDHex,
            date_time: new Date(),
        });

        console.log('result', result);

        if (result.acknowledged === true) {
            console.log('hola');
            res.status(200).json({ success: true, message: 'User session set', sessionID: sessionIDHex, user_id: user.user_id });
        } else {
            res.status(500).json({ success: false, message: 'Internal server error' });
        }

    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
