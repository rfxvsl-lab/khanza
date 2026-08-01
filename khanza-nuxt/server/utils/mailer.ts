import nodemailer from 'nodemailer';

export const sendMail = async (options: { to?: string; bcc?: string; subject: string; html: string; text?: string }) => {
  const config = useRuntimeConfig();
  
  // Use user's real SMTP credentials if provided in .env
  const useRealSMTP = config.smtpHost && config.smtpUser && config.smtpPass;
  
  let transporter;

  if (useRealSMTP) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: Number(config.smtpPort) || 465,
      secure: Number(config.smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  } else {
    // Fallback for Development: Generate a free Ethereal test account
    console.log('⚠️ Real SMTP credentials not found in .env. Falling back to Ethereal Email for testing.');
    
    // Using a static ethereal account to avoid creating a new one on every request
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'khalid.stracke54@ethereal.email', // Temporary Ethereal account
        pass: 'HpxcT7m98zS3e4xV7H'
      }
    });
  }

  const defaultFrom = config.smtpFrom || config.smtpUser || 'admin@khanzarepaint.web.id';
  
  try {
    const info = await transporter.sendMail({
      from: `"Khanza Repaint" <${defaultFrom}>`,
      to: options.to,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text || options.subject,
      html: options.html,
    });

    console.log(`✉️ Email sent to ${options.to}`);
    
    if (!useRealSMTP) {
      console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId, previewUrl: !useRealSMTP ? nodemailer.getTestMessageUrl(info) : null };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
