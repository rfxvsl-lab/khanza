import { db } from "../../../utils/db";
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, "id");
    const body = await readBody(event);
    await db.execute({
        sql: "UPDATE garage SET car_model = ?, year = ?, price = ?, description = ?, images = ?, status = ? WHERE id = ?",
        args: [body.car_model, body.year, body.price, body.description, body.images, body.status, id]
    });
    return { success: true };
});