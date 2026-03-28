import { Router } from 'express';
import pool from '../db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/tasks  – get all tasks for the current user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /tasks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tasks  – create a new task
router.post('/', async (req, res) => {
  const { title, description, type, priority, reminderTime, dueDate, date, points } = req.body;

  if (!title || !type || !priority) {
    res.status(400).json({ error: 'title, type, and priority are required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks
         (user_id, title, description, type, priority, reminder_time, due_date, date, status, is_completed, points)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', false, $9)
       RETURNING *`,
      [
        req.userId,
        title,
        description || null,
        type.toLowerCase(),
        priority.toLowerCase(),
        reminderTime || null,
        dueDate || null,
        date || null,
        points || (type.toLowerCase() === 'suggested' ? 10 : 5),
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /tasks error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/tasks/:id  – update a task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, type, priority, reminderTime, dueDate, date, status, points } = req.body;

  try {
    // Verify ownership
    const existing = await pool.query('SELECT id FROM tasks WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (type !== undefined) { fields.push(`type = $${idx++}`); values.push(type.toLowerCase()); }
    if (priority !== undefined) { fields.push(`priority = $${idx++}`); values.push(priority.toLowerCase()); }
    if (reminderTime !== undefined) { fields.push(`reminder_time = $${idx++}`); values.push(reminderTime); }
    if (dueDate !== undefined) { fields.push(`due_date = $${idx++}`); values.push(dueDate); }
    if (date !== undefined) { fields.push(`date = $${idx++}`); values.push(date); }
    if (status !== undefined) {
      fields.push(`status = $${idx++}`); values.push(status.toLowerCase());
      if (status.toLowerCase() === 'completed') {
        fields.push(`is_completed = $${idx++}`); values.push(true);
        fields.push(`completed_at = $${idx++}`); values.push(new Date().toISOString());
      }
    }
    if (points !== undefined) { fields.push(`points = $${idx++}`); values.push(points); }

    if (fields.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /tasks/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/tasks/:id  – delete a task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /tasks/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/tasks/:id/complete  – mark task complete and award points/streak
router.post('/:id/complete', async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the task
    const taskResult = await client.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (taskResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const task = taskResult.rows[0];
    if (task.is_completed) {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'Task already completed' });
      return;
    }

    // Mark task complete
    await client.query(
      `UPDATE tasks SET is_completed = true, status = 'completed', completed_at = NOW() WHERE id = $1`,
      [id]
    );

    // Fetch current profile
    const profileResult = await client.query(
      'SELECT points, streak FROM profiles WHERE id = $1',
      [req.userId]
    );
    const profile = profileResult.rows[0];
    const newPoints = (profile.points || 0) + task.points;

    // Increment streak only for suggested tasks
    const newStreak = task.type === 'suggested'
      ? (profile.streak || 0) + 1
      : profile.streak;

    await client.query(
      'UPDATE profiles SET points = $1, streak = $2, updated_at = NOW() WHERE id = $3',
      [newPoints, newStreak, req.userId]
    );

    await client.query('COMMIT');

    res.json({ success: true, points: newPoints, streak: newStreak });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /tasks/:id/complete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;
