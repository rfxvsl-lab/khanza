import { db } from '../../../utils/db';
export default defineEventHandler(async () => {
    const result = await db.execute("SELECT b.*, s.title as service_title, v.discount_percent as voucher_discount FROM bookings b LEFT JOIN services s ON b.service_id = s.id LEFT JOIN vouchers v ON b.voucher_code = v.code ORDER BY b.scheduled_at DESC");
    return result.rows;
});
