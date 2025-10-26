import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { SkipToContent } from '@/components/skip-to-content';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <SkipToContent />
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl  text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity" aria-label="CheckMyOpsec home">
          check<span className='font-bold'>my</span><span className='text-green-500'>opsec</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center space-y-8 mb-16">
          <Badge variant="secondary" className="mb-4">
            OSINT Privacy Check
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            How much do you reveal online?
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            CheckMyOpsec scans LinkedIn, Twitter, GitHub, and other platforms to find what information
            about you and your company is publicly accessible. Get a privacy score and actionable tips
            to improve your operational security.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Start Free Scan</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>

        <div id="how-it-works" className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                Automated Scanning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI agents search for your name across LinkedIn, Twitter, GitHub, Facebook, and more
                to find publicly accessible information.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Privacy Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get a score from 0-100 based on how much sensitive information is exposed, including
                company details, internal tools, and personal data.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                Actionable Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Receive specific recommendations on what to remove or change to improve your OPSEC
                and protect your privacy online.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-800">
          <CardHeader>
            <CardTitle>Common OPSEC Risks We Find</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="destructive">High Risk</Badge>
              <p className="text-sm">LinkedIn posts mentioning internal tools, tech stack, or security practices</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="destructive">High Risk</Badge>
              <p className="text-sm">GitHub commits with company email addresses or proprietary code</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-orange-600">Medium Risk</Badge>
              <p className="text-sm">Public social media profiles linking employer and personal information</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-yellow-600">Low Risk</Badge>
              <p className="text-sm">Job descriptions that are too detailed about company infrastructure</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-16">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Ready to check your OPSEC?
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Get Started Free</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-24 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>Built to help individuals and teams improve their operational security</p>
        </div>
      </footer>
    </div>
  );
}
