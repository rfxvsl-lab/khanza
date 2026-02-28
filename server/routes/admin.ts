import { Router } from 'express';
import multer from 'multer';
import { db } from '../config/database';
import { cloudinary } from '../config/cloudinary';
import { requireAdmin, generateToken, comparePassword } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Admin Login
router.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.execute({
            sql: "SELECT * FROM users WHERE email = ? AND role = 'admin'",
            args: [email]
        });
        if (user.rows.length > 0) {
            const isValid = await comparePassword(password, user.rows[0].password as string);
            if (isValid) {
                const token = generateToken(user.rows[0].id as number, email);
                return res.json({ success: true, token });
            }
        }
        res.status(401).json({ error: "Kredensial tidak valid" });
    } catch (e) {
        res.status(500).json({ error: "Kesalahan server" });
    }
});

// Upload
router.post("/api/admin/upload", requireAdmin, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file gambar' });
    }

    try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'khanzarepaint',
        });

        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ error: 'Gagal mengunggah gambar' });
    }
});

// Content Home
router.put("/api/admin/content-home", requireAdmin, async (req, res) => {
    const { title, description, hero_image } = req.body;
    try {
        await db.execute({
            sql: "UPDATE content_home SET title = ?, description = ?, hero_image = ? WHERE id = 1",
            args: [title, description, hero_image],
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal memperbarui konten beranda" });
    }
});

// Bookings
router.get("/api/admin/bookings", requireAdmin, async (req, res) => {
    try {
        const result = await db.execute(`
      SELECT b.*, s.title as service_title, v.discount_percent as voucher_discount 
      FROM bookings b 
      LEFT JOIN services s ON b.service_id = s.id 
      LEFT JOIN vouchers v ON b.voucher_code = v.code
      ORDER BY b.scheduled_at DESC
    `);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat reservasi" });
    }
});

router.put("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.execute({
            sql: "UPDATE bookings SET status = ? WHERE id = ?",
            args: [status, id],
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal memperbarui reservasi" });
    }
});

router.delete("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
    try {
        await db.execute({ sql: "DELETE FROM bookings WHERE id = ?", args: [req.params.id] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menghapus reservasi" }); }
});

// Stats
router.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
        const bookingsCount = await db.execute("SELECT COUNT(*) as count FROM bookings");
        const garageCount = await db.execute("SELECT COUNT(*) as count FROM garage WHERE status = 'available'");
        const vouchersCount = await db.execute("SELECT COUNT(*) as count FROM vouchers WHERE is_used = 0");
        const newsletterCount = await db.execute("SELECT COUNT(*) as count FROM newsletter_subscribers");

        res.json({
            total_bookings: bookingsCount.rows[0].count,
            available_cars: garageCount.rows[0].count,
            active_vouchers: vouchersCount.rows[0].count,
            newsletter_subs: newsletterCount.rows[0].count
        });
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat statistik" });
    }
});

// Testimonials
router.get("/api/admin/testimonials", requireAdmin, async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM testimonials ORDER BY id DESC");
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat testimoni" });
    }
});

// Settings
router.put("/api/settings", requireAdmin, async (req, res) => {
    const { site_name, logo_url, footer_text } = req.body;
    try {
        await db.execute({ sql: "UPDATE site_config SET value = ? WHERE key = 'site_name'", args: [site_name] });
        await db.execute({ sql: "UPDATE site_config SET value = ? WHERE key = 'logo_url'", args: [logo_url] });
        await db.execute({ sql: "UPDATE site_config SET value = ? WHERE key = 'footer_text'", args: [footer_text] });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal memperbarui pengaturan" });
    }
});

