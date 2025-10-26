# Stealth Mode Configuration

CheckMyOpsec uses Hyperbrowser's stealth mode to avoid bot detection when scanning social media platforms.

## What is Stealth Mode?

Stealth mode masks the automated nature of browser sessions, making them appear as legitimate human users. This is crucial for:

- **LinkedIn** - Extremely aggressive bot detection
- **Twitter/X** - Detects and blocks automation
- **GitHub** - May rate limit suspicious activity
- **Facebook** - Blocks automated access

## Stealth Features Enabled

### 1. Core Stealth Mode
```javascript
sessionOptions: {
  stealth: true,  // Masks automation signals
}
```

**What it does:**
- Removes `navigator.webdriver` flag
- Hides Selenium/Playwright markers
- Masks Chrome DevTools Protocol
- Makes browser appear non-automated

### 2. Real User Agent
```javascript
sessionOptions: {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}
```

**Why it matters:**
- Default Hyperbrowser user agent may look suspicious
- Uses legitimate Chrome 120 on macOS user agent
- Websites check user agent to detect bots
- Matches most common user configuration

### 3. Cookie Acceptance
```javascript
sessionOptions: {
  acceptCookies: true,
}
```

**Benefits:**
- Real users accept cookies
- Bots often reject or ignore cookies
- Helps with authentication persistence
- Reduces CAPTCHA challenges

## Implementation

### LinkedIn Session
```javascript
const session = await hbClient.sessions.create({
  sessionOptions: {
    acceptCookies: true,
    stealth: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
  },
});
```

### Twitter Session
```javascript
const session = await hbClient.sessions.create({
  sessionOptions: {
    acceptCookies: true,
    stealth: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
  },
});
```

### GitHub/Facebook Sessions
```javascript
const result = await hbClient.agents.hyperAgent.startAndWait({
  task: searchQuery,
  sessionOptions: {
    stealth: true,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
  },
});
```

## What Stealth Mode Hides

### Detection Signals Masked
- ✅ `navigator.webdriver` property
- ✅ Chrome DevTools Protocol presence
- ✅ Selenium/Playwright signatures
- ✅ Headless browser indicators
- ✅ Automated click patterns (mitigated by AI navigation)

### What It Doesn't Hide
- ❌ Hyperbrowser IP addresses (use proxy if needed)
- ❌ Rapid repeated logins (wait between scans)
- ❌ Unusual navigation patterns (AI helps but not perfect)
- ❌ Account age (use established accounts)

## Additional Evasion Techniques

### 1. Natural Navigation with AI
The AI agents navigate pages naturally:
- Scroll like humans
- Click relevant elements
- Read content before acting
- Handle popups and modals

### 2. Explicit Login Instructions
Agents are told to:
- Avoid SSO buttons
- Use traditional login forms
- Fill fields in correct order
- Wait for page loads

### 3. Session Management
- Sessions created fresh per scan
- Cookies isolated per session
- Sessions destroyed after use
- No cross-contamination

## Advanced Options (Optional)

### Residential Proxy
For maximum stealth, add proxy (requires Hyperbrowser paid plan):

```javascript
sessionOptions: {
  stealth: true,
  acceptCookies: true,
  userAgent: '...',
  proxy: {
    server: 'residential-proxy.example.com:8080',
    username: 'your-username',
    password: 'your-password',
  },
}
```

**Benefits:**
- Real residential IP addresses
- Bypasses IP-based blocking
- Looks like home user, not datacenter
- Costs extra credits

### Custom Viewport
Randomize browser size:

```javascript
sessionOptions: {
  stealth: true,
  viewport: {
    width: 1920,
    height: 1080,
  },
}
```

### Geolocation
Set location to match target:

```javascript
sessionOptions: {
  stealth: true,
  geolocation: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
}
```

## Monitoring Stealth Effectiveness

### Check Detection
Visit these test sites to verify stealth:
- https://bot.sannysoft.com/
- https://arh.antoinevastel.com/bots/areyouheadless
- https://pixelscan.net/

### Hyperbrowser Session Logs
1. Go to https://app.hyperbrowser.ai/sessions
2. Click on your session
3. Look for:
   - Successful logins without CAPTCHA
   - No "bot detected" errors
   - Normal page load times

### LinkedIn/Twitter Behavior
**Good signs:**
- Login succeeds on first try
- No CAPTCHA challenges
- Profile loads completely
- Can navigate multiple pages
- No account warnings

**Bad signs:**
- CAPTCHA on every login
- "Unusual activity" warnings
- Account temporarily locked
- Sessions fail quickly
- Rate limiting errors

## Best Practices

### 1. Use Established Accounts
- ✅ Accounts 6+ months old
- ✅ Some activity history (posts, connections)
- ✅ Verified email/phone
- ❌ Brand new accounts
- ❌ Accounts with no activity

### 2. Warm Up Accounts
Before automated scanning:
1. Log in manually 2-3 times
2. Browse profiles manually
3. Perform normal actions
4. Wait 24 hours
5. Then start automated scans

### 3. Rate Limiting
Don't abuse the accounts:
- Max 3-5 scans per day per account
- Wait 1-2 hours between scans
- Vary scan patterns
- Don't scan same person repeatedly

### 4. Account Rotation
For heavy usage:
- Use multiple LinkedIn/Twitter accounts
- Rotate between them
- Spread scans across accounts
- Reduces per-account suspicion

### 5. Monitor for Flags
Watch for:
- Login emails from platforms
- Security alerts
- Account locked messages
- Verification requests

If flagged, **stop scanning** and wait 48 hours.

## Troubleshooting Stealth Issues

### "Unusual activity detected"
**Cause:** Platform flagged automation

**Fix:**
1. Stop scanning for 24-48 hours
2. Log in manually and verify
3. Complete any security challenges
4. Use different account temporarily
5. Consider residential proxy

### CAPTCHAs on every login
**Cause:** IP address or behavior flagged

**Fix:**
1. Wait between attempts (30+ minutes)
2. Use residential proxy (Hyperbrowser option)
3. Verify stealth mode is enabled
4. Try different time of day
5. Use different account

### Account temporarily locked
**Cause:** Too many rapid logins

**Fix:**
1. Wait 24 hours minimum
2. Change password when unlocked
3. Verify phone/email
4. Reduce scan frequency
5. Use account rotation

## Code Reference

All stealth mode code is in [lib/scanner.js](lib/scanner.js):

- **Line 15-22**: LinkedIn session with stealth
- **Line 57-64**: Twitter session with stealth
- **Line 209-216**: GitHub session with stealth
- **Line 375-382**: Facebook session with stealth

## Further Reading

- [Hyperbrowser Stealth Documentation](https://docs.hyperbrowser.ai/features/stealth)
- [Bot Detection Techniques](https://antoinevastel.com/bot%20detection/2021/11/20/fp-scanner-library-demo.html)
- [Browser Fingerprinting](https://fingerprintjs.com/blog/browser-fingerprinting-techniques/)

## Summary

✅ Stealth mode is **enabled by default** on all scans
✅ Uses real user agent, not bot signature
✅ Accepts cookies naturally
✅ AI navigation appears human-like
✅ Sessions are isolated and destroyed after use

This provides good protection against basic bot detection. For maximum stealth, consider:
- Residential proxies
- Account rotation
- Rate limiting
- Manual account warmup

The current configuration should work well for moderate usage (3-5 scans per day).
