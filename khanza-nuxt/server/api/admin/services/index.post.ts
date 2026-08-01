import { db } from '../../../utils/db';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    await db.execute({
        sql: "INSERT INTO services (title, description, price, icon_name, image_url) VALUES (?, ?, ?, ?, ?)",
        args: [body.title, body.description, body.price, body.icon_name, body.image_url]
    });
    return { success: true };
});
