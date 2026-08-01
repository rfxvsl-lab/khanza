import { db } from '../utils/db';
export default defineEventHandler(async () => {
    const result = await db.execute("SELECT * FROM services");
    return result.rows;
});