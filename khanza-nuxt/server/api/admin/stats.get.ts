import { db } from '../../utils/db';
export default defineEventHandler(async () => {
    const bookingsCount = await db.execute("SELECT COUNT(*) as count FROM bookings");
    const garageCount = await db.execute("SELECT COUNT(*) as count FROM garage WHERE status = 'available'");
    const vouchersCount = await db.execute("SELECT COUNT(*) as count FROM vouchers WHERE is_used = 0");
    const newsletterCount = await db.execute("SELECT COUNT(*) as count FROM newsletter_subscribers");
    return {
        total_bookings: bookingsCount.rows[0].count,
        available_cars: garageCount.rows[0].count,
        active_vouchers: vouchersCount.rows[0].count,
        newsletter_subs: newsletterCount.rows[0].count
    };
});