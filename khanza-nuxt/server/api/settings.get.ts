import { db } from '../utils/db';
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
});