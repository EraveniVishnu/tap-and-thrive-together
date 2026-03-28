import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/profiles/me
router.get('/me', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, points, streak, avatar_url, age, created_at, updated_at
       FROM profiles WHERE id = $1`,
      [req.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    const p = result.rows[0];
    res.json({
      id: p.id,
      username: p.username,
      email: p.email,
      points: p.points,
      streak: p.streak,
      avatarUrl: p.avatar_url,
      age: p.age,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    });
  } catch (err) {
    console.error('GET /profiles/me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/profiles/me  – update profile fields
router.put('/me', async (req, res) => {
  const { username, avatarUrl, age, points, streak } = req.body;

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (username !== undefined) { fields.push(`username = $${idx++}`); values.push(username); }
    if (avatarUrl !== undefined) { fields.push(`avatar_url = $${idx++}`); values.push(avatarUrl); }
    if (age !== undefined) { fields.push(`age = $${idx++}`); values.push(age); }
    if (points !== undefined) { fields.push(`points = $${idx++}`); values.push(points); }
    if (streak !== undefined) { fields.push(`streak = $${idx++}`); values.push(streak); }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    fields.push(`updated_at = NOW()`);
    values.push(req.userId);

    const result = await pool.query(
      `UPDATE profiles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, username, email, points, streak, avatar_url, age`,
      values
    );

    const p = result.rows[0];
    res.json({
      id: p.id,
      username: p.username,
      email: p.email,
      points: p.points,
      streak: p.streak,
      avatarUrl: p.avatar_url,
      age: p.age,
    });
  } catch (err) {
    console.error('PUT /profiles/me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/profiles/leaderboard  – top users by points
router.get('/leaderboard', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, points, streak, avatar_url FROM leaderboard LIMIT 50'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /profiles/leaderboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
