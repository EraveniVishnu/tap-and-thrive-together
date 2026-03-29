import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased to 10s for Neon DB cold wakes
  ssl: { rejectUnauthorized: false }, // Enforce SSL for external DB like Neon
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export default pool;
