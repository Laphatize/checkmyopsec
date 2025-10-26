# CheckMyOpsec

An OSINT privacy awareness tool that scans social media platforms to find publicly accessible information about you and your company, then provides an OPSEC score and actionable recommendations to improve your operational security.

## Features

- **Automated OSINT Scanning**: Uses AI agents (Hyperbrowser) to search across LinkedIn, GitHub, Twitter/X, and Facebook
- **Privacy Score**: Get a 0-100 score based on how much sensitive information is exposed
- **Actionable Recommendations**: Specific tips on what to remove or change to improve your OPSEC
- **Scan History**: Track your OPSEC improvements over time
- **Beautiful UI**: Built with Next.js 16, React 19, and shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: libSQL (Turso)
- **Authentication**: Custom JWT-based auth with bcrypt
- **AI Agents**: Hyperbrowser HyperAgent for web scraping

## Setup

### Prerequisites

- Node.js 18+
- A Turso (libSQL) database
- Hyperbrowser API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/checkmyopsec.git
cd checkmyopsec
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```env
DATABASE_URL=your-turso-database-url
DATABASE_AUTH_TOKEN=your-turso-auth-token
HYPERBROWSER_API_KEY=your-hyperbrowser-api-key
JWT_SECRET=your-random-secret-key

# Optional: For authenticated scanning (recommended for better results)
LINKEDIN_USERNAME=your-linkedin-email
LINKEDIN_PASSWORD=your-linkedin-password
X_USERNAME=your-twitter-username
X_PASSWORD=your-twitter-password
```

To get these credentials:
- **Turso Database**: Sign up at https://turso.tech and create a database
- **Hyperbrowser API Key**: Sign up at https://hyperbrowser.ai
- **JWT Secret**: Generate with `openssl rand -base64 32`
- **Social Media Credentials** (optional): Your LinkedIn and Twitter/X login credentials enable authenticated scanning for much better results and access to more profile information

4. Initialize the database:
```bash
npm run init-db
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. **Sign up**: Create an account at `/signup`
2. **Create a scan**: Go to Dashboard and click "New Scan"
3. **Enter your information**: Provide your name, company (optional), and known usernames
4. **Wait for results**: The AI agents will scan multiple platforms (takes 2-5 minutes)
5. **View your OPSEC score**: See what information is exposed and get recommendations

## What Gets Checked

The tool uses AI agents to scan social media platforms:

### Authenticated Scanning (Recommended)
When you provide LinkedIn and Twitter/X credentials, the scanner logs into these platforms to access more detailed information:

- **LinkedIn** (Authenticated):
  - Full profile access including private profiles
  - Recent posts and articles with tech stack mentions
  - Detailed job descriptions revealing infrastructure
  - Skills section showing internal tools
  - Security practice discussions in posts

- **Twitter/X** (Authenticated):
  - Full tweet history and protected tweets
  - Bio and location information
  - Tweets mentioning work, deployments, or tools
  - Technical discussions revealing company stack

- **GitHub** (Public):
  - Commits with company email addresses
  - Public repositories with work-related code
  - Profile bio mentioning employer
  - Contribution patterns

- **Facebook** (Public):
  - Profile visibility without login
  - Publicly accessible information

## OPSEC Scoring

Scores are calculated from 0-100 (higher is better):

- **80-100**: Good OPSEC - minimal exposure
- **60-79**: Fair OPSEC - some improvements recommended
- **0-59**: Poor OPSEC - significant information exposed

Points are deducted based on:
- LinkedIn tech stack mentions: -15 points
- Security practice discussions: -15 points
- Company email in GitHub: -20 points
- Public Facebook profile: -15 points
- Detailed job descriptions: -10 points
- Company in social media bios: -10 points

## Project Structure

```
checkmyopsec/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── scans/        # Scan management
│   ├── dashboard/        # Protected dashboard pages
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── layout.js         # Root layout
│   └── page.js           # Landing page
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── auth.js           # Authentication utilities
│   ├── db.js             # Database client
│   ├── scanner.js        # OSINT scanning logic
│   └── utils.js          # Utility functions
├── scripts/
│   └── init-db.js        # Database initialization
└── public/               # Static assets
```

## Development

### Running locally

```bash
npm run dev
```

### Building for production

```bash
npm run build
npm start
```

### Database Management

Initialize or reset the database:
```bash
npm run init-db
```

## Troubleshooting

Having issues? Check these guides:

- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
  - Login problems (LinkedIn, Twitter)
  - Scan stuck or failed
  - Database errors
  - Hyperbrowser issues

- **[AUTHENTICATED_SCANNING.md](AUTHENTICATED_SCANNING.md)** - Setup guide for authenticated scanning

Common issues:
- **Agent clicks "Sign in with Apple"** - Scanner now explicitly avoids SSO buttons
- **Database not initialized** - Run `npm run init-db`
- **Credentials not working** - Check `.env.local` and disable 2FA on scanning accounts
- **Scan stuck** - Wait up to 10 minutes, check Hyperbrowser dashboard for active sessions

## Security & Privacy

- User passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- All scans are private to the user who created them
- No personally identifiable information is stored beyond what the user provides
- Scanning is done via Hyperbrowser's isolated browser sessions

## Limitations

- Scans rely on publicly accessible information only
- Some platforms may require login (Facebook, LinkedIn) which limits visibility
- AI agent interpretation may not be 100% accurate
- Rate limits apply based on Hyperbrowser usage

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- AI agents powered by [Hyperbrowser](https://hyperbrowser.ai)
- Database by [Turso](https://turso.tech)
