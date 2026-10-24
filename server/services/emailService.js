const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (isConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const message = {
        from: `"${process.env.SENDER_NAME || 'Crowdfunding Causes'}" <${process.env.SENDER_EMAIL || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
      };

      const info = await transporter.sendMail(message);
      console.log(`[Email Sent] Message ID: ${info.messageId} to ${options.email}`);
      return info;
    } catch (err) {
      console.error(`[Email Error] Failed to send real email to ${options.email}: ${err.message}`);
      // Fall through to console logging
    }
  }

  // Simulated Email Fallback
  console.log(`
========================================================================
[SIMULATED EMAIL LOG]
------------------------------------------------------------------------
To:      ${options.email}
Subject: ${options.subject}
Date:    ${new Date().toISOString()}
------------------------------------------------------------------------
Body Preview:
${options.html.replace(/<[^>]*>/g, '\n').replace(/\n+/g, '\n').trim()}
========================================================================
  `);
  return { simulated: true };
};

module.exports = { sendEmail };
