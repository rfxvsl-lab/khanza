import { db } from '../../../utils/db';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    await db.execute({
        sql: "INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)",
        args: [body.question, body.answer, body.display_order]
    });
    return { success: true };
});
