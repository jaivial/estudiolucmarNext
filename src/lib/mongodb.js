import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Asegúrate de que esta variable esté en tu archivo .env.local
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
    // En modo de desarrollo, usa una variable global para evitar recrear la conexión
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect().then(client => {
            return client.db('inmoprocrm'); // Selecciona la base de datos 'inmoprocrm'
        });
    }
    clientPromise = global._mongoClientPromise;
} else {
    // En modo producción, es mejor no usar una variable global
    client = new MongoClient(uri, options);
    clientPromise = client.connect().then(client => {
        return client.db('inmoprocrm'); // Selecciona la base de datos 'inmoprocrm'
    });
}

// Exporta `clientPromise` para ser utilizado en el resto de la aplicación
export default clientPromise;
