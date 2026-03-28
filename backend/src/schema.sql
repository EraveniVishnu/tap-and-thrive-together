-- ================================================
-- TAP & THRIVE TOGETHER - PostgreSQL Schema
-- Run this against your own PostgreSQL database:
--   psql -U postgres -d tap_thrive -f schema.sql
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------
-- TABLE: profiles
-- Stores user accounts and gamification stats
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url    TEXT,
  age           INT,
  points        INT NOT NULL DEFAULT 0,
  streak        INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------
-- TABLE: tasks
-- User-created tasks (daily, occasional, suggested)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL CHECK (type IN ('daily', 'occasional', 'suggested')),
  priority      TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  reminder_time TIMESTAMPTZ,
  due_date      TIMESTAMPTZ,
  date          DATE,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in progress', 'completed', 'missed')),
  is_completed  BOOLEAN NOT NULL DEFAULT false,
  completed_at  TIMESTAMPTZ,
  points        INT NOT NULL DEFAULT 5,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------
-- TABLE: notifications
-- In-app notifications for users
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('upcoming', 'missed', 'completed', 'info')),
  task_id    UUID REFERENCES tasks(id) ON DELETE SET NULL,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------
-- TABLE: email_verification_otps
-- Stores OTP codes for email verification during registration
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS email_verification_otps (
  email      TEXT PRIMARY KEY,
  otp        TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------
-- TABLE: suggested_tasks_pool
-- System seed pool of suggested tasks
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS suggested_tasks_pool (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  description      TEXT,
  category         TEXT,
  difficulty       TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points           INT NOT NULL DEFAULT 5,
  last_assigned_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- TABLE: daily_user_tasks
-- Daily suggested task assigned to each user
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_user_tasks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id      UUID NOT NULL REFERENCES suggested_tasks_pool(id),
  title        TEXT NOT NULL,
  description  TEXT,
  points       INT NOT NULL DEFAULT 5,
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  completed    BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, date)
);

-- ------------------------------------------------
-- TABLE: daily_suggested_tasks
-- Tracks user interactions with suggested tasks
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_suggested_tasks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id      UUID NOT NULL REFERENCES suggested_tasks_pool(id),
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  completed    BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ
);

-- ------------------------------------------------
-- TABLE: badges
-- Badges earned by users
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS badges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT NOT NULL,
  earned_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- TABLE: user_stats
-- Aggregated stats per user (one row per user)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS user_stats (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_tasks_completed    INT NOT NULL DEFAULT 0,
  daily_tasks_completed    INT NOT NULL DEFAULT 0,
  suggested_tasks_completed INT NOT NULL DEFAULT 0,
  total_points             INT NOT NULL DEFAULT 0,
  current_streak           INT NOT NULL DEFAULT 0,
  longest_streak           INT NOT NULL DEFAULT 0,
  weekly_completion_rate   NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- TABLE: weekly_progress
-- Weekly task completion per day
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS weekly_progress (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date      DATE NOT NULL,
  day       TEXT NOT NULL,
  completed INT NOT NULL DEFAULT 0,
  total     INT NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

-- ------------------------------------------------
-- TABLE: task_distribution
-- Percentage breakdown of task types per user
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS task_distribution (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- VIEW: leaderboard
-- Top users by points (mirrors Supabase view)
-- ------------------------------------------------
CREATE OR REPLACE VIEW leaderboard AS
  SELECT id, username, points, streak, avatar_url
  FROM profiles
  ORDER BY points DESC;

-- ------------------------------------------------
-- SEED: suggested_tasks_pool
-- Default suggested tasks
-- ------------------------------------------------
INSERT INTO suggested_tasks_pool (title, description, category, difficulty, points) VALUES
  ('Take a 5-minute walk', 'Step away from your desk and take a short walk to refresh your mind.', 'health', 'easy', 5),
  ('Drink a glass of water', 'Stay hydrated by drinking a full glass of water right now.', 'health', 'easy', 3),
  ('Do 10 push-ups', 'Quick exercise to boost energy and focus.', 'fitness', 'easy', 8),
  ('Meditate for 5 minutes', 'Close your eyes and focus on your breathing for 5 minutes.', 'mindfulness', 'easy', 7),
  ('Read for 15 minutes', 'Pick up a book or article and read for 15 minutes.', 'learning', 'easy', 6),
  ('Stretch your body', 'Stand up and do a full body stretch to reduce tension.', 'health', 'easy', 5),
  ('Write 3 things you are grateful for', 'Reflect on positive aspects of your day and write them down.', 'mindfulness', 'easy', 8),
  ('Clean your workspace', 'Spend 10 minutes organizing your desk and work area.', 'productivity', 'easy', 6),
  ('Plan your next day', 'Write down your top 3 priorities for tomorrow.', 'productivity', 'medium', 10),
  ('Learn something new for 20 minutes', 'Watch a tutorial or read about a topic you want to learn.', 'learning', 'medium', 12)
ON CONFLICT DO NOTHING;
