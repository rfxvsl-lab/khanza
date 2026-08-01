import { db } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, message: 'Invalid payload' });
  }

  try {
    const keys = Object.keys(body);
    for (const key of keys) {
      const value = body[key] === null ? '' : String(body[key]);
      await db.execute({
        sql: `INSERT INTO site_config (key, value) VALUES (?, ?)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        args: [key, value]
      });
    }
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save settings:', error);
    throw createError({ statusCode: 500, message: 'Gagal menyimpan pengaturan' });
  }
});
