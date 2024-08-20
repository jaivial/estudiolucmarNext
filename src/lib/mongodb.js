import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_ATLAS_URI; // Ensure this is set in your .env.local
const options = {};

let client;
let clientPromise;

if (!uri) {
    throw new Error('Please add your MongoDB Atlas URI to .env.local');
}

try {
    if (process.env.NODE_ENV === 'development') {
        // In development mode, use a global variable so the client is not recreated on every request
        if (!global._mongoClientPromise) {
            client = new MongoClient(uri, options);
            global._mongoClientPromise = client.connect();
            console.log('MongoDB connection established (development)');
        }
        clientPromise = global._mongoClientPromise;
    } else {
        // In production mode, it's best to not use a global variable
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
        console.log('MongoDB connection established (production)');
    }
} catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('MongoDB connection failed');
}

export default clientPromise;
