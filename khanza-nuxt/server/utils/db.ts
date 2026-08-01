import { createClient } from "@libsql/client";
import { hashPassword } from "./auth";

export const db = createClient({
  url: process.env.TURSO_CONNECTION_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function setupDb() {
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
      icon_name TEXT,
      image_url TEXT
    )
  `);

  const serviceCols = ['image_url'];
  for (const col of serviceCols) {
    try {
      await db.execute(`ALTER TABLE services ADD COLUMN ${col} TEXT`);
    } catch (e) { /* column already exists */ }
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      email TEXT,
      phone TEXT,
      vehicle_info TEXT,
      service_id INTEGER,
      scheduled_at TEXT,
      status TEXT,
      voucher_code TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const bookingCols = ['name', 'email', 'phone', 'voucher_code', 'created_at'];
  for (const col of bookingCols) {
    try {
      await db.execute(`ALTER TABLE bookings ADD COLUMN ${col} TEXT`);
    } catch (e) { /* column already exists */ }
  }

  const invoiceCols = ['payment_status', 'dp_amount', 'remaining_amount', 'metadata'];
  for (const col of invoiceCols) {
    try {
      if (col === 'payment_status') {
        await db.execute(`ALTER TABLE invoices ADD COLUMN ${col} TEXT DEFAULT 'LUNAS'`);
      } else if (col === 'metadata') {
        await db.execute(`ALTER TABLE invoices ADD COLUMN ${col} TEXT`);
      } else {
        await db.execute(`ALTER TABLE invoices ADD COLUMN ${col} REAL DEFAULT 0`);
      }
    } catch (e) { /* column already exists */ }
  }

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
      is_approved BOOLEAN,
      profile_photo TEXT,
      service_ordered TEXT
    )
  `);

  const testimCols = ['profile_photo', 'service_ordered'];
  for (const col of testimCols) {
    try {
      await db.execute(`ALTER TABLE testimonials ADD COLUMN ${col} TEXT`);
    } catch (e) { /* column already exists */ }
  }

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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      subscribed_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER,
      items TEXT,
      voucher_code TEXT,
      discount_percent INTEGER DEFAULT 0,
      subtotal REAL DEFAULT 0,
      total REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'LUNAS',
      dp_amount REAL DEFAULT 0,
      remaining_amount REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS sent_emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      to_email TEXT,
      subject TEXT,
      type TEXT,
      body TEXT,
      sent_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS inbound_emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_name TEXT,
      sender_email TEXT,
      subject TEXT,
      body_text TEXT,
      body_html TEXT,
      received_at TEXT DEFAULT (datetime('now')),
      is_read BOOLEAN DEFAULT 0
    )
  `);

  try {
    await db.execute({
      sql: "INSERT INTO site_config (key, value) VALUES ('voucher_enabled', '1')",
      args: []
    });
  } catch (e) { /* already exists */ }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@khanzarepaint.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
  
  const userCheck = await db.execute({
    sql: "SELECT count(*) as count FROM users WHERE email = ?",
    args: [adminEmail]
  });
  const count = Number(userCheck.rows[0].count);
  if (count === 0) {
    const hashed = await hashPassword(adminPassword);
    await db.execute({
      sql: "INSERT INTO users (email, password, role) VALUES (?, ?, 'admin')",
      args: [adminEmail, hashed]
    });
    console.log(`Default admin account created for ${adminEmail}.`);
  } else {
    // Optionally update the password if it already exists so they can always login with .env password
    const hashed = await hashPassword(adminPassword);
    await db.execute({
      sql: "UPDATE users SET password = ? WHERE email = ?",
      args: [hashed, adminEmail]
    });
    console.log(`Admin account password updated for ${adminEmail}.`);
  }
}
