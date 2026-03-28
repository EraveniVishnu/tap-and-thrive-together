import cron from 'node-cron';
import pool from '../db.js';
import { sendTaskReminderEmail } from '../utils/emailService.js';
import { createNotification, markMissedTasks } from './notificationService.js';

export const initReminderService = () => {
  console.log('🚀 Task Reminder Service initialized (Running every minute)');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      // 1. Mark missed tasks (tasks where due_date < NOW())
      await markMissedTasks();

      // 2. Find tasks for upcoming reminders
      // Find tasks that:
      // 1. Have a reminder_time set
      // 2. Are within the next 10 minutes
      // 3. Haven't had a reminder sent yet
      // 4. Are not already completed or missed
      const result = await pool.query(`
        SELECT t.*, p.email 
        FROM tasks t
        JOIN profiles p ON t.user_id = p.id
        WHERE t.reminder_time IS NOT NULL
          AND t.reminder_sent = false
          AND t.status NOT IN ('completed', 'missed')
          AND t.reminder_time <= NOW() + INTERVAL '10 minutes'
          AND t.reminder_time > NOW() - INTERVAL '5 minutes'
      `);

      if (result.rows.length > 0) {
        console.log(`⏰ Found ${result.rows.length} upcoming tasks to remind.`);

        for (const task of result.rows) {
          try {
            // Send email
            await sendTaskReminderEmail(task.email, task.title, new Date(task.reminder_time));
            
            // Create in-app notification
            await createNotification(
              task.user_id,
              'Upcoming Task',
              `Your task "${task.title}" is starting soon at ${new Date(task.reminder_time).toLocaleTimeString()}.`,
              'upcoming',
              task.id
            );

            // Mark as sent
            await pool.query('UPDATE tasks SET reminder_sent = true WHERE id = $1', [task.id]);
          } catch (err) {
            console.error(`Failed to send reminder for task ${task.id}:`, err);
          }
        }
      }
    } catch (err) {
      console.error('Error in reminder cron job:', err);
    }
  });
};
