import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

console.log('Environment variables check:');
console.log('HYPERBROWSER_API_KEY:', process.env.HYPERBROWSER_API_KEY ? 'SET' : 'NOT SET');
console.log('LINKEDIN_USERNAME:', process.env.LINKEDIN_USERNAME ? 'SET' : 'NOT SET');
console.log('LINKEDIN_PASSWORD:', process.env.LINKEDIN_PASSWORD ? 'SET' : 'NOT SET');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

// Test the scanner import
try {
  const { scanLinkedIn } = await import('./lib/scanner.js');
  console.log('✅ Scanner module imported successfully');
  
  // Test a simple scan
  console.log('Testing LinkedIn scan...');
  const result = await scanLinkedIn({ fullName: 'Test User', company: 'Test Company' });
  console.log('Scan result:', {
    findingsCount: result.findings?.length || 0,
    liveUrl: result.liveUrl ? 'SET' : 'NOT SET',
    sessionId: result.sessionId ? 'SET' : 'NOT SET'
  });
  
} catch (error) {
  console.error('❌ Error testing scanner:', error.message);
}

process.exit(0);
