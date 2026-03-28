import pool from '../db.js';

export const createNotification = async (
  userId,
  title,
  message,
  type,
  taskId
) => {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, task_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, message, type, taskId || null]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
};

export const markMissedTasks = async () => {
  try {
    // Find tasks that are:
    // 1. Pending or In Progress
    // 2. Either due_date < NOW() OR (date < CURRENT_DATE)
    // 3. Are not already marked as missed
    const result = await pool.query(`
      UPDATE tasks 
      SET status = 'missed'
      WHERE status IN ('pending', 'in progress')
        AND (
          (due_date IS NOT NULL AND due_date < NOW())
          OR 
          (date IS NOT NULL AND date < CURRENT_DATE)
        )
      RETURNING *
    `);

    if (result.rows.length > 0) {
      console.log(`📉 Marked ${result.rows.length} tasks as missed.`);
      
      for (const task of result.rows) {
        await createNotification(
          task.user_id,
          'Task Missed',
          `You missed your task: "${task.title}". Don't worry, you can always try again!`,
          'missed',
          task.id
        );
      }
    }
  } catch (err) {
    console.error('Error marking missed tasks:', err);
  }
};
