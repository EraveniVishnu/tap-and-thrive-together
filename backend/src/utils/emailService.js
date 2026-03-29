import sgMail from '@sendgrid/mail';

// Set the SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendVerificationEmail = async (to, otp) => {
  const msg = {
    to: to,
    from: process.env.EMAIL_FROM || '"Tap & Thrive" <noreply@tapandthrive.com>',
    subject: "Your Tap & Thrive Verification Code",
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px; margin: auto;">
             <h2 style="color: #1e293b; text-align: center;">Verify your email address</h2>
             <p style="color: #475569; font-size: 16px; line-height: 1.5; text-align: center;">Welcome to Tap & Thrive! Use the code below to complete your registration:</p>
             <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
               <h1 style="color: #4F46E5; letter-spacing: 8px; font-size: 42px; margin: 0; font-family: monospace;">${otp}</h1>
             </div>
             <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
           </div>`
  };

  try {
    const response = await sgMail.send(msg);
    console.log("Message sent via SendGrid:", response[0].statusCode);
  } catch (err) {
    console.error("SendGrid failed:", err.message);
    if (err.response) {
      console.error(err.response.body);
    }
    throw err;
  }
};

export const sendTaskReminderEmail = async (to, taskTitle, reminderTime) => {
  const timeString = reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msg = {
    to: to,
    from: process.env.EMAIL_FROM || '"Tap & Thrive" <noreply@tapandthrive.com>',
    subject: `Reminder: ${taskTitle}`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px; margin: auto;">
             <h2 style="color: #4F46E5; text-align: center;">Task Reminder</h2>
             <p style="color: #475569; font-size: 16px; line-height: 1.5; text-align: center;">This is a friendly reminder for your upcoming task:</p>
             <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; border: 1px solid #e2e8f0;">
               <h3 style="color: #1e293b; margin: 0 0 10px 0;">${taskTitle}</h3>
               <p style="color: #4F46E5; font-weight: bold; margin: 0; font-size: 20px;">${timeString}</p>
             </div>
             <p style="color: #64748b; font-size: 14px; text-align: center;">Stay productive and keep thriving!</p>
           </div>`
  };

  try {
    const response = await sgMail.send(msg);
    console.log("Reminder sent via SendGrid:", response[0].statusCode);
  } catch (err) {
    console.error("SendGrid reminder failed:", err.message);
    if (err.response) {
      console.error(err.response.body);
    }
  }
};
