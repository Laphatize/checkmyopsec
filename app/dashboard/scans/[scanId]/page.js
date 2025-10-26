'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OpsecChat } from '@/components/opsec-chat';
import { ShareCard } from '@/components/share-card';
import { ScoreStatistics } from '@/components/score-statistics';

const OPSEC_QUOTES = [
  { text: "Loose lips sink ships", author: "WWII Slogan" },
  { text: "The best security is a security architecture that has no single point of failure", author: "Bruce Schneier" },
  { text: "Privacy is not about hiding something. It's about protecting who you are", author: "Edward Snowden" },
  { text: "Metadata absolutely tells you everything about somebody's life", author: "Edward Snowden" },
  { text: "Security is always excessive until it's not enough", author: "Robbie Sinclair" },
  { text: "The only system which is truly secure is one which is switched off and unplugged", author: "Gene Spafford" },
  { text: "Your social media profile is an OSINT analyst's dream and your nightmare", author: "Anonymous" },
  { text: "Every piece of information you share online is a puzzle piece for someone else", author: "Security Proverb" },
  { text: "Good OPSEC isn't paranoia, it's preparation", author: "Security Wisdom" },
  { text: "The less you say, the less you have to explain", author: "OPSEC Principle" },
  { text: "Information security is not a technology problem, it's a people problem", author: "Kevin Mitnick" },
  { text: "Think before you post. The internet never forgets", author: "Digital Age Wisdom" },
];

