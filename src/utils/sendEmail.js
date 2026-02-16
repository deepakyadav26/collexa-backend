const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // Check if we have real credentials
  if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
     transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // FALLBACK: Use Ethereal Email (Auto-generated test account)
    // This is the "Best Way" for immediate testing without signing up anywhere.
    console.log('No SMTP Credentials found. Using Ethereal Email for testing...');
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // Define the email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Collexa Support'} <${process.env.SMTP_EMAIL || 'no-reply@collexa.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);

  // If using Ethereal, log the preview URL
  if (!process.env.SMTP_EMAIL) {
    console.log('----------------------------------------------------');
    console.log('EMAIL SENT (Preview URL):');
    console.log(nodemailer.getTestMessageUrl(info));
    console.log('----------------------------------------------------');
  }
};

module.exports = sendEmail;
