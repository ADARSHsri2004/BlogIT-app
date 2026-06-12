const nodemailer = require('nodemailer');
const {
  NODE_ENV,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  EMAIL_FROM
} = require('./config');

const hasSmtpConfig = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    })
  : null;

const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    if (NODE_ENV === 'production') {
      throw new Error('Email service is not configured');
    }
    process.stdout.write(`Email skipped in development\nTo: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html
  });
};

module.exports = { sendEmail };
