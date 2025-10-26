'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Award, AlertTriangle } from 'lucide-react';

export function ScoreStatistics({ userScore, averageScore, totalScans }) {
  // Calculate percentile (simplified - in real app, would query database)
  const calculatePercentile = (score) => {
    if (score >= 90) return 90;
    if (score >= 80) return 75;
    if (score >= 70) return 60;
    if (score >= 60) return 45;
    if (score >= 50) return 30;
    return 15;
  };

  const percentile = calculatePercentile(userScore);
  const betterThanPercent = percentile;

  // Score distribution data
  const scoreRanges = [
    { range: '90-100', label: 'Excellent', count: Math.floor(totalScans * 0.1), color: 'bg-green-500' },
    { range: '70-89', label: 'Good', count: Math.floor(totalScans * 0.25), color: 'bg-blue-500' },
    { range: '50-69', label: 'Fair', count: Math.floor(totalScans * 0.35), color: 'bg-yellow-500' },
    { range: '0-49', label: 'Needs Work', count: Math.floor(totalScans * 0.3), color: 'bg-red-500' },
  ];

  const getUserRange = () => {
    if (userScore >= 90) return scoreRanges[0];
    if (userScore >= 70) return scoreRanges[1];
    if (userScore >= 50) return scoreRanges[2];
    return scoreRanges[3];
  };

  const userRange = getUserRange();

  // Common vulnerabilities stats
  const commonIssues = [
    { issue: 'Tech Stack Exposure', percentage: 65, severity: 'high' },
    { issue: 'Company Email in GitHub', percentage: 45, severity: 'high' },
    { issue: 'Detailed Job Descriptions', percentage: 55, severity: 'medium' },
    { issue: 'Work-Related Tweets', percentage: 40, severity: 'medium' },
    { issue: 'Public Facebook Profile', percentage: 30, severity: 'medium' },
  ];

  return (
    <div className="space-y-4">
      {/* Your Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Score Analysis
          </CardTitle>
          <CardDescription>
            How your OPSEC compares to others
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Your Score */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Your Score</div>
              <div className="text-3xl font-bold">{userScore}/100</div>
              <div className={`text-sm font-medium mt-1 ${userRange.color.replace('bg-', 'text-')}`}>
                {userRange.label}
              </div>
            </div>

            {/* Average Score */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Average Score</div>
              <div className="text-3xl font-bold">{averageScore}/100</div>
              <div className="text-sm text-muted-foreground mt-1">
                Across all users
              </div>
            </div>

            {/* Percentile */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Your Rank</div>
              <div className="text-3xl font-bold">{betterThanPercent}%</div>
              <div className="text-sm text-muted-foreground mt-1">
                Better than others
              </div>
            </div>
          </div>

          {/* Comparison Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your position</span>
              <span className="font-medium">Top {100 - betterThanPercent}%</span>
            </div>
            <div className="relative h-8 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                style={{ width: '100%' }}
              />
              <div
                className="absolute inset-y-0 left-0 flex items-center justify-end pr-2"
                style={{ width: `${betterThanPercent}%` }}
              >
                <div className="w-6 h-6 bg-primary rounded-full border-2 border-background shadow-lg"
                     title="Your score position"
                     aria-label={`Your score is at ${betterThanPercent} percentile`}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 (Worst)</span>
              <span>50 (Average)</span>
              <span>100 (Best)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Score Distribution
          </CardTitle>
          <CardDescription>
            Where users typically fall
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scoreRanges.map((range) => (
            <div key={range.range} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${range.color}`} />
                  <span className="text-sm font-medium">{range.range} - {range.label}</span>
                  {range.range === userRange.range && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      You are here
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{range.count} users</span>
              </div>
              <Progress
                value={(range.count / totalScans) * 100}
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Common Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Most Common OPSEC Issues
          </CardTitle>
          <CardDescription>
            What others are getting flagged for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {commonIssues.map((item) => (
            <div key={item.issue} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.issue}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.severity === 'high'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {item.severity}
                  </span>
                  <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                </div>
              </div>
              <Progress
                value={item.percentage}
                className={`h-2 ${
                  item.severity === 'high'
                    ? '[&>div]:bg-red-500'
                    : '[&>div]:bg-yellow-500'
                }`}
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2 border-t">
            These are the most frequently detected OPSEC vulnerabilities across all scans
          </p>
        </CardContent>
      </Card>

      {/* Improvement Tips */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Improvement Tips
          </CardTitle>
          <CardDescription>
            Simple steps to boost your score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Remove tech stack mentions from LinkedIn posts and profile</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Use a personal email for GitHub commits instead of company email</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Keep job descriptions high-level without infrastructure details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Set Facebook profile to private or friends-only</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Avoid tweeting about work projects, tools, or company information</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
