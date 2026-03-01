import express from "express";
import helmet from "helmet";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createClient } from "@libsql/client/web";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// ============ CONFIG (all inline, no external imports) ============

const JWT_SECRET = process.env.JWT_SECRET || 'khanza-repaint-secret-key';

// Turso web client (pure HTTP, no native modules)
const db = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

// ============ AUTH HELPERS ============

function generateToken(userId: number, email: string): string {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });
}
function verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET);
}
async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}
async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
        (req as any).user = verifyToken(token);
        next();
    } catch (e) { res.status(401).json({ error: "Invalid or expired token" }); }
};

// ============ EXPRESS APP ============

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// ============ DB INIT (lazy, once) ============

let dbReady = false;
async function initDB() {
    if (dbReady) return;
    await db.execute(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, role TEXT)`);
    await db.execute(`CREATE TABLE IF NOT EXISTS site_config (key TEXT PRIMARY KEY, value TEXT)`);
    await db.execute(`CREATE TABLE IF NOT EXISTS content_home (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, hero_image TEXT)`);
    await db.execute(`CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, phone TEXT, vehicle_info TEXT, service_id INTEGER, scheduled_at TEXT, status TEXT, voucher_code TEXT, created_at TEXT DEFAULT (datetime('now')))`);
    await db.execute(`CREATE TABLE IF NOT EXISTS garage (id INTEGER PRIMARY KEY AUTOINCREMENT, car_model TEXT, year INTEGER, price TEXT, description TEXT, images TEXT, status TEXT)`);
    await db.execute(`CREATE TABLE IF NOT EXISTS testimonials (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, review TEXT, rating INTEGER, is_approved BOOLEAN, profile_photo TEXT, service_ordered TEXT)`);
    await db.execute(`CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, price TEXT, icon_name TEXT)`);
    await db.execute(`CREATE TABLE IF NOT EXISTS faqs (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, answer TEXT, display_order INTEGER DEFAULT 0)`);
    await db.execute(`CREATE TABLE IF NOT EXISTS vouchers (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE, discount_percent INTEGER, email_claimed TEXT, is_used BOOLEAN)`);
    await db.execute(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, subscribed_at TEXT DEFAULT (datetime('now')))`);
    await db.execute(`CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, booking_id INTEGER, items TEXT, voucher_code TEXT, discount_percent INTEGER DEFAULT 0, subtotal REAL DEFAULT 0, total REAL DEFAULT 0, payment_status TEXT DEFAULT 'LUNAS', dp_amount REAL DEFAULT 0, remaining_amount REAL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')))`);

    const migrations = [
        { table: 'invoices', col: 'payment_status', type: "TEXT DEFAULT 'LUNAS'" },
        { table: 'invoices', col: 'dp_amount', type: 'REAL DEFAULT 0' },
        { table: 'invoices', col: 'remaining_amount', type: 'REAL DEFAULT 0' },
    ];
    for (const m of migrations) { try { await db.execute(`ALTER TABLE ${m.table} ADD COLUMN ${m.col} ${m.type}`); } catch (e) { } }

    try { await db.execute("INSERT INTO site_config (key, value) VALUES ('voucher_enabled', '1')"); } catch (e) { }
    try { await db.execute("INSERT INTO site_config (key, value) VALUES ('site_name', 'Khanza Repaint')"); } catch (e) { }
    try { await db.execute("INSERT INTO site_config (key, value) VALUES ('logo_url', '')"); } catch (e) { }
    try { await db.execute("INSERT INTO site_config (key, value) VALUES ('footer_text', 'Premium automotive painting services.')"); } catch (e) { }

    // Admin seed
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        const adminPass = process.env.ADMIN_PASSWORD || "admin123";
        const hashed = await hashPassword(adminPass);
        const existing = await db.execute({ sql: "SELECT id FROM users WHERE email = ? AND role = 'admin'", args: [adminEmail] });
        if (existing.rows.length === 0) {
            await db.execute({ sql: "INSERT INTO users (email, password, role) VALUES (?, ?, ?)", args: [adminEmail, hashed, "admin"] });
        }
    } catch (e) { }

    // Content home seed
    try {
        const c = await db.execute("SELECT COUNT(*) as count FROM content_home");
        if ((c.rows[0] as any).count === 0) {
            await db.execute({ sql: "INSERT INTO content_home (title, description, hero_image) VALUES (?, ?, ?)", args: ["Mendefinisikan Ulang Kesempurnaan Otomotif", "Layanan cat mobil premium dan restorasi otomotif.", ""] });
        }
    } catch (e) { }

    dbReady = true;
    console.log('[Vercel] DB ready');
}

