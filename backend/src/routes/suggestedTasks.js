import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/suggested-tasks/today
 *
 * Replaces the Supabase RPC calls:
 *   - supabase.rpc('assign_daily_task', { user_id })
 *   - supabase.from('daily_user_tasks').select(...)
 *
 * Logic:
 *  1. Check if user already has a task for today → return it
 *  2. If not, pick least-recently-assigned task from suggested_tasks_pool
 *  3. Insert into daily_user_tasks and return it
 */
router.get('/today', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  try {
    // 1. Check for existing task today
    const existing = await pool.query(
      `SELECT dut.*, stp.category, stp.difficulty
       FROM daily_user_tasks dut
       LEFT JOIN suggested_tasks_pool stp ON stp.id = dut.task_id
       WHERE dut.user_id = $1 AND dut.date = $2`,
      [req.userId, today]
    );

    if (existing.rows.length > 0) {
      res.json(existing.rows[0]);
      return;
    }

    // 2. Pick a task from the pool (least recently assigned)
    const poolResult = await pool.query(
      `SELECT * FROM suggested_tasks_pool
       ORDER BY last_assigned_at ASC NULLS FIRST, RANDOM()
       LIMIT 1`
    );

    if (poolResult.rows.length === 0) {
      res.status(404).json({ error: 'No suggested tasks available in pool' });
      return;
    }

    const poolTask = poolResult.rows[0];

    // 3. Insert into daily_user_tasks
    const insertResult = await pool.query(
      `INSERT INTO daily_user_tasks (user_id, task_id, title, description, points, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, date) DO UPDATE
         SET task_id = EXCLUDED.task_id,
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             points = EXCLUDED.points
       RETURNING *`,
      [req.userId, poolTask.id, poolTask.title, poolTask.description, poolTask.points, today]
    );

    // Update last_assigned_at on pool task
    await pool.query(
      'UPDATE suggested_tasks_pool SET last_assigned_at = NOW() WHERE id = $1',
      [poolTask.id]
    );

    res.json({ ...insertResult.rows[0], category: poolTask.category, difficulty: poolTask.difficulty });
  } catch (err) {
    console.error('GET /suggested-tasks/today error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/suggested-tasks/:id/complete
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const taskResult = await client.query(
      'SELECT * FROM daily_user_tasks WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (taskResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const task = taskResult.rows[0];
    if (task.completed) {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'Task already completed' });
      return;
    }

    await client.query(
      'UPDATE daily_user_tasks SET completed = true, completed_at = NOW() WHERE id = $1',
      [id]
    );

    // Award points + increment streak
    const profileResult = await client.query(
      'SELECT points, streak FROM profiles WHERE id = $1',
      [req.userId]
    );
    const profile = profileResult.rows[0];
    const newPoints = (profile.points || 0) + task.points;
    const newStreak = (profile.streak || 0) + 1;

    await client.query(
      'UPDATE profiles SET points = $1, streak = $2, updated_at = NOW() WHERE id = $3',
      [newPoints, newStreak, req.userId]
    );

    await client.query('COMMIT');
    res.json({ success: true, points: newPoints, streak: newStreak });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /suggested-tasks/:id/complete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;
