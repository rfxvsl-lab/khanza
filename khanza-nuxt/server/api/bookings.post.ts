import { db } from '../utils/db';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { date, service, vehicle_info, name, email, phone, voucher_code } = body;
    if (!date || !service) throw createError({ statusCode: 400, statusMessage: "Wajib diisi" });

    if (voucher_code) {
        await db.execute({ sql: "UPDATE vouchers SET is_used = 1 WHERE code = ?", args: [voucher_code] });
    }

    await db.execute({
        sql: "INSERT INTO bookings (name, email, phone, vehicle_info, service_id, scheduled_at, status, voucher_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [name || '', email || '', phone || '', vehicle_info || '', service, date, "pending", voucher_code || null],
    });
    return { success: true, message: "Reservasi dikonfirmasi" };
});