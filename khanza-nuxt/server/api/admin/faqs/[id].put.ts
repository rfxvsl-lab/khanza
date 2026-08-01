import { db } from "../../../utils/db";
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);
    await db.execute({
        sql: "UPDATE faqs SET question = ?, answer = ?, display_order = ? WHERE id = ?",
        args: [body.question, body.answer, body.display_order, id]
    });
    return { success: true };
});