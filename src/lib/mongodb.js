import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Ensure this is set in your .env.local
const options = {};

let client;
let clientPromise;

if (!uri) {
    throw new Error('Please add your MongoDB URI to .env.local');
}

try {
    if (process.env.NODE_ENV === 'development') {
        if (!global._mongoClientPromise) {
            client = new MongoClient(uri, options);
            global._mongoClientPromise = client.connect()
                .then(() => {
                    console.log('MongoDB connected successfully (development)');
                    return client; // Return the client
                })
                .catch((err) => {
                    console.error('MongoDB connection failed (development):', err);
                    throw err;
                });
        }
        clientPromise = global._mongoClientPromise;
    } else {
        if (!global._mongoClientPromise) {
            client = new MongoClient(uri, options);
            global._mongoClientPromise = client.connect()
                .then(() => {
                    console.log('MongoDB connected successfully (production)');
                    return client; // Return the client
                })
                .catch((err) => {
                    console.error('MongoDB connection failed (production):', err);
                    throw err;
                });
        }
        clientPromise = global._mongoClientPromise;
    }
} catch (error) {
    console.error('MongoDB initialization error:', error);
    throw new Error('MongoDB connection failed');
}

export default clientPromise;