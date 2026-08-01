import { setupDb } from '../utils/db';

export default defineNitroPlugin(async (nitroApp) => {
    console.log('Running database setup/seeder...');
    try {
        await setupDb();
        console.log('Database setup complete.');
    } catch (e) {
        console.error('Failed to setup database:', e);
    }
});
