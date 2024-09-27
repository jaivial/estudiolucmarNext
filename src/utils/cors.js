// utils/cors.js
import Cors from 'cors';

// Initialize the CORS middleware
const allowedOrigins = [
    'https://estudiolucmar.com',
    'https://www.estudiolucmar.com',
    'http://estudiolucmar.com',
    'http://www.estudiolucmar.com',
    'http://localhost:3000/',
];

const cors = Cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin);
            console.log('Origin:', origin);

        } else {
            callback(new Error('Not allowed by CORS'));
            console.log('Origin:', origin);

        }
    },
    credentials: true,  // Enable cookies if needed
});

// Helper method to run middleware in Next.js
export function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default cors;
