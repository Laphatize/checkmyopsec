# Quick Start Guide

## Prerequisites

You'll need:
1. A Turso database (get one at https://turso.tech)
2. A Hyperbrowser API key (get one at https://hyperbrowser.ai)

## Setup Steps

### 1. ✅ Configure Environment Variables (DONE)

Your `.env.local` is already set up with:
- ✅ Database URL
- ✅ Database Auth Token
- ✅ Hyperbrowser API Key
- ✅ JWT Secret

### 2. ✅ Initialize the Database (DONE)

The database has been initialized with the following tables:
- ✅ `users` table
- ✅ `scans` table
- ✅ `findings` table
- ✅ Indexes created

If you need to re-initialize:
```bash
npm run init-db
```

### 3. Start the Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 4. Test the Application

1. Go to http://localhost:3000
2. Click "Sign up" and create an account
3. After login, you'll be redirected to the dashboard
4. Click "New Scan"
5. Enter test information:
   - Full Name: "John Doe"
   - Company: "Acme Corp" (optional)
   - Location: "San Francisco" (optional)
   - Usernames: "johndoe, jdoe" (optional)
6. Click "Start Scan"
7. Wait 2-5 minutes for the AI agents to complete the scan
8. View your OPSEC score and recommendations

## Troubleshooting

### Database connection errors

Make sure your `DATABASE_URL` and `DATABASE_AUTH_TOKEN` are correct in `.env.local`.

Test your connection:
```bash
turso db shell blahblah-laphatize
```

### Hyperbrowser errors

Verify your API key is correct:
```bash
curl https://api.hyperbrowser.ai/api/sessions \
  -H 'x-api-key: YOUR_API_KEY'
```

### Module import errors

Make sure you're using Node.js 18+ and have `"type": "module"` in package.json (already set).

## Next Steps

- Customize the OPSEC scoring algorithm in `lib/scanner.js`
- Add more social media platforms to scan
- Improve the AI prompts for better accuracy
- Add email notifications when scans complete
- Implement rate limiting for scans

## Production Deployment

Before deploying to production:

1. Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

2. Update `.env.local` or set environment variables in your hosting platform

3. Build the application:
```bash
npm run build
```

4. Deploy to Vercel, Railway, or your preferred hosting platform

## Support

For issues or questions:
- Check the README.md for detailed documentation
- Review the code in `lib/scanner.js` for scanning logic
- Check API routes in `app/api/` for backend functionality
