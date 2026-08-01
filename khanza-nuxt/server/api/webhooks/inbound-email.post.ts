import { db } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  // Simple token based auth to prevent random spam (Token matches JWT_SECRET)
  const config = useRuntimeConfig();
  const query = getQuery(event);
  
  if (query.token !== config.jwtSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized webhook' });
  }

  const body = await readBody(event);
  
  // The structure expected from our Cloudflare Email Worker
  const { sender_name, sender_email, subject, body_text, body_html } = body;

  if (!sender_email) {
    throw createError({ statusCode: 400, statusMessage: 'sender_email is required' });
  }

  try {
    await db.execute({
      sql: `INSERT INTO inbound_emails (sender_name, sender_email, subject, body_text, body_html) 
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        sender_name || 'Unknown', 
        sender_email, 
        subject || '(No Subject)', 
        body_text || '', 
        body_html || ''
      ]
    });

    return { success: true, message: 'Email saved to Turso' };
  } catch (error) {
    console.error('Failed to save inbound email:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
