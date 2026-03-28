import pg from 'pg';
import nodemailer from 'nodemailer';

const dbUrl = "postgresql://neondb_owner:npg_vD0Oo6YLbBZR@ep-muddy-hill-an32fmv2-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new pg.Pool({ connectionString: dbUrl });

async function test() {
  try {
    console.log("Testing DB connection...");
    const existing = await pool.query('SELECT id FROM profiles LIMIT 1');
    console.log("Profiles check passed");

    const email = "yadavvishnu0082@gmail.com";
    const otp = "123456";
    const expiresAt = new Date(Date.now() + 10 * 60000);

    console.log("Testing OTP table...");
    await pool.query(
      `INSERT INTO email_verification_otps (email, otp, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE 
       SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
      [email, otp, expiresAt]
    );
    console.log("OTP insert passed");

    console.log("Testing Nodemailer TLS connection...");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "yadavvishnu0082@gmail.com",
        pass: "vqcz rmhb ltki gaun",
      },
    });

    const info = await transporter.sendMail({
      from: '"Tap & Thrive" <yadavvishnu0082@gmail.com>',
      to: email,
      subject: "Test email",
      text: "test",
    });
    console.log("Email sent successfully! ", info.messageId);
    
  } catch (err) {
    console.error("Test failed specifically with error: ", err);
  } finally {
    pool.end();
  }
}

test();
