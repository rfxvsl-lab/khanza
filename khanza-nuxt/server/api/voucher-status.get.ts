import { db } from '../utils/db';
export default defineEventHandler(async () => {
    const config = await db.execute("SELECT value FROM site_config WHERE key = 'voucher_enabled'");
    const enabled = config.rows.length > 0 ? config.rows[0].value === '1' : true;
    return { enabled };
});