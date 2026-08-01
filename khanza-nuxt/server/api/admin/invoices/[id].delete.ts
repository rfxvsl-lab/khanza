import { db } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID required' });

  try {
    await db.execute({
      sql: 'DELETE FROM invoices WHERE id = ?',
      args: [id]
    });
    return { success: true };
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: 'Gagal menghapus invoice' });
  }
});
