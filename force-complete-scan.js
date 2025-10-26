import { config } from 'dotenv';
import { createClient } from '@libsql/client';

config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function forceCompleteScan() {
  try {
    // Get the most recent scanning scan
    const result = await db.execute('SELECT id FROM scans WHERE status = "scanning" ORDER BY created_at DESC LIMIT 1');
    
    if (result.rows.length === 0) {
      console.log('No scanning scans found');
      return;
    }
    
    const scanId = result.rows[0].id;
    console.log('Force completing scan:', scanId);
    
    // Force complete the scan
    const response = await fetch(`http://localhost:3000/api/scans/${scanId}/force-complete`, {
      method: 'POST',
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

forceCompleteScan();
