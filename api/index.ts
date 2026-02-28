import express from "express";
import helmet from "helmet";
import cors from "cors";

// Use the web-compatible database client (no native modules)
// We override the db module before importing routes
import { db } from "../server/config/database.web";

// Manually run setupDb and seeders using the web db
import { hashPassword } from "../server/middleware/auth";

const app = express();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Database setup function (same as database.ts setupDb but using web db)
let dbInitialized = false;

async function setupAndSeed() {
    if (dbInitialized) return;

    console.log('[Vercel] Starting DB init...');
    console.log('[Vercel] TURSO_URL:', process.env.TURSO_CONNECTION_URL ? 'SET' : 'NOT SET');
    console.log('[Vercel] TURSO_TOKEN:', process.env.TURSO_AUTH_TOKEN ? 'SET' : 'NOT SET');

    // Create tables
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

    // Migration columns
    const migrations = [
        { table: 'invoices', col: 'payment_status', type: "TEXT DEFAULT 'LUNAS'" },
        { table: 'invoices', col: 'dp_amount', type: 'REAL DEFAULT 0' },
        { table: 'invoices', col: 'remaining_amount', type: 'REAL DEFAULT 0' },
    ];
    for (const m of migrations) {
        try { await db.execute(`ALTER TABLE ${m.table} ADD COLUMN ${m.col} ${m.type}`); } catch (e) { /* exists */ }
    }

    // Seed voucher_enabled config
    try { await db.execute({ sql: "INSERT INTO site_config (key, value) VALUES ('voucher_enabled', '1')", args: [] }); } catch (e) { /* exists */ }

    // Admin seeder
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
        const adminPass = process.env.ADMIN_PASSWORD || "admin123";
        const hashedPassword = await hashPassword(adminPass);
        const existing = await db.execute({ sql: "SELECT id FROM users WHERE email = ? AND role = 'admin'", args: [adminEmail] });
        if (existing.rows.length === 0) {
            await db.execute({ sql: "INSERT INTO users (email, password, role) VALUES (?, ?, ?)", args: [adminEmail, hashedPassword, "admin"] });
        }
    } catch (e) { console.error('[Vercel] Admin seed error:', e); }

    // Site config seeder
    try {
        const configCount = await db.execute("SELECT COUNT(*) as count FROM site_config");
        if ((configCount.rows[0] as any).count <= 1) {
            try { await db.execute("INSERT INTO site_config (key, value) VALUES ('site_name', 'Khanza Repaint')"); } catch (e) { }
            try { await db.execute("INSERT INTO site_config (key, value) VALUES ('logo_url', '')"); } catch (e) { }
            try { await db.execute("INSERT INTO site_config (key, value) VALUES ('footer_text', 'Premium automotive painting services.')"); } catch (e) { }
        }
    } catch (e) { }

    // Content home seeder
    try {
        const chCount = await db.execute("SELECT COUNT(*) as count FROM content_home");
        if ((chCount.rows[0] as any).count === 0) {
            await db.execute({ sql: "INSERT INTO content_home (title, description, hero_image) VALUES (?, ?, ?)", args: ["Mendefinisikan Ulang Kesempurnaan Otomotif", "Layanan cat mobil premium dan restorasi otomotif.", ""] });
        }
    } catch (e) { }

    dbInitialized = true;
    console.log('[Vercel] DB initialized successfully');
}

// Initialize DB on first request
app.use(async (req, res, next) => {
    try {
        await setupAndSeed();
        next();
    } catch (err: any) {
        console.error('[Vercel] DB init error:', err);
        res.status(500).json({ error: "Database initialization failed", details: err?.message });
    }
});

// Now we need to import routes but override their db reference
// Since routes import from ../server/config/database, we need to make that work
// The simplest approach: re-export db from a shared location

// Import routes - they'll use their own db import, so we need to patch
// Actually, routes import { db } from '../config/database' which uses the standard client
// For Vercel, we need routes to use the web client instead

// Solution: Create a module alias or just import routes and let them use the web client
// Since ES modules cache, if we import database.web first, we can patch it

// The clean solution: import routes that use our web db
import { Router } from "express";
import { requireAdmin, generateToken, comparePassword } from "../server/middleware/auth";
import { cloudinary } from "../server/config/cloudinary";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// ============ PUBLIC ROUTES ============
const publicRouter = Router();

