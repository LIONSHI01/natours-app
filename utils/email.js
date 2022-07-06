const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  // user = current user; url = url want to be embed in the email
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Mr Lion <${process.env.EMAIL_FROM}>`;
  }

  // Create a EMAIL TRANSPORT CONTAINER
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // SendGrid
      return 1;
    }
    // 1) Create a transporter
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a email pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  // Specific Email type to send for different events
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
};
