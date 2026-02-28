import { db } from '../config/database';
import { hashPassword } from '../middleware/auth';
import 'dotenv/config';

export async function runSeeders() {
    // Admin Seeder
    try {
        const adminEmail = process.env.ADMIN_EMAIL || "mhmmadridho64@gmail.com";
        const adminPass = process.env.ADMIN_PASSWORD || "123123";
        const hashedPassword = await hashPassword(adminPass);

        // Check if admin exists
        const existing = await db.execute({
            sql: "SELECT id, password FROM users WHERE email = ? AND role = 'admin'",
            args: [adminEmail],
        });

        if (existing.rows.length > 0) {
            // Update password to bcrypt hash if it's not already hashed
            const currentPass = existing.rows[0].password as string;
            if (!currentPass.startsWith('$2a$') && !currentPass.startsWith('$2b$')) {
                await db.execute({
                    sql: "UPDATE users SET password = ? WHERE email = ?",
                    args: [hashedPassword, adminEmail],
                });
                console.log("Admin password updated to bcrypt hash.");
            }
        } else {
            await db.execute({
                sql: "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
                args: [adminEmail, hashedPassword, "admin"],
            });
            console.log("Admin seeded successfully.");
        }
    } catch (e: any) {
        console.error("Error seeding admin:", e);
    }

    // Site Config Seeder
    try {
        const configCount = await db.execute("SELECT COUNT(*) as count FROM site_config");
        if (configCount.rows[0].count === 0) {
            await db.execute("INSERT INTO site_config (key, value) VALUES ('site_name', 'Khanza Repaint')");
            await db.execute("INSERT INTO site_config (key, value) VALUES ('logo_url', '')");
            await db.execute("INSERT INTO site_config (key, value) VALUES ('footer_text', 'Premium automotive painting and detailing services. We bring your car''s true colors back to life with precision and passion.')");
        }
    } catch (e) { }

    // Content Home Seeder
    try {
        const contentHomeCount = await db.execute("SELECT COUNT(*) as count FROM content_home");
        if (contentHomeCount.rows[0].count === 0) {
            await db.execute({
                sql: "INSERT INTO content_home (title, description, hero_image) VALUES (?, ?, ?)",
                args: [
                    "Mendefinisikan Ulang Kesempurnaan Otomotif",
                    "Layanan cat mobil premium, detailing, dan restorasi otomotif. Rasakan seni transformasi kendaraan bersama kami.",
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
                ['Porsche 911 GT3 RS', 2023, 4500000000, 'Kondisi sangat baik', 'https://picsum.photos/seed/car1/800/600?blur=1', 'available'],
                ['Ferrari F8 Tributo', 2022, 5200000000, 'Kilometer rendah', 'https://picsum.photos/seed/car2/800/600?blur=1', 'available'],
                ['Lamborghini Huracan EVO', 2021, 4700000000, 'Knalpot custom', 'https://picsum.photos/seed/car3/800/600?blur=1', 'available'],
            ];
            for (const car of initialGarage) {
                await db.execute({
                    sql: "INSERT INTO garage (car_model, year, price, description, images, status) VALUES (?, ?, ?, ?, ?, ?)",
                    args: car,
                });
            }
        }
    } catch (e) { }

    // Services Seeder
    try {
        const servicesCount = await db.execute("SELECT COUNT(*) as count FROM services");
        if (servicesCount.rows[0].count === 0) {
            const initialServices = [
                ['Cat Ulang Full Body', 'Transformasi eksterior lengkap dengan proses cat premium multi-tahap.', 25000000, 'PaintBucket'],
                ['Ganti Warna Custom', 'Tampil beda dengan warna custom yang unik sesuai keinginan Anda.', 35000000, 'Palette'],
                ['Ceramic Coating', 'Perlindungan tahan lama dari cuaca, sinar UV, dan goresan ringan.', 8000000, 'Shield'],
                ['Detailing Signature', 'Pembersihan mendalam dan restorasi interior serta eksterior.', 3500000, 'Sparkles']
            ];
            for (const s of initialServices) {
                await db.execute({
                    sql: "INSERT INTO services (title, description, price, icon_name) VALUES (?, ?, ?, ?)",
                    args: s
                });
            }
        } else {
            await db.execute("UPDATE services SET icon_name = 'PaintBucket' WHERE icon_name = 'paint'");
            await db.execute("UPDATE services SET icon_name = 'Palette' WHERE icon_name = 'palette'");
            await db.execute("UPDATE services SET icon_name = 'Shield' WHERE icon_name = 'shield'");
            await db.execute("UPDATE services SET icon_name = 'Sparkles' WHERE icon_name = 'sparkles'");
        }
    } catch (e) { }

    // FAQs Seeder
    try {
        const faqsCount = await db.execute("SELECT COUNT(*) as count FROM faqs");
        if (faqsCount.rows[0].count === 0) {
            const initialFaqs = [
                ['Berapa lama proses cat ulang full body?', 'Cat ulang full body biasanya memakan waktu 2 hingga 4 minggu, tergantung kondisi kendaraan, kompleksitas warna, dan tingkat persiapan yang diperlukan. Kami mengutamakan kualitas di atas kecepatan.', 1],
                ['Apakah ada garansi untuk pekerjaan cat?', 'Ya, kami memberikan garansi komprehensif 5 tahun untuk semua cat ulang full body terhadap pengelupasan, pudar, dan gelembung dalam kondisi normal. Ceramic coating memiliki garansi tersendiri.', 2]
            ];
            for (const f of initialFaqs) {
                await db.execute({
                    sql: "INSERT INTO faqs (question, answer, display_order) VALUES (?, ?, ?)",
                    args: f
                });
            }
        }
    } catch (e) { }

    // Testimonials Seeder
    try {
        const testCount = await db.execute("SELECT COUNT(*) as count FROM testimonials");
        if (testCount.rows[0].count === 0) {
            const initialTests = [
                ['Budi Santoso', 'Perhatian terhadap detail di Khanza Repaint tidak tertandingi. Mereka mentransformasi 911 saya dengan warna custom yang selalu menarik perhatian di mana pun saya pergi. Pengrajin sejati.', 5, true],
                ['Sari Dewi', 'Saya membawa mobil untuk ceramic coating dan paint correction. Hasilnya seperti kaca. Terlihat lebih bagus dari hari pertama saya membelinya.', 5, true]
            ];
            for (const t of initialTests) {
                await db.execute({
                    sql: "INSERT INTO testimonials (name, review, rating, is_approved) VALUES (?, ?, ?, ?)",
                    args: t
                });
            }
        }
    } catch (e) { }
}
