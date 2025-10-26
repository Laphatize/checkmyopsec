import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userId;

    // Get user's scan statistics
    const userScans = await db.execute({
      sql: 'SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId],
    });

    const userScanCount = userScans.rows.length;

    // Calculate average score for user
    const userScoresWithScore = userScans.rows.filter(scan => scan.score !== null);
    const userAverageScore = userScoresWithScore.length > 0
      ? Math.round(userScoresWithScore.reduce((sum, scan) => sum + scan.score, 0) / userScoresWithScore.length)
      : 0;

    // Get user's latest score
    const latestScan = userScans.rows.find(scan => scan.status === 'completed' && scan.score !== null);
    const latestScore = latestScan ? latestScan.score : null;

    // Get all findings for the user
    let userFindings = [];
    if (userScans.rows.length > 0) {
      const scanIds = userScans.rows.map(scan => scan.id);
      const placeholders = scanIds.map(() => '?').join(',');
      const findingsResult = await db.execute({
        sql: `SELECT * FROM findings WHERE scan_id IN (${placeholders})`,
        args: scanIds,
      });
      userFindings = findingsResult.rows;
    }

    // Count findings by type
    const findingTypes = {};
    const platformCounts = {};
    const severityCounts = { high: 0, medium: 0, low: 0, info: 0 };

    for (const finding of userFindings) {
      // Count by type
      findingTypes[finding.finding_type] = (findingTypes[finding.finding_type] || 0) + 1;

      // Count by platform
      platformCounts[finding.platform] = (platformCounts[finding.platform] || 0) + 1;

      // Count by severity
      if (severityCounts[finding.severity] !== undefined) {
        severityCounts[finding.severity]++;
      }
    }

    // Get global statistics (all users)
    const allScans = await db.execute({
      sql: 'SELECT score FROM scans WHERE status = ? AND score IS NOT NULL',
      args: ['completed'],
    });

    const globalAverageScore = allScans.rows.length > 0
      ? Math.round(allScans.rows.reduce((sum, scan) => sum + scan.score, 0) / allScans.rows.length)
      : 65; // Default if no scans

    const totalUsers = await db.execute({
      sql: 'SELECT COUNT(DISTINCT user_id) as count FROM scans',
    });

    // Calculate score trend (last 5 scans)
    const recentScans = userScans.rows
      .filter(scan => scan.status === 'completed' && scan.score !== null)
      .slice(0, 5)
      .reverse();

    const scoreTrend = recentScans.map(scan => ({
      date: new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: scan.score,
    }));

    // Calculate improvement
    let improvement = 0;
    if (recentScans.length >= 2) {
      const firstScore = recentScans[0].score;
      const lastScore = recentScans[recentScans.length - 1].score;
      improvement = lastScore - firstScore;
    }

    // Get most recent findings
    const recentFindings = await db.execute({
      sql: `SELECT f.*, s.full_name, s.created_at as scan_date
            FROM findings f
            JOIN scans s ON f.scan_id = s.id
            WHERE s.user_id = ? AND f.severity IN ('high', 'medium')
            ORDER BY s.created_at DESC
            LIMIT 5`,
      args: [userId],
    });

    return NextResponse.json({
      user: {
        totalScans: userScanCount,
        averageScore: userAverageScore,
        latestScore: latestScore,
        improvement: improvement,
        scoreTrend: scoreTrend,
      },
      findings: {
        total: userFindings.length,
        byType: findingTypes,
        byPlatform: platformCounts,
        bySeverity: severityCounts,
        recent: recentFindings.rows.slice(0, 5),
      },
      global: {
        averageScore: globalAverageScore,
        totalScans: allScans.rows.length,
        totalUsers: totalUsers.rows[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
