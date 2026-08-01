import { db } from '../../../utils/db';
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    await db.execute({ sql: "UPDATE bookings SET status = ? WHERE id = ?", args: [body.status, id] });
    return { success: true };
});