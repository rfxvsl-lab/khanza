import { db } from '../utils/db';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    await db.execute({ sql: "INSERT INTO newsletter_subscribers (email) VALUES (?)", args: [body.email] });
    return { success: true };
});