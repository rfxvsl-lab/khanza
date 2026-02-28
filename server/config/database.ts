import { createClient } from "@libsql/client";
import 'dotenv/config';

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
      icon_name TEXT
    )
  `);

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

  // Add new columns to bindings if they don't exist (migration-safe)
  const bookingCols = ['name', 'email', 'phone', 'voucher_code', 'created_at'];
  for (const col of bookingCols) {
    try {
      await db.execute(`ALTER TABLE bookings ADD COLUMN ${col} TEXT`);
    } catch (e) { /* column already exists */ }
  }

  const invoiceCols = ['payment_status', 'dp_amount', 'remaining_amount'];
  for (const col of invoiceCols) {
    try {
      if (col === 'payment_status') {
        await db.execute(`ALTER TABLE invoices ADD COLUMN ${col} TEXT DEFAULT 'LUNAS'`);
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

  // Add new columns to testimonials if they don't exist (migration-safe)
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

  // Seed voucher_enabled config if not exists
  try {
    await db.execute({
      sql: "INSERT INTO site_config (key, value) VALUES ('voucher_enabled', '1')",
      args: []
    });
  } catch (e) { /* already exists */ }
}
