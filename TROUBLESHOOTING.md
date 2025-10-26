# Troubleshooting Guide

Common issues and solutions for CheckMyOpsec.

## Authentication Issues

### LinkedIn Login Problems

**Problem: Agent clicks "Sign in with Apple" instead of using email/password**

**Solution:** The scanner has been updated to explicitly avoid SSO buttons. The agent now:
1. Looks for the "Email or phone" input field
2. Enters your LinkedIn email
3. Enters your password
4. Clicks the standard "Sign in" button (NOT SSO buttons)

**If it still happens:**
- Check that your `.env.local` has correct credentials
- LinkedIn may have changed their login page layout
- Try running the scan again (sometimes it works on retry)

**Problem: "Failed to create LinkedIn session"**

**Common causes:**
1. **Incorrect credentials** - Verify `LINKEDIN_USERNAME` and `LINKEDIN_PASSWORD` in `.env.local`
2. **2FA enabled** - LinkedIn two-factor authentication can block automated logins
3. **Account locked** - Too many login attempts may temporarily lock your account
4. **CAPTCHA** - LinkedIn may require CAPTCHA verification

**Solutions:**
- Use a dedicated LinkedIn account without 2FA
- Wait 15-30 minutes if account is locked
- Consider using a LinkedIn account that's already verified and aged

**Good News:** If LinkedIn authentication fails, the scanner now **automatically falls back to unauthenticated mode**. The scan will continue without logging in, using an ephemeral stealth session instead. This means:
- Scans won't crash due to login failures
- You'll still get results, though potentially less detailed
- No manual intervention needed

### Twitter/X Login Problems

**Problem: Agent clicks SSO buttons instead of username/password**

**Solution:** Updated to explicitly use the traditional login flow:
1. Navigate to twitter.com/login
2. Enter username in the first field
3. Click "Next"
4. Enter password
5. Click "Log in"

**Problem: "Failed to create Twitter session"**

**Common causes:**
1. **Incorrect username** - Twitter uses @username, not email
2. **Account suspended** - Check if your Twitter account is active
3. **2FA enabled** - Two-factor auth blocks automated login
4. **Phone verification required** - New accounts may need phone verification

**Solutions:**
- Use `X_USERNAME=pranavrameshh` (without @)
- Disable 2FA on the scanning account
- Use an established Twitter account
- Try both `twitter.com` and `x.com` URLs

**Good News:** If Twitter authentication fails, the scanner now **automatically falls back to unauthenticated mode**. The scan will continue without logging in, using an ephemeral stealth session instead.

## Scan Issues

### Scan Stuck in "Pending" Status

**Problem:** Scan never starts

**Causes:**
- Server didn't trigger the background scan
- API route error

**Solution:**
```bash
# Check server logs
npm run dev

# Look for errors like:
# "Scan execution error"
# "Hyperbrowser API error"
```

### Scan Stuck in "Scanning" Status

**Problem:** Scan runs forever

**Causes:**
- Hyperbrowser session timed out
- Login failed but didn't throw error
- Agent stuck on a page

**Solution:**
- Wait up to 10 minutes (scans can be slow)
- Check Hyperbrowser dashboard for active sessions
- If stuck >15 min, manually stop the session:

```bash
# List sessions
curl https://api.hyperbrowser.ai/api/sessions \
  -H 'x-api-key: YOUR_KEY'

# Stop a stuck session
curl -X PUT https://api.hyperbrowser.ai/api/sessions/{SESSION_ID}/stop \
  -H 'x-api-key: YOUR_KEY'
```

### Scan Shows "Failed" Status

**Problem:** Scan completes but failed

**Check the logs:**
```bash
# Server logs will show:
# "LinkedIn scan error: ..."
# "Twitter scan error: ..."
```

**Common errors:**
- "Login failed" - Credentials wrong or 2FA blocked
- "Profile not found" - Person doesn't exist on platform
- "Rate limit exceeded" - Too many Hyperbrowser requests

## Database Issues

### "No such table: users"

**Problem:** Database not initialized

**Solution:**
```bash
npm run init-db
```

### "Database connection error"

**Problem:** Can't connect to Turso

**Check:**
1. `DATABASE_URL` is correct in `.env.local`
2. `DATABASE_AUTH_TOKEN` is set
3. Turso database is active

**Test connection:**
```bash
turso db shell your-database-name
```

## Hyperbrowser Issues

### "Invalid API key"

**Problem:** Hyperbrowser authentication failed

**Solution:**
- Verify `HYPERBROWSER_API_KEY` in `.env.local`
- Get a new key from https://app.hyperbrowser.ai/settings

### "Insufficient credits"

**Problem:** No Hyperbrowser credits remaining

**Solution:**
- Check credits at https://app.hyperbrowser.ai/billing
- Add credits or upgrade plan
- Each scan uses credits for browser time

### "Bot detected" or frequent CAPTCHAs

**Problem:** LinkedIn/Twitter detects automation

**Good news:** CheckMyOpsec uses **stealth mode** to avoid detection!

