# Authenticated Scanning

CheckMyOpsec now supports authenticated scanning for LinkedIn and Twitter/X, which dramatically improves the quality and depth of OSINT scans.

## Why Use Authenticated Scanning?

### Without Authentication (Public Only)
- Limited profile visibility
- Can't see many LinkedIn profiles (requires login)
- Twitter protected accounts are invisible
- No access to full post history
- Many profiles appear as "not found"

### With Authentication (Full Access)
- ✅ Access to all LinkedIn profiles (even private ones in your network)
- ✅ View full tweet history, even protected accounts you follow
- ✅ See detailed job descriptions and company information
- ✅ Read all posts and articles mentioning tech stack
- ✅ Access skills, endorsements, and recommendations
- ✅ Much higher accuracy and completeness

## How It Works

1. **Session Creation**: When a scan starts, Hyperbrowser creates a new **stealth mode** browser session
2. **Stealth Features**: Browser fingerprint is randomized, uses real user agent to avoid detection
3. **Authentication**: The agent logs into LinkedIn/Twitter with your credentials
4. **Search & Analysis**: Once authenticated, the agent searches for the target person
5. **Data Collection**: Analyzes profiles, posts, tweets, and other public (to you) information
6. **Session Cleanup**: Browser session is destroyed after the scan completes

### Stealth Mode Features

CheckMyOpsec uses Hyperbrowser's stealth mode to avoid bot detection:

- ✅ **Stealth Mode Enabled**: Masks automation signals that websites look for
- ✅ **Real User Agent**: Uses legitimate Chrome user agent string
- ✅ **Cookie Acceptance**: Automatically accepts cookies to appear more human
- ✅ **Randomized Fingerprinting**: Browser fingerprint changes per session (if supported)
- ✅ **Natural Navigation**: AI agents navigate pages like a real user would

This helps prevent:
- LinkedIn/Twitter detecting automated access
- Account locks from suspicious activity
- CAPTCHA challenges
- Rate limiting

## Setup

Add these environment variables to your `.env.local`:

```bash
# LinkedIn credentials
LINKEDIN_USERNAME=your-email@example.com
LINKEDIN_PASSWORD=your-password

# Twitter/X credentials
X_USERNAME=your-twitter-username
X_PASSWORD=your-twitter-password
```

## Security Considerations

### Your Credentials Are Safe
- ✅ Credentials are stored locally in `.env.local` (not in version control)
- ✅ Sessions are isolated in Hyperbrowser's cloud browsers
- ✅ No credentials are stored in the database
- ✅ Each session is destroyed after use
- ✅ Credentials are only used for login, never logged or transmitted elsewhere

### Best Practices
1. **Use a dedicated account**: Consider creating a separate LinkedIn/Twitter account just for OSINT scanning
2. **Enable 2FA carefully**: If you enable two-factor auth, you may need to use app-specific passwords
3. **Monitor login activity**: Check your LinkedIn/Twitter login history regularly
4. **Rate limiting**: Don't run too many scans in quick succession to avoid account flags

### What Hyperbrowser Sees
- Your credentials are sent to Hyperbrowser's agent to log in
- Sessions run in isolated cloud browsers
- Hyperbrowser logs agent actions for debugging
- Read their privacy policy: https://hyperbrowser.ai/privacy

### Alternative: Use Without Authentication
If you're uncomfortable providing credentials, you can still use CheckMyOpsec without authentication:
- Simply don't set `LINKEDIN_USERNAME`, `LINKEDIN_PASSWORD`, `X_USERNAME`, or `X_PASSWORD`
- The scanner will fall back to public-only scanning
- Results will be less comprehensive but still useful

## What Gets Scanned (Authenticated)

### LinkedIn (with auth)
```
1. Navigate to LinkedIn and log in
2. Search for "{fullName}" at {company}
3. Open their profile
4. Analyze:
   - Job title and full description
   - Recent posts (at least 10)
   - Skills and endorsements
   - Articles they've written
   - Comments on other posts
5. Extract tech stack mentions
6. Identify security practice discussions
7. Check for infrastructure details
```

### Twitter/X (with auth)
```
1. Navigate to Twitter and log in
2. Search for @{username} or name: {fullName}
3. Open their profile
4. Analyze:
   - Bio and location
   - Recent tweets (at least 20)
   - Replies and quote tweets
   - Media and links shared
5. Extract work-related content
6. Identify tech stack mentions
7. Check for company/project leaks
```

## Enhanced Detection

With authenticated access, the scanner can detect:

### LinkedIn
- **Tech Stack**: React, Node.js, Python, AWS, Kubernetes, Docker, TypeScript, PostgreSQL, MongoDB, Redis, Kafka, Jenkins, Terraform
- **Security Tools**: VPN, Firewall, Penetration testing, Vulnerability scanning
- **Infrastructure**: Cloud providers, CI/CD tools, monitoring solutions
- **Posts**: Blog posts, articles, comments mentioning internal systems

### Twitter
- **Work Keywords**: Work, job, office, team, project, deployment, release, sprint
- **Tech Stack**: Any mentions of programming languages, frameworks, or cloud services
- **Tools**: Development tools, version control, project management software

## Scan Quality Comparison

### Public Scan (No Auth)
```
✗ LinkedIn: "Profile requires login to view"
✗ Twitter: "Protected account - 0 tweets visible"
Score: 95/100 (not enough data to score accurately)
Findings: 2
```

### Authenticated Scan
```
✓ LinkedIn: Profile found with 47 posts analyzed
  - Found 8 mentions of tech stack (React, AWS, PostgreSQL)
  - Found 3 posts discussing deployment practices
  - Detailed job description reveals infrastructure
✓ Twitter: @username found with 234 tweets analyzed
  - 12 tweets mention work projects
  - 5 tweets reveal specific tools used
  - Bio mentions company name
Score: 62/100 (multiple OPSEC issues found)
Findings: 9
Recommendations: 7
```

## Troubleshooting

### Login Failures
If authentication fails:
1. **Check credentials**: Make sure username/password are correct
2. **2FA issues**: Disable 2FA or use app-specific password
3. **Rate limiting**: Wait a few hours if you've been making many requests
4. **CAPTCHA**: LinkedIn/Twitter may show CAPTCHA - Hyperbrowser usually handles this
5. **Account locked**: Check if your account requires password reset

### Session Issues
If sessions aren't cleaning up:
```bash
# List all active Hyperbrowser sessions
curl https://api.hyperbrowser.ai/api/sessions \
  -H 'x-api-key: YOUR_KEY'

# Manually stop a session
curl -X PUT https://api.hyperbrowser.ai/api/sessions/{SESSION_ID}/stop \
  -H 'x-api-key: YOUR_KEY'
```

## Privacy Notice

**Your scanning account credentials are used to:**
- Log into LinkedIn/Twitter on your behalf
- Search for and view profiles
- Read posts, tweets, and profile information
- Extract data about the scan target

**They are NOT used to:**
- Post content on your behalf
- Send messages or connection requests
- Follow/unfollow accounts
- Modify your profile
- Access your private messages

All agent actions are read-only searches and profile views.
