import { config } from 'dotenv';
import { createClient } from '@libsql/client';

// Load environment variables
config({ path: '.env.local' });

async function main() {
  console.log('Initializing database...');
  console.log('Database URL:', process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    process.exit(1);
  }

  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    console.log('✅ Created users table');

    // Create scans table
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
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        completed_at INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('✅ Created scans table');

    // Create findings table
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
    console.log('✅ Created findings table');

    // Create indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id)
    `);
    console.log('✅ Created index on scans(user_id)');

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_findings_scan_id ON findings(scan_id)
    `);
    console.log('✅ Created index on findings(scan_id)');

    console.log('\n🎉 Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

main();
