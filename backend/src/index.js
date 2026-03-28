import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import tasksRoutes from './routes/tasks.js';
import profilesRoutes from './routes/profiles.js';
import suggestedTasksRoutes from './routes/suggestedTasks.js';
import gamificationRoutes from './routes/gamification.js';
import notificationsRoutes from './routes/notifications.js';
import { initReminderService } from './services/reminderService.js';

dotenv.config({ path: '.env.example' });

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow any origin to support Vercel preview and production URLs without trailing slash issues
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({ 
    message: 'TAP & Thrive Backend API is running', 
    services: {
      reminders: 'Active (Check every 60s, 10m before task)',
      database: 'Connected'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/suggested-tasks', suggestedTasksRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start background services
initReminderService();

app.listen(PORT, () => {
  console.log(`✅ TAP & Thrive backend running on http://localhost:${PORT}`);
});

export default app;
