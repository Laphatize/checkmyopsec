import { config } from 'dotenv';
import { createClient } from '@libsql/client';

config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function checkRecentScans() {
  try {
    const result = await db.execute('SELECT id, full_name, status, live_url, session_id, created_at FROM scans ORDER BY created_at DESC LIMIT 3');
    console.log('Recent scans:');
    result.rows.forEach(scan => {
      console.log(`- ${scan.full_name} (${scan.status})`);
      console.log(`  live_url: ${scan.live_url || 'null'}`);
      console.log(`  session_id: ${scan.session_id || 'null'}`);
      console.log(`  created: ${new Date(scan.created_at * 1000).toLocaleString()}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkRecentScans();
