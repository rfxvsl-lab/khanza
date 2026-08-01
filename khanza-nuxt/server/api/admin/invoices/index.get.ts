import { db } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const result = await db.execute(`
    SELECT i.*, b.name as client_name, b.email as client_email, b.scheduled_at 
    FROM invoices i 
    LEFT JOIN bookings b ON i.booking_id = b.id 
    ORDER BY i.created_at DESC
  `);
  return result.rows;
});
