const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // For testing, if no custom SMTP is specified in .env, log to console
  if (!process.env.SMTP_HOST) {
    console.log('\n=================== MOCK EMAIL SENT ===================');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log('========================================================\n');
    return;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Connect Next'} <${process.env.FROM_EMAIL || 'noreply@connectnext.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
