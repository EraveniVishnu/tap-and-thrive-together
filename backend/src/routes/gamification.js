import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/gamification/badges  – get all earned badges for the current user
router.get('/badges', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, icon, earned_at FROM badges WHERE user_id = $1 ORDER BY earned_at ASC`,
      [req.userId]
    );
    
    // Map DB rows to the frontend Badge type
    const badges = result.rows.map(row => ({
      id: row.icon, // We use 'icon' column to store the badge string ID e.g. 'first_task'
      name: row.name,
      description: row.description,
      earned: true,
      earnedAt: row.earned_at
    }));

    res.json(badges);
  } catch (err) {
    console.error('GET /gamification/badges error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/gamification/badges  – save a newly earned badge
router.post('/badges', async (req, res) => {
  const { id: badgeId, name, description } = req.body;
  
  if (!badgeId || !name || !description) {
    res.status(400).json({ error: 'Missing required badge fields (id, name, description)' });
    return;
  }
  
  try {
    // Check if the user already has this badge
    const existing = await pool.query(
      `SELECT id FROM badges WHERE user_id = $1 AND icon = $2`, 
      [req.userId, badgeId]
    );
    
    if (existing.rows.length > 0) {
      res.status(200).json({ success: true, message: 'Badge already earned' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO badges (user_id, name, description, icon, earned_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [req.userId, name, description, badgeId]
    );

    res.status(201).json({
      id: result.rows[0].icon,
      name: result.rows[0].name,
      description: result.rows[0].description,
      earned: true,
      earnedAt: result.rows[0].earned_at
    });
  } catch (err) {
    console.error('POST /gamification/badges error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
