import { db } from '../../../utils/db';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    await db.execute({
        sql: "INSERT INTO garage (car_model, year, price, description, images, status) VALUES (?, ?, ?, ?, ?, ?)",
        args: [body.car_model, body.year, body.price, body.description, body.images, body.status]
    });
    return { success: true };
});
