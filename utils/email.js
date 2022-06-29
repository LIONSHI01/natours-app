const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate
  });
  // 2) Define the email options
  const mailOptions = {
    from: 'mr.lion<hello@mrlion.io>',
    to: options.email,
    subject: options.subject,
    text: options.message, //text / HTML
  };
  // 3) Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
