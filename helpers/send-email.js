const nodemailer = require('nodemailer');
const config = require('./config.json');

// Generate SMTP service account from ethereal.email

module.exports = sendEmail;

async function sendEmail({ to, subject, html, test, from = config.emailFrom }) {
  const transporter = nodemailer.createTransport(config.smtpOptions);
  await transporter.sendMail({ from, to, subject, test, html }, (err, info) => {
    if (err) {
      console.log('Error occurred. ' + err.message);
      return process.exit(1);
    }
    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
}