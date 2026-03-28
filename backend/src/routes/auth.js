import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { sendVerificationEmail } from '../utils/emailService.js';

const router = Router();

// Generate a random 6-digit string
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  try {
    // Check if email already registered
    const existing = await pool.query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Email is already taken' });
      return;
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    // Store/upsert OTP in the database
    await pool.query(
      `INSERT INTO email_verification_otps (email, otp, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE 
       SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
      [email, otp, expiresAt]
    );

    // Send the email
    await sendVerificationEmail(email, otp);

    res.json({ success: true, message: 'Verification code sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack, full: String(err) });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password, otp } = req.body;

  if (!username || !email || !password || !otp) {
    res.status(400).json({ error: 'Username, email, password, and verification code (otp) are required' });
    return;
  }

  try {
    // Check if username already taken (email is already checked in send-otp but we should re-check)
    const existing = await pool.query(
      'SELECT id FROM profiles WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Username or email already taken' });
      return;
    }

    // Verify OTP
    const otpResult = await pool.query(
      'SELECT otp, expires_at FROM email_verification_otps WHERE email = $1',
      [email]
    );

    if (otpResult.rows.length === 0) {
      res.status(400).json({ error: 'No verification code requested for this email' });
      return;
    }

    const verificationRecord = otpResult.rows[0];
    if (verificationRecord.otp !== otp) {
      res.status(400).json({ error: 'Invalid verification code' });
      return;
    }

    if (new Date() > new Date(verificationRecord.expires_at)) {
      res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO profiles (username, email, password_hash, points, streak)
       VALUES ($1, $2, $3, 0, 0)
       RETURNING id, username, email, points, streak, created_at`,
      [username, email, passwordHash]
    );

    const user = result.rows[0];

    // Create initial user_stats row
    await pool.query(
      'INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
      [user.id]
    );

    // Delete the used OTP
    await pool.query('DELETE FROM email_verification_otps WHERE email = $1', [email]);

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        points: user.points,
        streak: user.streak,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        points: user.points,
        streak: user.streak,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me  – returns current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, points, streak, avatar_url, age, created_at FROM profiles WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      points: user.points,
      streak: user.streak,
      avatarUrl: user.avatar_url,
      age: user.age,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('GET /me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
