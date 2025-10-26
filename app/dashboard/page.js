'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/theme-toggle';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Activity, Target } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          router.push('/login');
          return;
        }
        const userData = await userRes.json();
        setUser(userData.user);

        const scansRes = await fetch('/api/scans');
        if (scansRes.ok) {
          const scansData = await scansRes.json();
          setScans(scansData.scans || []);
        }

        // Load statistics
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case 'scanning':
        return <Badge className="bg-blue-600">Scanning</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return <Badge className="bg-green-600">Good</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-600">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" role="navigation" aria-label="Dashboard navigation">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl  text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity" aria-label="CheckMyOpsec home">
          check<span className='font-bold'>my</span><span className='text-green-500'>opsec</span>

          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400" aria-label={`Logged in as ${user?.email}`}>{user?.email}</span>
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout} aria-label="Log out of your account">
              Log out
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              View your OPSEC scans and privacy scores
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/new-scan">New Scan</Link>
          </Button>
        </div>

        {/* Statistics Overview */}
        {stats && stats.user.totalScans > 0 && (
          <div className="mb-8 space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Latest Score */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Latest Score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.user.latestScore !== null ? `${stats.user.latestScore}/100` : 'N/A'}
                  </div>
                  {stats.user.improvement !== 0 && (
                    <div className={`flex items-center gap-1 text-sm mt-2 ${
                      stats.user.improvement > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {stats.user.improvement > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : stats.user.improvement < 0 ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : (
                        <Minus className="h-4 w-4" />
                      )}
                      <span>{stats.user.improvement > 0 ? '+' : ''}{stats.user.improvement} from first</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Average Score */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Your Average
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.user.averageScore}/100</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Across {stats.user.totalScans} scan{stats.user.totalScans !== 1 ? 's' : ''}
                  </div>
                </CardContent>
              </Card>

              {/* Total Findings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Total Issues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.findings.total}</div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {stats.findings.bySeverity.high} high, {stats.findings.bySeverity.medium} medium
                  </div>
                </CardContent>
              </Card>

              {/* Global Comparison */}
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Global Avg
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.global.averageScore}/100</div>
                  <div className={`text-sm mt-2 ${
                    stats.user.latestScore > stats.global.averageScore
                      ? 'text-green-600 dark:text-green-400'
                      : stats.user.latestScore < stats.global.averageScore
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'
                  }`}>
                    {stats.user.latestScore > stats.global.averageScore
                      ? 'Above average!'
                      : stats.user.latestScore < stats.global.averageScore
                      ? 'Below average'
                      : 'At average'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Score Trend */}
            {stats.user.scoreTrend && stats.user.scoreTrend.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Score Trend
                  </CardTitle>
                  <CardDescription>Your OPSEC score over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.user.scoreTrend.map((point, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="text-sm text-muted-foreground w-20">{point.date}</div>
                        <Progress value={point.score} className="flex-1" />
                        <div className="text-sm font-medium w-12 text-right">{point.score}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent High/Medium Findings */}
            {stats.findings.recent && stats.findings.recent.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Recent High-Priority Issues
                  </CardTitle>
                  <CardDescription>Important findings from your latest scans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.findings.recent.map((finding, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                        <Badge variant={finding.severity === 'high' ? 'destructive' : 'secondary'}>
                          {finding.severity}
                        </Badge>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{finding.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {finding.platform} • {new Date(finding.scan_date * 1000).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {scans.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No scans yet</CardTitle>
              <CardDescription>
                Start your first OPSEC scan to see what information about you is publicly accessible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/new-scan">Start Your First Scan</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Your Scans</h2>
            {scans.map((scan) => (
              <Card key={scan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{scan.full_name}</CardTitle>
                      <CardDescription>
                        {scan.company && `${scan.company} • `}
                        {new Date(scan.created_at * 1000).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(scan.status)}
                      {scan.score !== null && getScoreBadge(scan.score)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                      {scan.score !== null ? (
                        <span className="font-medium text-2xl text-zinc-900 dark:text-zinc-50">
                          {scan.score}/100
                        </span>
                      ) : (
                        <span>{scan.status === 'pending' ? 'Waiting to start...' : 'Scanning...'}</span>
                      )}
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/scans/${scan.id}`}>
                        {scan.status === 'completed' ? 'View Results' : 'View Progress'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
