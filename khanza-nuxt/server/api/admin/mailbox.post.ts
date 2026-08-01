import { db } from '~/server/utils/db';
import { verifyToken } from '~/server/utils/auth';
import { sendMail } from '~/server/utils/mailer';

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
  const body = await readBody(event);
  
  const { action, to, subject, message } = body;

  if (!action || !subject || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Action, subject, and message are required' });
  }

  // HTML Wrapper for styling
  const htmlMessage = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #dc2626; margin: 0;">Khanza Repaint</h2>
        <p style="color: #666; font-size: 12px; margin-top: 5px;">Premium Automotive Detailing & Painting</p>
      </div>
      <div style="color: #333; line-height: 1.6; font-size: 15px;">
        ${message.replace(/\n/g, '<br/>')}
      </div>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #999; text-align: center;">
        <p>&copy; ${new Date().getFullYear()} Khanza Repaint. All rights reserved.</p>
        <p>Jl. Cokroaminoto RW V No.18, Mojosari, Ngenep, Kec. Karang Ploso, Kabupaten Malang</p>
      </div>
    </div>
  `;

  if (action === 'send') {
    if (!to) throw createError({ statusCode: 400, statusMessage: 'Recipient email (to) is required' });
    
    // Send email
    const result = await sendMail({
      to,
      subject,
      html: htmlMessage,
      text: message
    });

    // Save to sent_emails
    await db.execute({
      sql: "INSERT INTO sent_emails (to_email, subject, type, body) VALUES (?, ?, 'individual', ?)",
      args: [to, subject, message]
    });

    return { success: true, previewUrl: result.previewUrl };
  }

  if (action === 'broadcast') {
    // Get all subscribers
    const subs = await db.execute(`SELECT email FROM newsletter_subscribers`);
    if (subs.rows.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No newsletter subscribers found' });
    }

    const emails = subs.rows.map((r: any) => r.email);
    
    // Send to all subscribers using BCC to hide other emails
    const result = await sendMail({
      bcc: emails.join(', '), 
      subject,
      html: htmlMessage,
      text: message
    });

    // Save to sent_emails
    await db.execute({
      sql: "INSERT INTO sent_emails (to_email, subject, type, body) VALUES (?, ?, 'broadcast', ?)",
      args: [`Broadcast to ${emails.length} subscribers`, subject, message]
    });

    return { success: true, sentCount: emails.length, previewUrl: result.previewUrl };
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid action' });
});
