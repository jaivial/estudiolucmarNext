// utils/cors.js
import Cors from 'cors';

// Initialize the CORS middleware
const cors = Cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    origin: 'https://estudiolucmar.com',  // Your domain
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