export default function ScanResultsPage() {
  const router = useRouter();
  const params = useParams();
  const scanId = params.scanId;

  const [scan, setScan] = useState(null);
  const [findings, setFindings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuote, setCurrentQuote] = useState(0);

  // Quote rotation effect
  useEffect(() => {
    if (scan && (scan.status === 'pending' || scan.status === 'scanning')) {
      const quoteInterval = setInterval(() => {
        setCurrentQuote((prev) => (prev + 1) % OPSEC_QUOTES.length);
      }, 5000); // Change quote every 5 seconds

      return () => clearInterval(quoteInterval);
    }
  }, [scan]);

  useEffect(() => {
    let intervalId;

    async function loadScan() {
      try {
        const res = await fetch(`/api/scans/${scanId}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to load scan');
        }

        const data = await res.json();
        setScan(data.scan);
        setFindings(data.findings || []);
        setRecommendations(data.recommendations || []);
        setLoading(false);

        // If scan is still in progress, poll for updates
        if (data.scan.status === 'pending' || data.scan.status === 'scanning') {
          intervalId = setInterval(async () => {
            const updateRes = await fetch(`/api/scans/${scanId}`);
            if (updateRes.ok) {
              const updateData = await updateRes.json();
              setScan(updateData.scan);
              setFindings(updateData.findings || []);
              setRecommendations(updateData.recommendations || []);

              if (updateData.scan.status === 'completed' || updateData.scan.status === 'failed') {
                clearInterval(intervalId);
              }
            }
          }, 5000); // Poll every 5 seconds
        }
      } catch (error) {
        console.error('Error loading scan:', error);
        setLoading(false);
      }
    }

    loadScan();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [scanId, router]);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
      case 'medium':
        return <Badge className="bg-orange-600">Medium Risk</Badge>;
      case 'low':
        return <Badge className="bg-yellow-600">Low Risk</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Good OPSEC! You have minimal exposure.';
    if (score >= 60) return 'Fair OPSEC. Some improvements recommended.';
    return 'Poor OPSEC. Significant information is exposed.';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/">
            check<span className='font-bold'>my</span><span className='text-green-500'>opsec</span>
            </Link>
          </div>
        </nav>
        <div className="flex items-center justify-center py-24">
          <p className="text-zinc-600 dark:text-zinc-400">Loading scan results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className='text-2xl'>
          check<span className='font-bold'>my</span><span className='text-green-500'>opsec</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            {scan.full_name}
          </h1>
          {scan.company && (
            <p className="text-zinc-600 dark:text-zinc-400">{scan.company}</p>
          )}
          <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
            Scanned on {new Date(scan.created_at * 1000).toLocaleString()}
          </p>
        </div>

        {(scan.status === 'pending' || scan.status === 'scanning') && (
          <div className="space-y-6">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{scan.status === 'pending' ? 'Scan Pending' : 'Scanning in Progress'}</CardTitle>
                <CardDescription>
                  {scan.status === 'pending'
                    ? 'Your scan is queued and will start shortly...'
                    : "We're searching across LinkedIn, GitHub, Twitter, and Facebook. This may take a few minutes..."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={scan.status === 'pending' ? 25 : 50} className="w-full" />

                {/* Live View */}
                {scan.live_url && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Live View</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Watch the automation in real-time as it searches for your information
                    </p>
                    <div className="border rounded-lg overflow-hidden bg-black" style={{ height: '600px' }}>
                      <iframe
                        src={scan.live_url}
                        className="w-full h-full"
                        title="Hyperbrowser Live View"
                        allow="clipboard-read; clipboard-write"
                        sandbox="allow-same-origin allow-scripts allow-forms"
                      />
                    </div>
                  </div>
                )}

                {/* OPSEC Quote */}
                <div className="mt-8 p-6 bg-muted rounded-lg  border-primary">
                  <div
                    className="transition-opacity duration-500"
                    key={currentQuote}
                  >
                    <blockquote className="text-lg italic text-zinc-700 dark:text-zinc-300 mb-2">
                      "{OPSEC_QUOTES[currentQuote].text}"
                    </blockquote>
                    <p className="text-sm text-muted-foreground text-right">
                      — {OPSEC_QUOTES[currentQuote].author}
                    </p>
                  </div>
                  <div className="flex gap-1 mt-4 justify-center">
                    {OPSEC_QUOTES.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === currentQuote
                            ? 'w-8 bg-primary'
                            : 'w-1.5 bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Force Complete Button for Testing/Debug */}
            {scan.status === 'scanning' && (
              <Card className="border-yellow-200 dark:border-yellow-900">
                <CardHeader>
                  <CardTitle className="text-sm">Developer Options</CardTitle>
                  <CardDescription>
                    Force the scan to complete if it's stuck or for testing purposes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={async () => {
                      if (confirm('Force complete this scan? This will mark it as completed with current findings.')) {
                        try {
                          const res = await fetch(`/api/scans/${scanId}/force-complete`, {
                            method: 'POST',
                          });

                          const data = await res.json();

                          if (res.ok) {
                            alert('Scan completed successfully!');
                            // Reload the page to see updated status
                            window.location.reload();
                          } else {
                            console.error('Force complete failed:', data);
                            alert(`Failed to force complete scan: ${data.error || 'Unknown error'}`);
                          }
                        } catch (error) {
                          console.error('Error force completing scan:', error);
                          alert(`Error force completing scan: ${error.message}`);
                        }
                      }
                    }}
                  >
                    Force Complete Scan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {scan.status === 'failed' && (
          <Card className="mb-8 border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Scan Failed</CardTitle>
              <CardDescription>
                The scan encountered an error. Please try again or contact support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {scan.status === 'completed' && (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>OPSEC Score</CardTitle>
                <CardDescription>{getScoreMessage(scan.score)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className={`text-6xl font-bold ${getScoreColor(scan.score)}`}>
                    {scan.score}
                  </div>
                  <div className="flex-1">
                    <Progress value={scan.score} className="h-4 mb-2" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Higher scores indicate better OPSEC (less information exposed)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <ScoreStatistics
                  userScore={scan.score}
                  averageScore={65}
                  totalScans={100}
                />
              </div>
              <div>
                <ShareCard
                  scanId={scanId}
                  score={scan.score}
                  fullName={scan.full_name}
                />
              </div>
            </div>

            <Tabs defaultValue="findings" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="findings">
                  Findings ({findings.filter(f => f.severity !== 'info').length})
                </TabsTrigger>
                <TabsTrigger value="recommendations">
                  Recommendations ({recommendations.length})
                </TabsTrigger>
                <TabsTrigger value="chat">
                  AI Advisor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="findings" className="space-y-4">
                {findings.filter(f => f.severity !== 'info').length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No issues found!</CardTitle>
                      <CardDescription>
                        We couldn't find any publicly accessible information that poses an OPSEC risk.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  findings
                    .filter(f => f.severity !== 'info')
                    .map((finding, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">{finding.platform}</CardTitle>
                                {getSeverityBadge(finding.severity)}
                              </div>
                              <CardDescription>{finding.description}</CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                Impact
                              </div>
                              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                -{finding.points_deducted}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                {recommendations.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No recommendations</CardTitle>
                      <CardDescription>
                        Your OPSEC looks good! We don't have any specific recommendations at this time.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  recommendations.map((rec, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{rec.title}</CardTitle>
                              {getSeverityBadge(rec.severity)}
                            </div>
                            <CardDescription className="text-base">
                              {rec.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="chat">
                <OpsecChat scanId={scanId} scanScore={scan.score} />
              </TabsContent>
            </Tabs>

            <div className="flex justify-center">
              <Button asChild variant="outline">
                <Link href="/dashboard/new-scan">Run Another Scan</Link>
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
