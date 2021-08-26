const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config({ path: '.env.example' });

const DEFAULT_SENDER_EMAIL = `Xinney Nepal <${process.env.XINNEY_EMAIL}>`;

const mailerConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.XINNEY_EMAIL,
    pass: process.env.XINNEY_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  }
};

// this is async (returns a Promise - non blocking)
const sendCustomEmail = async (
  receiverEmail,
  emailSubject,
  messageBody,
  senderEmail = DEFAULT_SENDER_EMAIL
) => {
  // reusable transporter
  const transporter = nodemailer.createTransport(mailerConfig);
  // send mail
  const messageInfo = await transporter.sendMail({
    from: senderEmail,
    to: `${receiverEmail}`,
    subject: emailSubject,
    html: messageBody
  });
  console.log('Message sent: %s', messageInfo.messageId);
};

module.exports = { sendCustomEmail };
