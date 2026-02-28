import { Router } from 'express';
import multer from 'multer';
import { db } from '../config/database';
import { cloudinary } from '../config/cloudinary';
import { checkRateLimit } from '../middleware/rateLimiter';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB max
});

// Settings
router.get("/api/settings", async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM site_config");
        const settings = result.rows.reduce((acc: any, row: any) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        res.json(settings);
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat pengaturan" });
    }
});

// Claim Voucher
router.post("/api/claim-voucher", async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: "Terlalu banyak permintaan. Coba lagi nanti." });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email wajib diisi" });
    }

    // Check if voucher feature is enabled
    try {
        const config = await db.execute({
            sql: "SELECT value FROM site_config WHERE key = 'voucher_enabled'",
            args: []
        });
        if (config.rows.length > 0 && config.rows[0].value === '0') {
            return res.status(400).json({ error: "Fitur voucher sedang tidak aktif" });
        }
    } catch (e) { /* continue if config not found */ }

    // Check default discount from config
    let discountPercent = 30;
    try {
        const discountConfig = await db.execute({
            sql: "SELECT value FROM site_config WHERE key = 'voucher_default_discount'",
            args: []
        });
        if (discountConfig.rows.length > 0) {
            discountPercent = parseInt(discountConfig.rows[0].value as string) || 30;
        }
    } catch (e) { /* use default */ }

    const code = "KHANZA" + discountPercent + "-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
        await db.execute({
            sql: "INSERT INTO vouchers (code, discount_percent, email_claimed, is_used) VALUES (?, ?, ?, ?)",
            args: [code, discountPercent, email, false],
        });
        res.json({ success: true, code, discount: discountPercent });
    } catch (e: any) {
        if (e.message.includes("UNIQUE constraint failed")) {
            return res.status(400).json({ error: "Email ini sudah pernah mengklaim voucher" });
        }
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
});

// Validate Voucher
router.post("/api/validate-voucher", async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: "Kode voucher wajib diisi" });
    }
    try {
        const result = await db.execute({
            sql: "SELECT * FROM vouchers WHERE code = ? AND is_used = 0",
            args: [code]
        });
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Voucher tidak valid atau sudah digunakan" });
        }
        res.json({
            valid: true,
            discount_percent: result.rows[0].discount_percent,
            code: result.rows[0].code
        });
    } catch (e) {
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
});

// Voucher status (is enabled?)
router.get("/api/voucher-status", async (req, res) => {
    try {
        const config = await db.execute({
            sql: "SELECT value FROM site_config WHERE key = 'voucher_enabled'",
            args: []
        });
        const enabled = config.rows.length > 0 ? config.rows[0].value === '1' : true;
        res.json({ enabled });
    } catch (e) {
        res.json({ enabled: true });
    }
});

// Bookings
router.post("/api/bookings", async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: "Terlalu banyak permintaan. Coba lagi nanti." });
    }

    const { date, service, vehicle_info, name, email, phone, voucher_code } = req.body;
    if (!date || !service) {
        return res.status(400).json({ error: "Tanggal dan layanan wajib diisi" });
    }

    try {
        const existing = await db.execute({
            sql: "SELECT * FROM bookings WHERE scheduled_at = ?",
            args: [date],
        });

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "Tanggal tersebut sudah dipesan" });
        }

        // If voucher code provided, validate and mark as used
        if (voucher_code) {
            const voucher = await db.execute({
                sql: "SELECT * FROM vouchers WHERE code = ? AND is_used = 0",
                args: [voucher_code]
            });
            if (voucher.rows.length === 0) {
                return res.status(400).json({ error: "Voucher tidak valid atau sudah digunakan" });
            }
            // Mark voucher as used
            await db.execute({
                sql: "UPDATE vouchers SET is_used = 1 WHERE code = ?",
                args: [voucher_code]
            });
        }

        await db.execute({
            sql: "INSERT INTO bookings (name, email, phone, vehicle_info, service_id, scheduled_at, status, voucher_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [name || '', email || '', phone || '', vehicle_info || 'Tidak diketahui', service, date, "pending", voucher_code || null],
        });

        res.json({ success: true, message: "Reservasi dikonfirmasi" });
    } catch (e) {
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
});

// Garage
router.get("/api/garage", async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM garage");
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat inventaris galeri" });
    }
});

// Services
router.get("/api/services", async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM services");
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat layanan" });
    }
});

// FAQs
router.get("/api/faqs", async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM faqs ORDER BY display_order ASC");
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat FAQ" });
    }
});

// Testimonials (public, only approved)
router.get("/api/testimonials", async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM testimonials WHERE is_approved = 1");
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat testimoni" });
    }
});

// Submit Testimonial (public, unauthenticated)
router.post("/api/testimonials/submit", upload.single('profile_photo'), async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: "Terlalu banyak permintaan. Coba lagi nanti." });
    }

    const { name, review, rating, service_ordered } = req.body;
    if (!name || !review || !rating) {
        return res.status(400).json({ error: "Nama, ulasan, dan rating wajib diisi" });
    }

    let profilePhotoUrl = '';

    // Upload profile photo to Cloudinary if provided
    if (req.file) {
        try {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'khanzarepaint/testimonials',
                transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
            });
            profilePhotoUrl = result.secure_url;
        } catch (e) {
            console.error('Upload foto profil gagal:', e);
        }
    }

    try {
        await db.execute({
            sql: "INSERT INTO testimonials (name, review, rating, is_approved, profile_photo, service_ordered) VALUES (?, ?, ?, 0, ?, ?)",
            args: [name, review, parseInt(rating), profilePhotoUrl, service_ordered || ''],
        });
        res.json({ success: true, message: "Testimoni berhasil dikirim dan menunggu persetujuan admin" });
    } catch (e) {
        res.status(500).json({ error: "Gagal mengirim testimoni" });
    }
});

// Newsletter Subscribe
router.post("/api/newsletter", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email wajib diisi" });
    }

    try {
        await db.execute({
            sql: "INSERT INTO newsletter_subscribers (email) VALUES (?)",
            args: [email],
        });
        res.json({ success: true, message: "Berhasil berlangganan newsletter" });
    } catch (e: any) {
        if (e.message.includes("UNIQUE constraint failed")) {
            return res.status(400).json({ error: "Email sudah terdaftar" });
        }
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
});

// Content Home
router.get("/api/content-home", async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM content_home LIMIT 1");
        res.json(result.rows[0]);
    } catch (e) {
        res.status(500).json({ error: "Gagal memuat konten beranda" });
    }
});

export default router;
