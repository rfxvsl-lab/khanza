import { db } from '../../../utils/db';
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    await db.execute({ sql: "DELETE FROM bookings WHERE id = ?", args: [id] });
    return { success: true };
});