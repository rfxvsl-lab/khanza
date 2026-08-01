import { db } from '../utils/db';
export default defineEventHandler(async () => {
    const result = await db.execute("SELECT * FROM faqs ORDER BY display_order ASC");
    return result.rows;
});