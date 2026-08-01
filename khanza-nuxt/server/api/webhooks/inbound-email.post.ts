import { db } from '~/server/utils/db';

import { simpleParser } from 'mailparser';

export default defineEventHandler(async (event) => {
  // Simple token based auth to prevent random spam (Token matches JWT_SECRET)
  const config = useRuntimeConfig();
  const query = getQuery(event);
  
  if (query.token !== config.jwtSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized webhook' });
  }

  const body = await readBody(event);
  
  // The structure expected from our NEW Cloudflare Email Worker
  const { raw_email } = body;

  if (!raw_email) {
    throw createError({ statusCode: 400, statusMessage: 'raw_email is required' });
  }

  try {
    // Parse the raw MIME email stream
    const parsed = await simpleParser(raw_email);
    
    // Extract required fields
    const sender_name = parsed.from?.value[0]?.name || 'Pelanggan';
    const sender_email = parsed.from?.value[0]?.address || 'unknown@email.com';
    const subject = parsed.subject || '(Tanpa Subjek)';
    const body_text = parsed.text || '(Pesan kosong atau hanya berisi file HTML/lampiran)';
    const body_html = (parsed.html === false) ? '' : parsed.html;

    await db.execute({
      sql: `INSERT INTO inbound_emails (sender_name, sender_email, subject, body_text, body_html) 
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        sender_name, 
        sender_email, 
        subject, 
        body_text, 
        body_html || ''
      ]
    });

    return { success: true, message: 'Email saved to Turso' };
  } catch (error) {
    console.error('Failed to save inbound email:', error);
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' });
  }
});