// Settings
publicRouter.get("/api/settings", async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM site_config");
        const settings = result.rows.reduce((acc: any, row: any) => { acc[row.key] = row.value; return acc; }, {});
        res.json(settings);
    } catch (e) { res.status(500).json({ error: "Gagal memuat pengaturan" }); }
});

// Content Home
publicRouter.get("/api/content-home", async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM content_home WHERE id = 1");
        res.json(result.rows[0] || { title: '', description: '', hero_image: '' });
    } catch (e) { res.status(500).json({ error: "Gagal memuat konten" }); }
});

// Services
publicRouter.get("/api/services", async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM services ORDER BY id ASC");
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: "Gagal memuat layanan" }); }
});

// FAQs
publicRouter.get("/api/faqs", async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM faqs ORDER BY display_order ASC");
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: "Gagal memuat FAQ" }); }
});

// Garage
publicRouter.get("/api/garage", async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM garage ORDER BY id DESC");
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: "Gagal memuat galeri" }); }
});

// Testimonials
publicRouter.get("/api/testimonials", async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM testimonials WHERE is_approved = 1 ORDER BY id DESC");
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: "Gagal memuat testimoni" }); }
});

// Claim voucher
publicRouter.post("/api/claim-voucher", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email wajib diisi" });
    try {
        const config = await db.execute({ sql: "SELECT value FROM site_config WHERE key = 'voucher_enabled'", args: [] });
        if (config.rows.length > 0 && (config.rows[0] as any).value === '0') return res.status(400).json({ error: "Fitur voucher sedang tidak aktif" });

        let discountPercent = 30;
        try {
            const dc = await db.execute({ sql: "SELECT value FROM site_config WHERE key = 'voucher_default_discount'", args: [] });
            if (dc.rows.length > 0) discountPercent = parseInt((dc.rows[0] as any).value) || 30;
        } catch (e) { }

        const code = 'KHANZA' + discountPercent + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        await db.execute({ sql: "INSERT INTO vouchers (code, discount_percent, email_claimed, is_used) VALUES (?, ?, ?, 0)", args: [code, discountPercent, email] });
        try { await db.execute({ sql: "INSERT INTO newsletter_subscribers (email) VALUES (?)", args: [email] }); } catch (e) { }
        res.json({ code, discount: discountPercent });
    } catch (e) { res.status(500).json({ error: "Gagal membuat voucher" }); }
});

// Validate voucher
publicRouter.post("/api/validate-voucher", async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Kode voucher wajib diisi" });
    try {
        const result = await db.execute({ sql: "SELECT * FROM vouchers WHERE code = ? AND is_used = 0", args: [code] });
        if (result.rows.length === 0) return res.status(404).json({ error: "Voucher tidak valid atau sudah digunakan" });
        res.json({ valid: true, discount_percent: (result.rows[0] as any).discount_percent, code: (result.rows[0] as any).code });
    } catch (e) { res.status(500).json({ error: "Terjadi kesalahan server" }); }
});

// Voucher status
publicRouter.get("/api/voucher-status", async (req, res) => {
    try {
        const config = await db.execute({ sql: "SELECT value FROM site_config WHERE key = 'voucher_enabled'", args: [] });
        const enabled = config.rows.length > 0 ? (config.rows[0] as any).value === '1' : true;
        res.json({ enabled });
    } catch (e) { res.json({ enabled: true }); }
});

