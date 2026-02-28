import express from "express";
import { createServer as createViteServer } from "vite";
import { db } from "./src/lib/db";
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const app = express();
const PORT = 3000;

app.use(express.json());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

// Setup DB and Seeder
async function setupDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS content_home (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      hero_image TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      price TEXT,
      icon_name TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      vehicle_info TEXT,
      service_id INTEGER,
      scheduled_at TEXT,
      status TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS garage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_model TEXT,
      year INTEGER,
      price TEXT,
      description TEXT,
      images TEXT,
      status TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      review TEXT,
      rating INTEGER,
      is_approved BOOLEAN
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT,
      answer TEXT,
      display_order INTEGER
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      discount_percent INTEGER,
      email_claimed TEXT,
      is_used BOOLEAN
    )
  `);

  // Admin Seeder
  try {
    await db.execute({
      sql: "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      args: ["mhmmadridho64@gmail.com", "123123", "admin"],
    });
    console.log("Admin seeded successfully.");
  } catch (e: any) {
    if (!e.message.includes("UNIQUE constraint failed")) {
      console.error("Error seeding admin:", e);
    }
  }

  // Site Config Seeder
  try {
    const configCount = await db.execute("SELECT COUNT(*) as count FROM site_config");
    if (configCount.rows[0].count === 0) {
      await db.execute("INSERT INTO site_config (key, value) VALUES ('site_name', 'Khanza Repaint')");
      await db.execute("INSERT INTO site_config (key, value) VALUES ('logo_url', '')");
      await db.execute("INSERT INTO site_config (key, value) VALUES ('footer_text', 'Premium automotive painting and detailing services. We bring your car''s true colors back to life with precision and passion.')");
    }
  } catch (e) {}

  // Content Home Seeder
  try {
    const contentHomeCount = await db.execute("SELECT COUNT(*) as count FROM content_home");
    if (contentHomeCount.rows[0].count === 0) {
      await db.execute({
        sql: "INSERT INTO content_home (title, description, hero_image) VALUES (?, ?, ?)",
        args: [
          "Redefining Automotive Perfection",
          "Premium painting, detailing, and restoration services. Experience the art of automotive transformation.",
          "https://picsum.photos/seed/car/1920/1080?blur=4"
        ]
      });
      console.log("Content Home seeded");
    }
  } catch (e) {
    console.error("Failed to seed content_home:", e);
  }

  // Garage Seeder
  try {
    const garageCount = await db.execute("SELECT COUNT(*) as count FROM garage");
    if (garageCount.rows[0].count === 0) {
      const initialGarage = [
        ['Porsche 911 GT3 RS', 2023, '$285,000', 'Pristine condition', 'https://picsum.photos/seed/car1/800/600?blur=1', 'available'],
        ['Ferrari F8 Tributo', 2022, '$320,000', 'Low mileage', 'https://picsum.photos/seed/car2/800/600?blur=1', 'available'],
        ['Lamborghini Huracan EVO', 2021, '$290,000', 'Custom exhaust', 'https://picsum.photos/seed/car3/800/600?blur=1', 'available'],
      ];
      for (const car of initialGarage) {
        await db.execute({
          sql: "INSERT INTO garage (car_model, year, price, description, images, status) VALUES (?, ?, ?, ?, ?, ?)",
          args: car,
        });
      }
    }
  } catch (e) {}

  // Services Seeder
  try {
    const servicesCount = await db.execute("SELECT COUNT(*) as count FROM services");
    if (servicesCount.rows[0].count === 0) {
      const initialServices = [
        ['Full Body Repaint', 'Complete exterior transformation with premium multi-stage paint process.', 'From $2,500', 'PaintBucket'],
        ['Custom Color Change', 'Stand out from the crowd with a unique, custom-mixed color.', 'From $3,200', 'Palette'],
        ['Ceramic Coating', 'Long-lasting protection against elements, UV rays, and minor scratches.', 'From $800', 'Shield'],
        ['Signature Detailing', 'Deep cleaning and restoration of both interior and exterior.', 'From $350', 'Sparkles']
      ];
      for (const s of initialServices) {
        await db.execute({
          sql: "INSERT INTO services (title, description, price, icon_name) VALUES (?, ?, ?, ?)",
          args: s
        });
      }
    } else {
      // Update old icon names to valid Lucide React names
      await db.execute("UPDATE services SET icon_name = 'PaintBucket' WHERE icon_name = 'paint'");
      await db.execute("UPDATE services SET icon_name = 'Palette' WHERE icon_name = 'palette'");
      await db.execute("UPDATE services SET icon_name = 'Shield' WHERE icon_name = 'shield'");
      await db.execute("UPDATE services SET icon_name = 'Sparkles' WHERE icon_name = 'sparkles'");
    }
  } catch (e) {}

  // FAQs Seeder
  try {
    const faqsCount = await db.execute("SELECT COUNT(*) as count FROM faqs");
    if (faqsCount.rows[0].count === 0) {
      const initialFaqs = [
        ['How long does a full repaint take?', 'A full body repaint typically takes 2 to 4 weeks, depending on the condition of the vehicle, the complexity of the color, and the level of prep work required. We prioritize quality over speed.', 1],
        ['Do you offer a warranty on your paint jobs?', 'Yes, we offer a comprehensive 5-year warranty on all full repaints against peeling, fading, and bubbling under normal conditions. Ceramic coatings come with their own specific warranties.', 2]
      ];
      for (const f of initialFaqs) {
        await db.execute({
          sql: "INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)",
          args: f
        });
      }
    }
  } catch (e) {}

  // Testimonials Seeder
  try {
    const testCount = await db.execute("SELECT COUNT(*) as count FROM testimonials");
    if (testCount.rows[0].count === 0) {
      const initialTests = [
        ['James Wilson', 'The attention to detail at Khanza Repaint is unmatched. They transformed my 911 with a custom color that turns heads everywhere I go. True artisans.', 5, true],
        ['Sarah Jenkins', 'I brought my car in for a ceramic coating and paint correction. The finish is like glass. It looks better than the day I drove it off the lot.', 5, true]
      ];
      for (const t of initialTests) {
        await db.execute({
          sql: "INSERT INTO testimonials (name, review, rating, is_approved) VALUES (?, ?, ?, ?)",
          args: t
        });
      }
    }
  } catch (e) {}
}

setupDb();

// Rate Limiting Map
const rateLimits = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimits.get(ip) || 0;
  if (now - lastRequest < RATE_LIMIT_WINDOW) {
    return false;
  }
  rateLimits.set(ip, now);
  return true;
}

// Admin Auth State
const adminTokens = new Set<string>();

app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.execute({
      sql: "SELECT * FROM users WHERE email = ? AND password = ? AND role = 'admin'",
      args: [email, password]
    });
    if (user.rows.length > 0) {
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      adminTokens.add(token);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token && adminTokens.has(token)) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Public API Routes
app.get("/api/settings", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM site_config");
    const settings = result.rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

app.post("/api/claim-voucher", async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const code = "KHANZA30-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  
  try {
    await db.execute({
      sql: "INSERT INTO vouchers (code, discount_percent, email_claimed, is_used) VALUES (?, ?, ?, ?)",
      args: [code, 30, email, false],
    });
    res.json({ success: true, code, discount: 30 });
  } catch (e: any) {
    if (e.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Email already claimed a voucher" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/bookings", async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  const { date, service, vehicle_info } = req.body;
  if (!date || !service) {
    return res.status(400).json({ error: "Date and service are required" });
  }

  try {
    const existing = await db.execute({
      sql: "SELECT * FROM bookings WHERE scheduled_at = ?",
      args: [date],
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Date is already booked" });
    }

    await db.execute({
      sql: "INSERT INTO bookings (vehicle_info, service_id, scheduled_at, status) VALUES (?, ?, ?, ?)",
      args: [vehicle_info || 'Unknown', service, date, "pending"],
    });

    res.json({ success: true, message: "Booking confirmed" });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/garage", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM garage");
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch garage inventory" });
  }
});

app.get("/api/services", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM services");
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

app.get("/api/faqs", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM faqs ORDER BY display_order ASC");
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch faqs" });
  }
});

app.get("/api/testimonials", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM testimonials WHERE is_approved = 1");
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

app.get("/api/content-home", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM content_home LIMIT 1");
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch content home" });
  }
});

app.post("/api/admin/upload", requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
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
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

app.put("/api/admin/content-home", requireAdmin, async (req, res) => {
  const { title, description, hero_image } = req.body;
  try {
    await db.execute({
      sql: "UPDATE content_home SET title = ?, description = ?, hero_image = ? WHERE id = 1",
      args: [title, description, hero_image],
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to update content home" });
  }
});

// Admin API Routes (CRUD)
app.get("/api/admin/bookings", requireAdmin, async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT b.*, s.title as service_title 
      FROM bookings b 
      LEFT JOIN services s ON b.service_id = s.id 
      ORDER BY b.scheduled_at DESC
    `);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.put("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.execute({
      sql: "UPDATE bookings SET status = ? WHERE id = ?",
      args: [status, id],
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to update booking" });
  }
});

