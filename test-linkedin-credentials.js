import { config } from 'dotenv';
import { Hyperbrowser } from '@hyperbrowser/sdk';

config({ path: '.env.local' });

async function testLinkedInCredentials() {
  try {
    console.log('Testing LinkedIn credentials...');
    console.log('LINKEDIN_USERNAME:', process.env.LINKEDIN_USERNAME ? 'SET' : 'NOT SET');
    console.log('LINKEDIN_PASSWORD:', process.env.LINKEDIN_PASSWORD ? 'SET' : 'NOT SET');
    
    if (!process.env.LINKEDIN_USERNAME || !process.env.LINKEDIN_PASSWORD) {
      console.log('❌ LinkedIn credentials not set - this is why live URL is null');
      console.log('   The scanner will run without authentication, so no live URL is generated');
      return;
    }

    const hbClient = new Hyperbrowser({
      apiKey: process.env.HYPERBROWSER_API_KEY,
    });

    console.log('Creating LinkedIn session...');
    const session = await hbClient.sessions.create({
      sessionOptions: {
        acceptCookies: true,
        stealth: true,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    console.log('✅ Session created successfully!');
    console.log('Session ID:', session.id);
    console.log('Live URL:', session.liveUrl);
    
    // Clean up
    await hbClient.sessions.stop(session.id);
    console.log('✅ Session stopped');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Invalid API key')) {
      console.error('   → Check your HYPERBROWSER_API_KEY');
    } else if (error.message.includes('Insufficient credits')) {
      console.error('   → Add credits to your Hyperbrowser account');
    }
  }
  process.exit(0);
}

testLinkedInCredentials();
