const { Resend } = require('resend');
const nodemailer = require('nodemailer');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  let resendSuccess = false;

  // 1. Try sending via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      console.log('Attempting to send via Resend...');
      const emailParams = {
        from: 'onboarding@resend.dev',
        to: options.email,
        subject: options.subject,
        html: options.html || `<p>${options.message}</p>`,
        text: options.message, // Fallback relying on options.message
      };

      const { data, error } = await resend.emails.send(emailParams);

      if (error) {
        // Check for specific testing restriction 
        if (error.statusCode === 403 && error.message.includes('testing emails')) {
             console.warn('Resend testing restriction hit (can only send to verified email).');
             console.warn('Falling back to SMTP to send to original recipient...');
             // Do NOT set resendSuccess = true. Let it fall through to SMTP logic below.
        } else {
             console.error('Resend API Error:', error);
        }
      } else {
        console.log('Email sent successfully via Resend:', data);
        resendSuccess = true;
      }
    } catch (err) {
      console.error('Resend Unexpected Error:', err.message);
    }
  }

  if (resendSuccess) return;

  // 2. Fallback to SMTP (Nodemailer)
  console.log('Falling back to SMTP/Nodemailer...');

  try {
      let transporter;

      // Check if we have real credentials
      if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
         transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || 465,
          secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          },
        });
      } else {
        // FALLBACK: Use Ethereal Email (Auto-generated test account)
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
      console.log('Email sent successfully via SMTP:', info.messageId);

      // If using Ethereal, log the preview URL
      if (!process.env.SMTP_EMAIL) {
        console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
      }

  } catch (smtpError) {
      console.error('CRITICAL: All email sending methods failed.');
      console.error('SMTP Error:', smtpError);
      // Throw error so the caller knows it failed
      throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
