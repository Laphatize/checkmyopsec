import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

// Initialize database schema
export async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      company TEXT,
      location TEXT,
      username_patterns TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      score INTEGER,
      live_url TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      completed_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS findings (
      id TEXT PRIMARY KEY,
      scan_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      url TEXT,
      finding_type TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL,
      points_deducted INTEGER NOT NULL DEFAULT 0,
      raw_data TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (scan_id) REFERENCES scans(id)
    )
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id)
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_findings_scan_id ON findings(scan_id)
  `);
}

export default db;
