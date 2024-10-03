import cron from 'node-cron';
import { MongoClient } from 'mongodb';
import moment from 'moment-timezone'; // To handle timezone

const MONGODB_URI = 'mongodb://localhost:27017/inmoprocrm';
const MONGODB_DB = 'inmoprocrm';

const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const updateTasks = async () => {
    try {
        await client.connect();
        const db = client.db(MONGODB_DB);

        // Get current date in Spain timezone
        const spainDate = moment().tz("Europe/Madrid").format("YYYY-MM-DD");

        // Find tasks for today that are not completed
        const tasksToUpdate = await db.collection('tasks').find({
            task_date: spainDate,
            completed: false
        }).toArray();

        if (tasksToUpdate.length > 0) {
            const nextDay = moment(spainDate).add(1, 'days').format("YYYY-MM-DD");
            const updateResult = await db.collection('tasks').updateMany(
                { task_date: spainDate, completed: false },
                { $set: { task_date: nextDay } }
            );

            console.log(`Updated ${updateResult.modifiedCount} tasks to the next day.`);
        } else {
            console.log('No tasks to update for today.');
        }
    } catch (error) {
        console.error('Error updating tasks:', error);
    } finally {
        await client.close();
    }
};

// Schedule the task to run every day at 23:50
cron.schedule('50 23 * * *', () => {

    console.log('Running scheduled task to update tasks...');
    updateTasks();
});
