import { db } from '~/server/utils/db';
import { requireAuth } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  // Get Sent Emails
  const sentEmailsRes = await db.execute(`
    SELECT * FROM sent_emails ORDER BY sent_at DESC LIMIT 100
  `);

  // Get Inbox (For now, we use bookings with emails as our "inbox" contacts, as they are the people who submitted requests)
  const bookingsRes = await db.execute(`
    SELECT id, name, email, phone, service_id, vehicle_info, scheduled_at, created_at
    FROM bookings
    WHERE email IS NOT NULL AND email != ''
    ORDER BY created_at DESC
    LIMIT 100
  `);

  // Map bookings to inbox format
  const inbox = bookingsRes.rows.map((row: any) => ({
    id: `booking-${row.id}`,
    sender_name: row.name,
    sender_email: row.email,
    subject: `Reservasi Layanan ${row.vehicle_info || ''}`,
    date: row.created_at,
    type: 'booking',
    originalData: row
  }));

  return {
    sent: sentEmailsRes.rows,
    inbox: inbox
  };
});