app.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const bookingsCount = await db.execute("SELECT COUNT(*) as count FROM bookings");
    const garageCount = await db.execute("SELECT COUNT(*) as count FROM garage WHERE status = 'available'");
    const vouchersCount = await db.execute("SELECT COUNT(*) as count FROM vouchers WHERE is_used = 0");
    
    res.json({
      total_bookings: bookingsCount.rows[0].count,
      available_cars: garageCount.rows[0].count,
      active_vouchers: vouchersCount.rows[0].count
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/api/admin/testimonials", requireAdmin, async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM testimonials");
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

app.put("/api/settings", requireAdmin, async (req, res) => {
  const { site_name, logo_url, footer_text } = req.body;
  try {
    await db.execute({ sql: "UPDATE site_config SET value = ? WHERE key = 'site_name'", args: [site_name] });
    await db.execute({ sql: "UPDATE site_config SET value = ? WHERE key = 'logo_url'", args: [logo_url] });
    await db.execute({ sql: "UPDATE site_config SET value = ? WHERE key = 'footer_text'", args: [footer_text] });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Services CRUD
app.post("/api/services", requireAdmin, async (req, res) => {
  const { title, description, price, icon_name } = req.body;
  try {
    await db.execute({
      sql: "INSERT INTO services (title, description, price, icon_name) VALUES (?, ?, ?, ?)",
      args: [title, description, price, icon_name],
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to add service" }); }
});
app.put("/api/services/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description, price, icon_name } = req.body;
  try {
    await db.execute({
      sql: "UPDATE services SET title = ?, description = ?, price = ?, icon_name = ? WHERE id = ?",
      args: [title, description, price, icon_name, id],
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to update service" }); }
});
app.delete("/api/services/:id", requireAdmin, async (req, res) => {
  try {
    await db.execute({ sql: "DELETE FROM services WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to delete service" }); }
});

// FAQs CRUD
app.post("/api/faqs", requireAdmin, async (req, res) => {
  const { question, answer, display_order } = req.body;
  try {
    await db.execute({
      sql: "INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)",
      args: [question, answer, display_order || 0],
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to add faq" }); }
});
app.put("/api/faqs/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { question, answer, display_order } = req.body;
  try {
    await db.execute({
      sql: "UPDATE faqs SET question = ?, answer = ?, display_order = ? WHERE id = ?",
      args: [question, answer, display_order || 0, id],
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to update faq" }); }
});
app.delete("/api/faqs/:id", requireAdmin, async (req, res) => {
  try {
    await db.execute({ sql: "DELETE FROM faqs WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to delete faq" }); }
});

// Garage CRUD
app.post("/api/garage", requireAdmin, async (req, res) => {
  const { car_model, year, price, description, images, status } = req.body;
  try {
    await db.execute({
      sql: "INSERT INTO garage (car_model, year, price, description, images, status) VALUES (?, ?, ?, ?, ?, ?)",
      args: [car_model, year, price, description, images, status || 'available'],
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to add car" }); }
});
app.put("/api/garage/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { car_model, year, price, description, images, status } = req.body;
  try {
    await db.execute({
      sql: "UPDATE garage SET car_model = ?, year = ?, price = ?, description = ?, images = ?, status = ? WHERE id = ?",
      args: [car_model, year, price, description, images, status, id],
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to update car" }); }
});
app.delete("/api/garage/:id", requireAdmin, async (req, res) => {
  try {
    await db.execute({ sql: "DELETE FROM garage WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to delete car" }); }
});

// Testimonials CRUD
app.post("/api/testimonials", requireAdmin, async (req, res) => {
  const { name, review, rating, is_approved } = req.body;
  try {
    await db.execute({
      sql: "INSERT INTO testimonials (name, review, rating, is_approved) VALUES (?, ?, ?, ?)",
      args: [name, review, rating, is_approved ? 1 : 0],
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to add testimonial" }); }
});
app.put("/api/testimonials/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, review, rating, is_approved } = req.body;
  try {
    await db.execute({
      sql: "UPDATE testimonials SET name = ?, review = ?, rating = ?, is_approved = ? WHERE id = ?",
      args: [name, review, rating, is_approved ? 1 : 0, id],
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to update testimonial" }); }
});
app.delete("/api/testimonials/:id", requireAdmin, async (req, res) => {
  try {
    await db.execute({ sql: "DELETE FROM testimonials WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed to delete testimonial" }); }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