// Services CRUD
router.post("/api/services", requireAdmin, async (req, res) => {
    const { title, description, price, icon_name } = req.body;
    try {
        await db.execute({
            sql: "INSERT INTO services (title, description, price, icon_name) VALUES (?, ?, ?, ?)",
            args: [title, description, price, icon_name],
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menambah layanan" }); }
});
router.put("/api/services/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { title, description, price, icon_name } = req.body;
    try {
        await db.execute({
            sql: "UPDATE services SET title = ?, description = ?, price = ?, icon_name = ? WHERE id = ?",
            args: [title, description, price, icon_name, id],
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal memperbarui layanan" }); }
});
router.delete("/api/services/:id", requireAdmin, async (req, res) => {
    try {
        await db.execute({ sql: "DELETE FROM services WHERE id = ?", args: [req.params.id] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menghapus layanan" }); }
});

// FAQs CRUD
router.post("/api/faqs", requireAdmin, async (req, res) => {
    const { question, answer, display_order } = req.body;
    try {
        await db.execute({
            sql: "INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)",
            args: [question, answer, display_order || 0],
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menambah FAQ" }); }
});
router.put("/api/faqs/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { question, answer, display_order } = req.body;
    try {
        await db.execute({
            sql: "UPDATE faqs SET question = ?, answer = ?, display_order = ? WHERE id = ?",
            args: [question, answer, display_order || 0, id],
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal memperbarui FAQ" }); }
});
router.delete("/api/faqs/:id", requireAdmin, async (req, res) => {
    try {
        await db.execute({ sql: "DELETE FROM faqs WHERE id = ?", args: [req.params.id] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menghapus FAQ" }); }
});

// Garage CRUD
router.post("/api/garage", requireAdmin, async (req, res) => {
    const { car_model, year, price, description, images, status } = req.body;
    try {
        await db.execute({
            sql: "INSERT INTO garage (car_model, year, price, description, images, status) VALUES (?, ?, ?, ?, ?, ?)",
            args: [car_model, year, price, description, images, status || 'available'],
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menambah kendaraan" }); }
});
router.put("/api/garage/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { car_model, year, price, description, images, status } = req.body;
    try {
        await db.execute({
            sql: "UPDATE garage SET car_model = ?, year = ?, price = ?, description = ?, images = ?, status = ? WHERE id = ?",
            args: [car_model, year, price, description, images, status, id],
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal memperbarui kendaraan" }); }
});
router.delete("/api/garage/:id", requireAdmin, async (req, res) => {
    try {
        await db.execute({ sql: "DELETE FROM garage WHERE id = ?", args: [req.params.id] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menghapus kendaraan" }); }
});

// Testimonials CRUD
router.post("/api/testimonials", requireAdmin, async (req, res) => {
    const { name, review, rating, is_approved, service_ordered } = req.body;
    try {
        await db.execute({
            sql: "INSERT INTO testimonials (name, review, rating, is_approved, service_ordered) VALUES (?, ?, ?, ?, ?)",
            args: [name, review, rating, is_approved ? 1 : 0, service_ordered || ''],
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menambah testimoni" }); }
});
router.put("/api/testimonials/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, review, rating, is_approved, service_ordered } = req.body;
    try {
        await db.execute({
            sql: "UPDATE testimonials SET name = ?, review = ?, rating = ?, is_approved = ?, service_ordered = ? WHERE id = ?",
            args: [name, review, rating, is_approved ? 1 : 0, service_ordered || '', id],
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal memperbarui testimoni" }); }
});
router.delete("/api/testimonials/:id", requireAdmin, async (req, res) => {
    try {
        await db.execute({ sql: "DELETE FROM testimonials WHERE id = ?", args: [req.params.id] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menghapus testimoni" }); }
});

// Newsletter Admin
router.get("/api/admin/newsletters", requireAdmin, async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC");
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat subscriber" });
    }
});
router.delete("/api/admin/newsletters/:id", requireAdmin, async (req, res) => {
    try {
        await db.execute({ sql: "DELETE FROM newsletter_subscribers WHERE id = ?", args: [req.params.id] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menghapus subscriber" }); }
});

// Voucher Admin
router.get("/api/admin/vouchers", requireAdmin, async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM vouchers ORDER BY id DESC");
        const config = await db.execute("SELECT value FROM site_config WHERE key = 'voucher_enabled'");
        const discountConfig = await db.execute("SELECT value FROM site_config WHERE key = 'voucher_default_discount'");
        res.json({
            vouchers: result.rows,
            enabled: config.rows.length > 0 ? config.rows[0].value === '1' : true,
            default_discount: discountConfig.rows.length > 0 ? parseInt(discountConfig.rows[0].value as string) : 30
        });
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat voucher" });
    }
});
router.put("/api/admin/voucher-toggle", requireAdmin, async (req, res) => {
    const { enabled } = req.body;
    try {
        // Upsert
        await db.execute({
            sql: "INSERT INTO site_config (key, value) VALUES ('voucher_enabled', ?) ON CONFLICT(key) DO UPDATE SET value = ?",
            args: [enabled ? '1' : '0', enabled ? '1' : '0']
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal memperbarui pengaturan voucher" });
    }
});
router.put("/api/admin/voucher-discount", requireAdmin, async (req, res) => {
    const { discount } = req.body;
    try {
        await db.execute({
            sql: "INSERT INTO site_config (key, value) VALUES ('voucher_default_discount', ?) ON CONFLICT(key) DO UPDATE SET value = ?",
            args: [String(discount), String(discount)]
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal memperbarui diskon default" });
    }
});
router.delete("/api/admin/vouchers/:id", requireAdmin, async (req, res) => {
    try {
        await db.execute({ sql: "DELETE FROM vouchers WHERE id = ?", args: [req.params.id] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menghapus voucher" }); }
});

// Invoice Admin
router.get("/api/admin/invoices", requireAdmin, async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT i.*, b.name as client_name, b.email as client_email, b.vehicle_info, b.scheduled_at,
                   s.title as service_title
            FROM invoices i
            LEFT JOIN bookings b ON i.booking_id = b.id
            LEFT JOIN services s ON b.service_id = s.id
            ORDER BY i.created_at DESC
        `);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat invoice" });
    }
});

router.get("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    try {
        const result = await db.execute({
            sql: `SELECT i.*, b.name as client_name, b.email as client_email, b.phone as client_phone, 
                         b.vehicle_info, b.scheduled_at, b.voucher_code as booking_voucher,
                         s.title as service_title, s.price as service_price
                  FROM invoices i
                  LEFT JOIN bookings b ON i.booking_id = b.id
                  LEFT JOIN services s ON b.service_id = s.id
                  WHERE i.id = ?`,
            args: [req.params.id]
        });
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Invoice tidak ditemukan" });
        }
        res.json(result.rows[0]);
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat invoice" });
    }
});

router.post("/api/admin/invoices", requireAdmin, async (req, res) => {
    const { booking_id, items, voucher_code, discount_percent, subtotal, total, payment_status, dp_amount, remaining_amount } = req.body;
    try {
        await db.execute({
            sql: `INSERT INTO invoices 
                  (booking_id, items, voucher_code, discount_percent, subtotal, total, payment_status, dp_amount, remaining_amount) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                booking_id, JSON.stringify(items), voucher_code || null, discount_percent || 0, subtotal || 0, total || 0,
                payment_status || 'LUNAS', dp_amount || 0, remaining_amount || 0
            ],
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal membuat invoice" });
    }
});

router.put("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { items, voucher_code, discount_percent, subtotal, total, payment_status, dp_amount, remaining_amount } = req.body;
    try {
        await db.execute({
            sql: `UPDATE invoices SET 
                  items = ?, voucher_code = ?, discount_percent = ?, subtotal = ?, total = ?, 
                  payment_status = ?, dp_amount = ?, remaining_amount = ? 
                  WHERE id = ?`,
            args: [
                JSON.stringify(items), voucher_code || null, discount_percent || 0, subtotal || 0, total || 0,
                payment_status || 'LUNAS', dp_amount || 0, remaining_amount || 0, id
            ],
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Gagal memperbarui invoice" });
    }
});

router.delete("/api/admin/invoices/:id", requireAdmin, async (req, res) => {
    try {
        await db.execute({ sql: "DELETE FROM invoices WHERE id = ?", args: [req.params.id] });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Gagal menghapus invoice" }); }
});

export default router;
