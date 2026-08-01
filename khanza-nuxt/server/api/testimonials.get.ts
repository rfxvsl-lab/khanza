import { db } from '../utils/db';
export default defineEventHandler(async () => {
    const result = await db.execute("SELECT * FROM testimonials WHERE is_approved = 1");
    return result.rows;
});