app.use(async (req, res, next) => {
    try { await initDB(); next(); }
    catch (err: any) { console.error('[DB Error]', err); res.status(500).json({ error: "DB init failed", details: err?.message }); }
});

// ============ PUBLIC ROUTES ============

app.get("/api/settings", async (req, res) => {
    try {
        const r = await db.execute("SELECT * FROM site_config");
        const s = r.rows.reduce((a: any, row: any) => { a[row.key] = row.value; return a; }, {});
        res.json(s);
    } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/content-home", async (req, res) => {
    try { res.json((await db.execute("SELECT * FROM content_home WHERE id = 1")).rows[0] || {}); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/services", async (req, res) => {
    try { res.json((await db.execute("SELECT * FROM services ORDER BY id ASC")).rows); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/faqs", async (req, res) => {
    try { res.json((await db.execute("SELECT * FROM faqs ORDER BY display_order ASC")).rows); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/garage", async (req, res) => {
    try { res.json((await db.execute("SELECT * FROM garage ORDER BY id DESC")).rows); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/testimonials", async (req, res) => {
    try { res.json((await db.execute("SELECT * FROM testimonials WHERE is_approved = 1 ORDER BY id DESC")).rows); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/voucher-status", async (req, res) => {
    try {
        const c = await db.execute("SELECT value FROM site_config WHERE key = 'voucher_enabled'");
        res.json({ enabled: c.rows.length > 0 ? (c.rows[0] as any).value === '1' : true });
    } catch (e) { res.json({ enabled: true }); }
});

app.post("/api/claim-voucher", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email wajib diisi" });
    try {
        const cfg = await db.execute("SELECT value FROM site_config WHERE key = 'voucher_enabled'");
        if (cfg.rows.length > 0 && (cfg.rows[0] as any).value === '0') return res.status(400).json({ error: "Fitur voucher sedang tidak aktif" });

        // Pengecekan 1 Email 1 Voucher
        const checkEmail = await db.execute({ sql: "SELECT id FROM vouchers WHERE email_claimed = ?", args: [email] });
        if (checkEmail.rows.length > 0) return res.status(400).json({ inline_error: "Email ini sudah pernah mengklaim voucher. 1 Email hanya bisa klaim 1x." });

        let disc = 30;
        try { const d = await db.execute("SELECT value FROM site_config WHERE key = 'voucher_default_discount'"); if (d.rows.length > 0) disc = parseInt((d.rows[0] as any).value) || 30; } catch (e) { }
        const code = 'KHANZA' + disc + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        await db.execute({ sql: "INSERT INTO vouchers (code, discount_percent, email_claimed, is_used) VALUES (?, ?, ?, 0)", args: [code, disc, email] });
        try { await db.execute({ sql: "INSERT INTO newsletter_subscribers (email) VALUES (?)", args: [email] }); } catch (e) { }
        res.json({ code, discount: disc });
    } catch (e) { res.status(500).json({ error: "Gagal membuat voucher" }); }
});

app.post("/api/validate-voucher", async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Kode voucher wajib diisi" });
    try {
        const r = await db.execute({ sql: "SELECT * FROM vouchers WHERE code = ? AND is_used = 0", args: [code] });
        if (r.rows.length === 0) return res.status(404).json({ error: "Voucher tidak valid" });
        res.json({ valid: true, discount_percent: (r.rows[0] as any).discount_percent, code: (r.rows[0] as any).code });
    } catch (e) { res.status(500).json({ error: "Server error" }); }
});

app.post("/api/bookings", async (req, res) => {
    const { name, email, phone, vehicle_info, service_id, scheduled_at, voucher_code } = req.body;
    try {
        if (voucher_code) await db.execute({ sql: "UPDATE vouchers SET is_used = 1 WHERE code = ?", args: [voucher_code] });
        await db.execute({ sql: "INSERT INTO bookings (name, email, phone, vehicle_info, service_id, scheduled_at, status, voucher_code) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)", args: [name, email, phone, vehicle_info, service_id, scheduled_at, voucher_code || null] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal membuat reservasi" }); }
});

app.post("/api/testimonials/submit", upload.single('profile_photo'), async (req, res) => {
    const { name, review, rating, service_ordered } = req.body;
    let photoUrl = '';
    if (req.file) {
        try {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const r = await cloudinary.uploader.upload("data:" + req.file.mimetype + ";base64," + b64, { folder: 'khanzarepaint/testimonials', transformation: [{ width: 200, height: 200, crop: 'fill' }] });
            photoUrl = r.secure_url;
        } catch (e) { }
    }
    try {
        await db.execute({ sql: "INSERT INTO testimonials (name, review, rating, is_approved, profile_photo, service_ordered) VALUES (?, ?, ?, 0, ?, ?)", args: [name, review, parseInt(rating) || 5, photoUrl, service_ordered || ''] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal mengirim testimoni" }); }
});

app.post("/api/newsletter", async (req, res) => {
    const { email } = req.body;
    try { await db.execute({ sql: "INSERT INTO newsletter_subscribers (email) VALUES (?)", args: [email] }); res.json({ success: true }); }
    catch (e: any) { if (e?.message?.includes('UNIQUE')) return res.status(400).json({ error: "Email sudah terdaftar" }); res.status(500).json({ error: "Gagal" }); }
});

// ============ ADMIN ROUTES ============

app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const u = await db.execute({ sql: "SELECT * FROM users WHERE email = ? AND role = 'admin'", args: [email] });
        if (u.rows.length > 0) {
            const valid = await comparePassword(password, (u.rows[0] as any).password);
            if (valid) return res.json({ success: true, token: generateToken((u.rows[0] as any).id, email) });
        }
        res.status(401).json({ error: "Kredensial tidak valid" });
    } catch (e) { res.status(500).json({ error: "Server error" }); }
});

app.post("/api/admin/upload", requireAdmin, upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const r = await cloudinary.uploader.upload("data:" + req.file.mimetype + ";base64," + b64, { folder: 'khanzarepaint' });
        res.json({ url: r.secure_url });
    } catch (e) { res.status(500).json({ error: 'Upload failed' }); }
});

app.put("/api/admin/content-home", requireAdmin, async (req, res) => {
    const { title, description, hero_image } = req.body;
    try { await db.execute({ sql: "UPDATE content_home SET title = ?, description = ?, hero_image = ? WHERE id = 1", args: [title, description, hero_image] }); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/admin/bookings", requireAdmin, async (req, res) => {
    try { res.json((await db.execute("SELECT b.*, s.title as service_title, v.discount_percent as voucher_discount FROM bookings b LEFT JOIN services s ON b.service_id = s.id LEFT JOIN vouchers v ON b.voucher_code = v.code ORDER BY b.scheduled_at DESC")).rows); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.put("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "UPDATE bookings SET status = ? WHERE id = ?", args: [req.body.status, req.params.id] }); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.delete("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM bookings WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
        const [b, g, v, n] = await Promise.all([
            db.execute("SELECT COUNT(*) as count FROM bookings"),
            db.execute("SELECT COUNT(*) as count FROM garage WHERE status = 'available'"),
            db.execute("SELECT COUNT(*) as count FROM vouchers WHERE is_used = 0"),
            db.execute("SELECT COUNT(*) as count FROM newsletter_subscribers"),
        ]);
        res.json({ total_bookings: (b.rows[0] as any).count, available_cars: (g.rows[0] as any).count, active_vouchers: (v.rows[0] as any).count, newsletter_subs: (n.rows[0] as any).count });
    } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/admin/testimonials", requireAdmin, async (req, res) => {
    try { res.json((await db.execute("SELECT * FROM testimonials ORDER BY id DESC")).rows); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.post("/api/testimonials", requireAdmin, async (req, res) => {
    const { name, review, rating, is_approved, service_ordered } = req.body;
    try { await db.execute({ sql: "INSERT INTO testimonials (name, review, rating, is_approved, service_ordered) VALUES (?, ?, ?, ?, ?)", args: [name, review, rating, is_approved ? 1 : 0, service_ordered || ''] }); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.put("/api/testimonials/:id", requireAdmin, async (req, res) => {
    const { name, review, rating, is_approved, service_ordered } = req.body;
    try { await db.execute({ sql: "UPDATE testimonials SET name = ?, review = ?, rating = ?, is_approved = ?, service_ordered = ? WHERE id = ?", args: [name, review, rating, is_approved ? 1 : 0, service_ordered || '', req.params.id] }); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.delete("/api/testimonials/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM testimonials WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.put("/api/settings", requireAdmin, async (req, res) => {
    const { site_name, logo_url, footer_text } = req.body;
    try {
        await db.execute({ sql: "UPDATE site_config SET value = ? WHERE key = 'site_name'", args: [site_name] });
        await db.execute({ sql: "UPDATE site_config SET value = ? WHERE key = 'logo_url'", args: [logo_url] });
        await db.execute({ sql: "UPDATE site_config SET value = ? WHERE key = 'footer_text'", args: [footer_text] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.post("/api/services", requireAdmin, async (req, res) => {
    const { title, description, price, icon_name } = req.body;
    try { await db.execute({ sql: "INSERT INTO services (title, description, price, icon_name) VALUES (?, ?, ?, ?)", args: [title, description, price, icon_name] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.put("/api/services/:id", requireAdmin, async (req, res) => {
    const { title, description, price, icon_name } = req.body;
    try { await db.execute({ sql: "UPDATE services SET title = ?, description = ?, price = ?, icon_name = ? WHERE id = ?", args: [title, description, price, icon_name, req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.delete("/api/services/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM services WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.post("/api/faqs", requireAdmin, async (req, res) => {
    const { question, answer, display_order } = req.body;
    try { await db.execute({ sql: "INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)", args: [question, answer, display_order || 0] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.put("/api/faqs/:id", requireAdmin, async (req, res) => {
    const { question, answer, display_order } = req.body;
    try { await db.execute({ sql: "UPDATE faqs SET question = ?, answer = ?, display_order = ? WHERE id = ?", args: [question, answer, display_order || 0, req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.delete("/api/faqs/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM faqs WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.post("/api/garage", requireAdmin, async (req, res) => {
    const { car_model, year, price, description, images, status } = req.body;
    try { await db.execute({ sql: "INSERT INTO garage (car_model, year, price, description, images, status) VALUES (?, ?, ?, ?, ?, ?)", args: [car_model, year, price, description, images, status || 'available'] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.put("/api/garage/:id", requireAdmin, async (req, res) => {
    const { car_model, year, price, description, images, status } = req.body;
    try { await db.execute({ sql: "UPDATE garage SET car_model = ?, year = ?, price = ?, description = ?, images = ?, status = ? WHERE id = ?", args: [car_model, year, price, description, images, status, req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.delete("/api/garage/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM garage WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/admin/newsletters", requireAdmin, async (req, res) => {
    try { res.json((await db.execute("SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC")).rows); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.delete("/api/admin/newsletters/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM newsletter_subscribers WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/admin/vouchers", requireAdmin, async (req, res) => {
    try {
        const [r, c, d] = await Promise.all([
            db.execute("SELECT * FROM vouchers ORDER BY id DESC"),
            db.execute("SELECT value FROM site_config WHERE key = 'voucher_enabled'"),
            db.execute("SELECT value FROM site_config WHERE key = 'voucher_default_discount'"),
        ]);
        res.json({ vouchers: r.rows, enabled: c.rows.length > 0 ? (c.rows[0] as any).value === '1' : true, default_discount: d.rows.length > 0 ? parseInt((d.rows[0] as any).value) : 30 });
    } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.put("/api/admin/voucher-toggle", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "INSERT INTO site_config (key, value) VALUES ('voucher_enabled', ?) ON CONFLICT(key) DO UPDATE SET value = ?", args: [req.body.enabled ? '1' : '0', req.body.enabled ? '1' : '0'] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.put("/api/admin/voucher-discount", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "INSERT INTO site_config (key, value) VALUES ('voucher_default_discount', ?) ON CONFLICT(key) DO UPDATE SET value = ?", args: [String(req.body.discount), String(req.body.discount)] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.delete("/api/admin/vouchers/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM vouchers WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/admin/invoices", requireAdmin, async (req, res) => {
    try { res.json((await db.execute("SELECT i.*, b.name as client_name, b.email as client_email, b.vehicle_info, b.scheduled_at, s.title as service_title FROM invoices i LEFT JOIN bookings b ON i.booking_id = b.id LEFT JOIN services s ON b.service_id = s.id ORDER BY i.created_at DESC")).rows); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.get("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    try {
        const r = await db.execute({ sql: "SELECT i.*, b.name as client_name, b.email as client_email, b.phone as client_phone, b.vehicle_info, b.scheduled_at, b.voucher_code as booking_voucher, s.title as service_title, s.price as service_price FROM invoices i LEFT JOIN bookings b ON i.booking_id = b.id LEFT JOIN services s ON b.service_id = s.id WHERE i.id = ?", args: [req.params.id] });
        if (r.rows.length === 0) return res.status(404).json({ error: "Not found" });
        res.json(r.rows[0]);
    } catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.post("/api/admin/invoices", requireAdmin, async (req, res) => {
    const { booking_id, items, voucher_code, discount_percent, subtotal, total, payment_status, dp_amount, remaining_amount } = req.body;
    try { await db.execute({ sql: "INSERT INTO invoices (booking_id, items, voucher_code, discount_percent, subtotal, total, payment_status, dp_amount, remaining_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [booking_id, JSON.stringify(items), voucher_code || null, discount_percent || 0, subtotal || 0, total || 0, payment_status || 'LUNAS', dp_amount || 0, remaining_amount || 0] }); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.put("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    const { items, voucher_code, discount_percent, subtotal, total, payment_status, dp_amount, remaining_amount } = req.body;
    try { await db.execute({ sql: "UPDATE invoices SET items = ?, voucher_code = ?, discount_percent = ?, subtotal = ?, total = ?, payment_status = ?, dp_amount = ?, remaining_amount = ? WHERE id = ?", args: [JSON.stringify(items), voucher_code || null, discount_percent || 0, subtotal || 0, total || 0, payment_status || 'LUNAS', dp_amount || 0, remaining_amount || 0, req.params.id] }); res.json({ success: true }); }
    catch (e) { res.status(500).json({ error: "Failed" }); }
});
app.delete("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM invoices WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('[Error]', err);
    res.status(500).json({ error: "Internal server error" });
});

export default app;
