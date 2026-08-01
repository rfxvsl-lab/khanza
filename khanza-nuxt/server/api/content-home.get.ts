import { db } from '../utils/db';
export default defineEventHandler(async () => {
    const result = await db.execute("SELECT * FROM content_home LIMIT 1");
    return result.rows[0] || {};
});