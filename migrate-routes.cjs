const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'khanza-nuxt', 'server', 'api');
const adminDir = path.join(apiDir, 'admin');

if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
if (!fs.existsSync(adminDir)) fs.mkdirSync(adminDir, { recursive: true });

function writeRoute(routePath, content) {
    fs.writeFileSync(path.join(apiDir, routePath), content);
}

// ---------------- PUBLIC ROUTES ----------------
writeRoute('settings.get.ts', `import { db } from '../utils/db';
export default defineEventHandler(async (event) => {
    try {
        const result = await db.execute("SELECT * FROM site_config");
        const settings = result.rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        return settings;
    } catch (e) {
        throw createError({ statusCode: 500, statusMessage: "Gagal memuat pengaturan" });
    }
});`);

writeRoute('claim-voucher.post.ts', `import { db } from '../utils/db';
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
});`);

writeRoute('validate-voucher.post.ts', `import { db } from '../utils/db';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const { code } = body;
    if (!code) throw createError({ statusCode: 400, statusMessage: "Kode voucher wajib diisi" });

    const result = await db.execute({ sql: "SELECT * FROM vouchers WHERE code = ? AND is_used = 0", args: [code] });
    if (result.rows.length === 0) throw createError({ statusCode: 404, statusMessage: "Voucher tidak valid" });
    return { valid: true, discount_percent: result.rows[0].discount_percent, code: result.rows[0].code };
});`);

writeRoute('voucher-status.get.ts', `import { db } from '../utils/db';
export default defineEventHandler(async () => {
    const config = await db.execute("SELECT value FROM site_config WHERE key = 'voucher_enabled'");
    const enabled = config.rows.length > 0 ? config.rows[0].value === '1' : true;
    return { enabled };
});`);

writeRoute('bookings.post.ts', `import { db } from '../utils/db';
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
});`);

writeRoute('garage.get.ts', `import { db } from '../utils/db';
export default defineEventHandler(async () => {
    const result = await db.execute("SELECT * FROM garage");
    return result.rows;
});`);

writeRoute('services.get.ts', `import { db } from '../utils/db';
export default defineEventHandler(async () => {
    const result = await db.execute("SELECT * FROM services");
    return result.rows;
});`);

writeRoute('faqs.get.ts', `import { db } from '../utils/db';
export default defineEventHandler(async () => {
    const result = await db.execute("SELECT * FROM faqs ORDER BY display_order ASC");
    return result.rows;
});`);

writeRoute('testimonials.get.ts', `import { db } from '../utils/db';
export default defineEventHandler(async () => {
    const result = await db.execute("SELECT * FROM testimonials WHERE is_approved = 1");
    return result.rows;
});`);

writeRoute('newsletter.post.ts', `import { db } from '../utils/db';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    await db.execute({ sql: "INSERT INTO newsletter_subscribers (email) VALUES (?)", args: [body.email] });
    return { success: true };
});`);

writeRoute('content-home.get.ts', `import { db } from '../utils/db';
export default defineEventHandler(async () => {
    const result = await db.execute("SELECT * FROM content_home LIMIT 1");
    return result.rows[0] || {};
});`);

// ---------------- ADMIN ROUTES ----------------
writeRoute('admin/login.post.ts', `import { db } from '../../utils/db';
import { generateToken, comparePassword } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const user = await db.execute({ sql: "SELECT * FROM users WHERE email = ? AND role = 'admin'", args: [body.email] });
    if (user.rows.length > 0 && await comparePassword(body.password, user.rows[0].password)) {
        return { success: true, token: generateToken(user.rows[0].id, body.email) };
    }
    throw createError({ statusCode: 401, statusMessage: "Invalid" });
});`);

const adminEntities = [
    { name: 'services', table: 'services', fields: ['title', 'description', 'price', 'icon_name'] },
    { name: 'faqs', table: 'faqs', fields: ['question', 'answer', 'display_order'] },
    { name: 'garage', table: 'garage', fields: ['car_model', 'year', 'price', 'description', 'images', 'status'] },
];

for (const entity of adminEntities) {
    writeRoute('admin/' + entity.name + '.post.ts', 'import { db } from "../../utils/db";\nexport default defineEventHandler(async (event) => {\n    const body = await readBody(event);\n    await db.execute({\n        sql: "INSERT INTO ' + entity.table + ' (' + entity.fields.join(', ') + ') VALUES (' + entity.fields.map(() => '?').join(', ') + ')",\n        args: [' + entity.fields.map(f => 'body.' + f).join(', ') + ']\n    });\n    return { success: true };\n});');
    writeRoute('admin/' + entity.name + '.[id].put.ts', 'import { db } from "../../utils/db";\nexport default defineEventHandler(async (event) => {\n    const id = getRouterParam(event, "id");\n    const body = await readBody(event);\n    await db.execute({\n        sql: "UPDATE ' + entity.table + ' SET ' + entity.fields.map(f => f + ' = ?').join(', ') + ' WHERE id = ?",\n        args: [' + entity.fields.map(f => 'body.' + f).join(', ') + ', id]\n    });\n    return { success: true };\n});');
    writeRoute('admin/' + entity.name + '.[id].delete.ts', 'import { db } from "../../utils/db";\nexport default defineEventHandler(async (event) => {\n    const id = getRouterParam(event, "id");\n    await db.execute({ sql: "DELETE FROM ' + entity.table + ' WHERE id = ?", args: [id] });\n    return { success: true };\n});');
}

writeRoute('admin/content-home.put.ts', `import { db } from '../../utils/db';
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    await db.execute({
        sql: "UPDATE content_home SET title = ?, description = ?, hero_image = ? WHERE id = 1",
        args: [body.title, body.description, body.hero_image],
    });
    return { success: true };
});`);

writeRoute('admin/bookings.get.ts', `import { db } from '../../utils/db';
export default defineEventHandler(async () => {
    const result = await db.execute("SELECT b.*, s.title as service_title, v.discount_percent as voucher_discount FROM bookings b LEFT JOIN services s ON b.service_id = s.id LEFT JOIN vouchers v ON b.voucher_code = v.code ORDER BY b.scheduled_at DESC");
    return result.rows;
});`);

writeRoute('admin/bookings.[id].put.ts', `import { db } from '../../utils/db';
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    await db.execute({ sql: "UPDATE bookings SET status = ? WHERE id = ?", args: [body.status, id] });
    return { success: true };
});`);

writeRoute('admin/bookings.[id].delete.ts', `import { db } from '../../utils/db';
export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    await db.execute({ sql: "DELETE FROM bookings WHERE id = ?", args: [id] });
    return { success: true };
});`);

writeRoute('admin/stats.get.ts', `import { db } from '../../utils/db';
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
});`);

console.log('Routes generated successfully.');