**Stealth features enabled:**
- ✅ Stealth mode on all browser sessions
- ✅ Real Chrome user agent (looks like legitimate browser)
- ✅ Cookie acceptance (appears more human)
- ✅ Natural navigation patterns

**If still detected:**
1. **Use aged accounts** - Older LinkedIn/Twitter accounts are less suspicious
2. **Wait between scans** - Don't run many scans rapidly
3. **Verify accounts first** - Log in manually to "warm up" the account
4. **Consider residential proxy** - Hyperbrowser offers proxy options (paid)
5. **Check account status** - Make sure account isn't flagged already

### "Session timeout"

**Problem:** Browser session exceeded timeout

**Solution:**
- Default timeout is based on your Hyperbrowser plan
- Increase `timeoutMinutes` in session options if needed
- Or let scans complete faster by reducing `maxSteps`

## Environment Variable Issues

### Variables not loading

**Problem:** `process.env.VARIABLE` is undefined

**Solutions:**

**For development server:**
- Restart `npm run dev` after changing `.env.local`
- Make sure file is named `.env.local` not `.env`

**For init-db script:**
- The script loads `.env.local` automatically
- If not working, check file location (must be in project root)

**For production:**
- Set environment variables in hosting platform (Vercel, Railway, etc.)
- Don't rely on `.env.local` in production

## Performance Issues

### Scans are very slow

**Causes:**
- Authenticated scanning takes longer (login + navigation)
- Multiple platforms scanned sequentially
- AI agents need time to analyze pages

**Normal times:**
- LinkedIn only: 2-3 minutes
- All platforms: 5-7 minutes
- With login failures/retries: 8-10 minutes

**To speed up:**
- Reduce `maxSteps` in scanner.js (but may reduce accuracy)
- Scan fewer platforms
- Use parallel scanning (already implemented)

### High Hyperbrowser costs

**Problem:** Each scan uses too many credits

**Causes:**
- Long browser sessions
- Many steps per platform
- Multiple scans per day

**Solutions:**
- Reduce `maxSteps` from 15-20 to 10-12
- Use your own API keys (OpenAI, Anthropic, Google) via `useCustomApiKeys`
- Implement rate limiting (max 3 scans per user per day)

## Login Credential Issues

### LinkedIn won't accept credentials

**Try:**
1. Log in manually to verify credentials work
2. Check for special characters in password (may need escaping)
3. Use email, not username
4. Verify account isn't locked

### Twitter won't accept credentials

**Try:**
1. Use username WITHOUT @ symbol
2. Use phone number if username doesn't work
3. Check account isn't suspended
4. Verify on twitter.com manually

### Credentials work manually but not in scanner

**Causes:**
- LinkedIn/Twitter detects automation
- IP address flagged
- Too many login attempts

**Solutions:**
- Wait 30 minutes between scan attempts
- Use residential proxy (Hyperbrowser session option)
- Create dedicated accounts for scanning

## Getting Help

### Enable Debug Logging

Add to your `.env.local`:
```bash
DEBUG=true
NODE_ENV=development
```

### Check Logs

**Server logs:**
```bash
npm run dev
# Watch for errors in terminal
```

**Hyperbrowser logs:**
- Go to https://app.hyperbrowser.ai/sessions
- Click on a session to see agent steps
- Look for failed steps or errors

### Report an Issue

Include:
1. Error message (exact text)
2. Which platform (LinkedIn, Twitter, etc.)
3. Scan status (pending, scanning, failed)
4. Server logs (if relevant)
5. Hyperbrowser session ID (if available)

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `SQLITE_UNKNOWN: no such table` | Database not initialized | Run `npm run init-db` |
| `URL_INVALID: undefined` | Environment variables not loaded | Restart dev server |
| `sessionId - Expected string, received null` | Login session failed, trying to use null sessionId | **FIXED** - Scanner now falls back to unauthenticated mode automatically |
| `Login failed` | Authentication issue | Check credentials, disable 2FA |
| `Profile not found` | Person doesn't exist on platform | Normal - not everyone has all accounts |
| `Rate limit exceeded` | Too many API calls | Wait and try again |
| `Session timeout` | Browser session took too long | Increase timeout or reduce steps |
| `Invalid API key` | Wrong Hyperbrowser key | Check `.env.local` |

## Best Practices

### For Reliable Scanning

1. **Use dedicated accounts** - Create separate LinkedIn/Twitter accounts just for scanning
2. **Disable 2FA** - On the scanning accounts only
3. **Wait between scans** - Don't run 10 scans in a row
4. **Monitor credits** - Keep eye on Hyperbrowser usage
5. **Check logs** - Look at server output during scans
6. **Test credentials** - Verify manual login works first

### For Development

1. **Always restart dev server** after changing `.env.local`
2. **Initialize database** before first run
3. **Check Hyperbrowser dashboard** to see what agents are doing
4. **Use realistic test data** - Real names that exist on platforms
5. **Start with one platform** - Test LinkedIn only before adding others

## Still Having Issues?

1. Check the [AUTHENTICATED_SCANNING.md](AUTHENTICATED_SCANNING.md) guide
2. Review [README.md](README.md) setup instructions
3. Search GitHub issues
4. Open a new issue with debug info
