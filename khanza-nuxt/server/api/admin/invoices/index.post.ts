import { db } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // Extract fields
  const booking_id = body.booking_id || null;
  const items = JSON.stringify(body.items || []);
  const voucher_code = body.voucher_code || null;
  const discount_percent = body.discount_percent || 0;
  const subtotal = body.subtotal || 0;
  const total = body.total || 0;
  const payment_status = body.payment_status || 'LUNAS';
  const dp_amount = body.dp_amount || 0;
  const remaining_amount = body.remaining_amount || 0;
  const metadata = JSON.stringify(body.metadata || {});

  try {
    const res = await db.execute({
      sql: `INSERT INTO invoices (
        booking_id, items, voucher_code, discount_percent, subtotal, 
        total, payment_status, dp_amount, remaining_amount, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      args: [
        booking_id, items, voucher_code, discount_percent, subtotal,
        total, payment_status, dp_amount, remaining_amount, metadata
      ]
    });

    return { success: true, id: res.rows[0].id };
  } catch (error: any) {
    console.error('Failed to create invoice:', error);
    throw createError({ statusCode: 500, message: 'Gagal membuat invoice' });
  }
});
