import { db } from '../utils/db';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { email } = body;
    if (!email) throw createError({ statusCode: 400, statusMessage: "Email wajib diisi" });

    let discountPercent = 30;
    try {
        const discountConfig = await db.execute("SELECT value FROM site_config WHERE key = 'voucher_default_discount'");
        if (discountConfig.rows.length > 0) discountPercent = parseInt(discountConfig.rows[0].value) || 30;
    } catch (e) { }

    const code = "KHANZA" + discountPercent + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
        await db.execute({
            sql: "INSERT INTO vouchers (code, discount_percent, email_claimed, is_used) VALUES (?, ?, ?, ?)",
            args: [code, discountPercent, email, false],
        });
        return { success: true, code, discount: discountPercent };
    } catch (e) {
        throw createError({ statusCode: 500, statusMessage: "Terjadi kesalahan server" });
    }
});