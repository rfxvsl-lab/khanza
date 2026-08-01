import { db } from '../../utils/db';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    await db.execute({
        sql: "UPDATE content_home SET title = ?, description = ?, hero_image = ? WHERE id = 1",
        args: [body.title, body.description, body.hero_image],
    });
    return { success: true };
});