// Submit booking
publicRouter.post("/api/bookings", async (req, res) => {
    const { name, email, phone, vehicle_info, service_id, scheduled_at, voucher_code } = req.body;
    try {
        if (voucher_code) {
            await db.execute({ sql: "UPDATE vouchers SET is_used = 1 WHERE code = ?", args: [voucher_code] });
        }
        await db.execute({ sql: "INSERT INTO bookings (name, email, phone, vehicle_info, service_id, scheduled_at, status, voucher_code) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)", args: [name, email, phone, vehicle_info, service_id, scheduled_at, voucher_code || null] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal membuat reservasi" }); }
});

// Submit testimonial
publicRouter.post("/api/testimonials/submit", upload.single('profile_photo'), async (req, res) => {
    const { name, review, rating, service_ordered } = req.body;
    let photoUrl = '';
    if (req.file) {
        try {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, { folder: 'khanzarepaint/testimonials', transformation: [{ width: 200, height: 200, crop: 'fill' }] });
            photoUrl = result.secure_url;
        } catch (e) { console.error('Upload error:', e); }
    }
    try {
        await db.execute({ sql: "INSERT INTO testimonials (name, review, rating, is_approved, profile_photo, service_ordered) VALUES (?, ?, ?, 0, ?, ?)", args: [name, review, parseInt(rating) || 5, photoUrl, service_ordered || ''] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal mengirim testimoni" }); }
});

// Newsletter
publicRouter.post("/api/newsletter", async (req, res) => {
    const { email } = req.body;
    try {
        await db.execute({ sql: "INSERT INTO newsletter_subscribers (email) VALUES (?)", args: [email] });
        res.json({ success: true });
    } catch (e: any) {
        if (e?.message?.includes('UNIQUE')) return res.status(400).json({ error: "Email sudah terdaftar" });
        res.status(500).json({ error: "Gagal mendaftar" });
    }
});

app.use(publicRouter);

// ============ ADMIN ROUTES ============
const adminRouter = Router();

// Admin Login
adminRouter.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.execute({ sql: "SELECT * FROM users WHERE email = ? AND role = 'admin'", args: [email] });
        if (user.rows.length > 0) {
            const isValid = await comparePassword(password, (user.rows[0] as any).password);
            if (isValid) {
                const token = generateToken((user.rows[0] as any).id, email);
                return res.json({ success: true, token });
            }
        }
        res.status(401).json({ error: "Kredensial tidak valid" });
    } catch (e) { res.status(500).json({ error: "Kesalahan server" }); }
});

// Admin Upload
adminRouter.post("/api/admin/upload", requireAdmin, upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file gambar' });
    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const result = await cloudinary.uploader.upload(dataURI, { folder: 'khanzarepaint' });
        res.json({ url: result.secure_url });
    } catch (e) { res.status(500).json({ error: 'Gagal mengunggah gambar' }); }
});

