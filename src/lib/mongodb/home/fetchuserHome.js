import clientPromise from '../../mongodb.js';

export const fetchUserName = async (user_id) => {
    console.log('user_id', user_id);
    try {
        const client = await clientPromise; // Await the clientPromise to ensure connection
        const db = client.db('inmoprocrm'); // Use the correct database name

        // Fetch the user's name using the user_id
        const user = await db.collection('users').findOne({ user_id: parseInt(user_id, 10) });


        if (!user) { // Check if user is null
            throw new Error('User not found');
        }

        return user.nombre; // Return the user name
    } catch (error) {
        console.error('Error fetching user:', error.message);
        throw error; // Re-throw the error to be handled by the calling function if necessary
    }
};