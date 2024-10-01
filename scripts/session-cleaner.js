import cron from 'node-cron';
import { MongoClient } from 'mongodb';

// Directly specify the MongoDB URI and database name
const MONGODB_URI = 'mongodb://localhost:27017/inmoprocrm';
const MONGODB_DB = 'inmoprocrm';

const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const deleteOldSessions = async () => {
    try {
        await client.connect(); // Connect to the database
        const db = client.db(MONGODB_DB); // Use the database name directly

        // Calculate the time 6 hours ago
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

        // Delete documents where "date_time" is older than 6 hours
        const result = await db.collection('active_sessions').deleteMany({
            "date_time": { $lt: sixHoursAgo }
        });

        console.log(`Deleted ${result.deletedCount} old sessions`);
    } catch (error) {
        console.error('Error deleting old sessions:', error);
    } finally {
        await client.close(); // Ensure the client is closed after the operation
    }
};

// Schedule the task to run every 10 minutes
cron.schedule('*/10 * * * *', () => {
    console.log('Running scheduled task to delete old sessions...');
    deleteOldSessions();
});
