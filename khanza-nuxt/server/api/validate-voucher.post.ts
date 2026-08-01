import { db } from '../utils/db';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { code } = body;
    if (!code) throw createError({ statusCode: 400, statusMessage: "Kode voucher wajib diisi" });

    const result = await db.execute({ sql: "SELECT * FROM vouchers WHERE code = ? AND is_used = 0", args: [code] });
    if (result.rows.length === 0) throw createError({ statusCode: 404, statusMessage: "Voucher tidak valid" });
    return { valid: true, discount_percent: result.rows[0].discount_percent, code: result.rows[0].code };
});