// Content Home
adminRouter.put("/api/admin/content-home", requireAdmin, async (req, res) => {
    const { title, description, hero_image } = req.body;
    try {
        await db.execute({ sql: "UPDATE content_home SET title = ?, description = ?, hero_image = ? WHERE id = 1", args: [title, description, hero_image] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal memperbarui konten" }); }
});

// Bookings
adminRouter.get("/api/admin/bookings", requireAdmin, async (req, res) => {
    try {
        const result = await db.execute(`SELECT b.*, s.title as service_title, v.discount_percent as voucher_discount FROM bookings b LEFT JOIN services s ON b.service_id = s.id LEFT JOIN vouchers v ON b.voucher_code = v.code ORDER BY b.scheduled_at DESC`);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: "Gagal memuat reservasi" }); }
});

adminRouter.put("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
    try {
        await db.execute({ sql: "UPDATE bookings SET status = ? WHERE id = ?", args: [req.body.status, req.params.id] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal memperbarui reservasi" }); }
});

adminRouter.delete("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
    try {
        await db.execute({ sql: "DELETE FROM bookings WHERE id = ?", args: [req.params.id] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menghapus reservasi" }); }
});

// Stats
adminRouter.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
        const b = await db.execute("SELECT COUNT(*) as count FROM bookings");
        const g = await db.execute("SELECT COUNT(*) as count FROM garage WHERE status = 'available'");
        const v = await db.execute("SELECT COUNT(*) as count FROM vouchers WHERE is_used = 0");
        const n = await db.execute("SELECT COUNT(*) as count FROM newsletter_subscribers");
        res.json({ total_bookings: (b.rows[0] as any).count, available_cars: (g.rows[0] as any).count, active_vouchers: (v.rows[0] as any).count, newsletter_subs: (n.rows[0] as any).count });
    } catch (e) { res.status(500).json({ error: "Gagal memuat statistik" }); }
});

// Testimonials CRUD
adminRouter.get("/api/admin/testimonials", requireAdmin, async (req, res) => {
    try { res.json((await db.execute("SELECT * FROM testimonials ORDER BY id DESC")).rows); } catch (e) { res.status(500).json({ error: "Gagal memuat testimoni" }); }
});
adminRouter.post("/api/testimonials", requireAdmin, async (req, res) => {
    const { name, review, rating, is_approved, service_ordered } = req.body;
    try {
        await db.execute({ sql: "INSERT INTO testimonials (name, review, rating, is_approved, service_ordered) VALUES (?, ?, ?, ?, ?)", args: [name, review, rating, is_approved ? 1 : 0, service_ordered || ''] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menambah testimoni" }); }
});
adminRouter.put("/api/testimonials/:id", requireAdmin, async (req, res) => {
    const { name, review, rating, is_approved, service_ordered } = req.body;
    try {
        await db.execute({ sql: "UPDATE testimonials SET name = ?, review = ?, rating = ?, is_approved = ?, service_ordered = ? WHERE id = ?", args: [name, review, rating, is_approved ? 1 : 0, service_ordered || '', req.params.id] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal memperbarui testimoni" }); }
});
adminRouter.delete("/api/testimonials/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM testimonials WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal menghapus testimoni" }); }
});

// Settings
adminRouter.put("/api/settings", requireAdmin, async (req, res) => {
    const { site_name, logo_url, footer_text } = req.body;
    try {
        await db.execute({ sql: "UPDATE site_config SET value = ? WHERE key = 'site_name'", args: [site_name] });
        await db.execute({ sql: "UPDATE site_config SET value = ? WHERE key = 'logo_url'", args: [logo_url] });
        await db.execute({ sql: "UPDATE site_config SET value = ? WHERE key = 'footer_text'", args: [footer_text] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal memperbarui pengaturan" }); }
});

// Services CRUD
adminRouter.post("/api/services", requireAdmin, async (req, res) => {
    const { title, description, price, icon_name } = req.body;
    try { await db.execute({ sql: "INSERT INTO services (title, description, price, icon_name) VALUES (?, ?, ?, ?)", args: [title, description, price, icon_name] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal menambah layanan" }); }
});
adminRouter.put("/api/services/:id", requireAdmin, async (req, res) => {
    const { title, description, price, icon_name } = req.body;
    try { await db.execute({ sql: "UPDATE services SET title = ?, description = ?, price = ?, icon_name = ? WHERE id = ?", args: [title, description, price, icon_name, req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal memperbarui layanan" }); }
});
adminRouter.delete("/api/services/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM services WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal menghapus layanan" }); }
});

// FAQs CRUD
adminRouter.post("/api/faqs", requireAdmin, async (req, res) => {
    const { question, answer, display_order } = req.body;
    try { await db.execute({ sql: "INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)", args: [question, answer, display_order || 0] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal menambah FAQ" }); }
});
adminRouter.put("/api/faqs/:id", requireAdmin, async (req, res) => {
    const { question, answer, display_order } = req.body;
    try { await db.execute({ sql: "UPDATE faqs SET question = ?, answer = ?, display_order = ? WHERE id = ?", args: [question, answer, display_order || 0, req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal memperbarui FAQ" }); }
});
adminRouter.delete("/api/faqs/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM faqs WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal menghapus FAQ" }); }
});

// Garage CRUD
adminRouter.post("/api/garage", requireAdmin, async (req, res) => {
    const { car_model, year, price, description, images, status } = req.body;
    try { await db.execute({ sql: "INSERT INTO garage (car_model, year, price, description, images, status) VALUES (?, ?, ?, ?, ?, ?)", args: [car_model, year, price, description, images, status || 'available'] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal menambah kendaraan" }); }
});
adminRouter.put("/api/garage/:id", requireAdmin, async (req, res) => {
    const { car_model, year, price, description, images, status } = req.body;
    try { await db.execute({ sql: "UPDATE garage SET car_model = ?, year = ?, price = ?, description = ?, images = ?, status = ? WHERE id = ?", args: [car_model, year, price, description, images, status, req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal memperbarui kendaraan" }); }
});
adminRouter.delete("/api/garage/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM garage WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal menghapus kendaraan" }); }
});

// Newsletter Admin
adminRouter.get("/api/admin/newsletters", requireAdmin, async (req, res) => {
    try { res.json((await db.execute("SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC")).rows); } catch (e) { res.status(500).json({ error: "Gagal memuat subscriber" }); }
});
adminRouter.delete("/api/admin/newsletters/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM newsletter_subscribers WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal menghapus subscriber" }); }
});

// Voucher Admin
adminRouter.get("/api/admin/vouchers", requireAdmin, async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM vouchers ORDER BY id DESC");
        const config = await db.execute("SELECT value FROM site_config WHERE key = 'voucher_enabled'");
        const dcConfig = await db.execute("SELECT value FROM site_config WHERE key = 'voucher_default_discount'");
        res.json({ vouchers: result.rows, enabled: config.rows.length > 0 ? (config.rows[0] as any).value === '1' : true, default_discount: dcConfig.rows.length > 0 ? parseInt((dcConfig.rows[0] as any).value) : 30 });
    } catch (e) { res.status(500).json({ error: "Gagal memuat voucher" }); }
});
adminRouter.put("/api/admin/voucher-toggle", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "INSERT INTO site_config (key, value) VALUES ('voucher_enabled', ?) ON CONFLICT(key) DO UPDATE SET value = ?", args: [req.body.enabled ? '1' : '0', req.body.enabled ? '1' : '0'] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal" }); }
});
adminRouter.put("/api/admin/voucher-discount", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "INSERT INTO site_config (key, value) VALUES ('voucher_default_discount', ?) ON CONFLICT(key) DO UPDATE SET value = ?", args: [String(req.body.discount), String(req.body.discount)] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal" }); }
});
adminRouter.delete("/api/admin/vouchers/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM vouchers WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal menghapus voucher" }); }
});

// Invoice Admin
adminRouter.get("/api/admin/invoices", requireAdmin, async (req, res) => {
    try {
        const result = await db.execute(`SELECT i.*, b.name as client_name, b.email as client_email, b.vehicle_info, b.scheduled_at, s.title as service_title FROM invoices i LEFT JOIN bookings b ON i.booking_id = b.id LEFT JOIN services s ON b.service_id = s.id ORDER BY i.created_at DESC`);
        res.json(result.rows);
    } catch (e) { res.status(500).json({ error: "Gagal memuat invoice" }); }
});
adminRouter.get("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    try {
        const result = await db.execute({ sql: `SELECT i.*, b.name as client_name, b.email as client_email, b.phone as client_phone, b.vehicle_info, b.scheduled_at, b.voucher_code as booking_voucher, s.title as service_title, s.price as service_price FROM invoices i LEFT JOIN bookings b ON i.booking_id = b.id LEFT JOIN services s ON b.service_id = s.id WHERE i.id = ?`, args: [req.params.id] });
        if (result.rows.length === 0) return res.status(404).json({ error: "Invoice tidak ditemukan" });
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ error: "Gagal memuat invoice" }); }
});
adminRouter.post("/api/admin/invoices", requireAdmin, async (req, res) => {
    const { booking_id, items, voucher_code, discount_percent, subtotal, total, payment_status, dp_amount, remaining_amount } = req.body;
    try {
        await db.execute({ sql: `INSERT INTO invoices (booking_id, items, voucher_code, discount_percent, subtotal, total, payment_status, dp_amount, remaining_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, args: [booking_id, JSON.stringify(items), voucher_code || null, discount_percent || 0, subtotal || 0, total || 0, payment_status || 'LUNAS', dp_amount || 0, remaining_amount || 0] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal membuat invoice" }); }
});
adminRouter.put("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    const { items, voucher_code, discount_percent, subtotal, total, payment_status, dp_amount, remaining_amount } = req.body;
    try {
        await db.execute({ sql: `UPDATE invoices SET items = ?, voucher_code = ?, discount_percent = ?, subtotal = ?, total = ?, payment_status = ?, dp_amount = ?, remaining_amount = ? WHERE id = ?`, args: [JSON.stringify(items), voucher_code || null, discount_percent || 0, subtotal || 0, total || 0, payment_status || 'LUNAS', dp_amount || 0, remaining_amount || 0, req.params.id] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal memperbarui invoice" }); }
});
adminRouter.delete("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    try { await db.execute({ sql: "DELETE FROM invoices WHERE id = ?", args: [req.params.id] }); res.json({ success: true }); } catch (e) { res.status(500).json({ error: "Gagal menghapus invoice" }); }
});

app.use(adminRouter);

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error('[Vercel Error]', err);
    res.status(500).json({ error: "Internal server error" });
});

export default app;
