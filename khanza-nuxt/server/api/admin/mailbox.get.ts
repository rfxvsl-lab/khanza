import { db } from '~/server/utils/db';
import { verifyToken } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  try {
    verifyToken(authHeader.split(' ')[1]);
  } catch (err) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' });
  }
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

  // Get Inbound Emails
  const inboundRes = await db.execute(`
    SELECT * FROM inbound_emails ORDER BY received_at DESC LIMIT 50
  `);

  // Map inbound emails to inbox format
  const inboundInbox = inboundRes.rows.map((row: any) => ({
    id: `email-${row.id}`,
    sender_name: row.sender_name,
    sender_email: row.sender_email,
    subject: row.subject,
    date: row.received_at,
    type: 'email',
    body_text: row.body_text,
    body_html: row.body_html
  }));

  // Combine and sort
  const combinedInbox = [...inboundInbox, ...inbox].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return {
    sent: sentEmailsRes.rows,
    inbox: combinedInbox
  };
});
