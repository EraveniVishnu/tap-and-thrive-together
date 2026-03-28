import nodemailer from 'nodemailer';

let transporter = null;

const createTransporter = async () => {
  // If the user has provided real SMTP credentials, use them.
  // Otherwise, fallback to Ethereal for development/testing.
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test Ethereal account
    console.log('Generating Ethereal Mail test account (No SMTP_HOST found in .env)...');
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

export const sendVerificationEmail = async (to, otp) => {
  if (!transporter) {
    transporter = await createTransporter();
  }

  const from = process.env.EMAIL_FROM || '"Tap & Thrive" <noreply@tapandthrive.com>';

  const info = await transporter.sendMail({
    from, // Now uses the base email from .env
    to,
    subject: "Your Tap & Thrive Verification Code",
    text: `Welcome to Tap & Thrive! Your verification code is ${otp}. It will expire in 10 minutes.`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px; margin: auto;">
             <h2 style="color: #1e293b; text-align: center;">Verify your email address</h2>
             <p style="color: #475569; font-size: 16px; line-height: 1.5; text-align: center;">Welcome to Tap & Thrive! Use the code below to complete your registration:</p>
             <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
               <h1 style="color: #4F46E5; letter-spacing: 8px; font-size: 42px; margin: 0; font-family: monospace;">${otp}</h1>
             </div>
             <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
           </div>`,
  });

  console.log("Message sent to %s: %s", to, info.messageId);
  if (!process.env.SMTP_HOST) {
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

export const sendTaskReminderEmail = async (to, taskTitle, reminderTime) => {
  if (!transporter) {
    transporter = await createTransporter();
  }

  const from = process.env.EMAIL_FROM || '"Tap & Thrive" <noreply@tapandthrive.com>';
  const timeString = reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const info = await transporter.sendMail({
    from,
    to,
    subject: `Reminder: ${taskTitle}`,
    text: `Don't forget! Your task "${taskTitle}" is scheduled for ${timeString}.`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px; margin: auto;">
             <h2 style="color: #4F46E5; text-align: center;">Task Reminder</h2>
             <p style="color: #475569; font-size: 16px; line-height: 1.5; text-align: center;">This is a friendly reminder for your upcoming task:</p>
             <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0;">
               <h3 style="color: #1e293b; margin: 0 0 10px 0;">${taskTitle}</h3>
               <p style="color: #4F46E5; font-weight: bold; margin: 0; font-size: 20px;">${timeString}</p>
             </div>
             <p style="color: #64748b; font-size: 14px; text-align: center;">Stay productive and keep thriving!</p>
           </div>`,
  });

  console.log("Reminder sent to %s for task '%s': %s", to, taskTitle, info.messageId);
  if (!process.env.SMTP_HOST) {
    console.log("Reminder Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};
