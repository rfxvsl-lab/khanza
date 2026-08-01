import { db } from "../../../utils/db";
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);
    await db.execute({
        sql: "UPDATE services SET title = ?, description = ?, price = ?, icon_name = ?, image_url = ? WHERE id = ?",
        args: [body.title, body.description, body.price, body.icon_name, body.image_url, id]
    });
    return { success: true };
});