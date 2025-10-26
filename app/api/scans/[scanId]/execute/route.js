import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import db from '@/lib/db';
import {
  scanLinkedIn,
  scanGitHub,
  scanTwitter,
  scanFacebook,
  calculateOpsecScore,
} from '@/lib/scanner';
import { Hyperbrowser } from '@hyperbrowser/sdk';

export async function POST(request, { params }) {
  const { scanId } = await params;

  try {
    // Get scan details
    const scanResult = await db.execute({
      sql: 'SELECT * FROM scans WHERE id = ?',
      args: [scanId],
    });

    if (scanResult.rows.length === 0) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    const scan = scanResult.rows[0];

    // Update status to scanning
    await db.execute({
      sql: 'UPDATE scans SET status = ? WHERE id = ?',
      args: ['scanning', scanId],
    });

    const allFindings = [];
    let liveUrl = null;
    let sessionId = null;

    // Run all scans in parallel
    const scanParams = {
      fullName: scan.full_name,
      company: scan.company,
      location: scan.location,
      usernamePatterns: scan.username_patterns,
    };

    const [linkedInResult, githubResult, twitterResult, facebookResult] =
      await Promise.all([
        scanLinkedIn(scanParams),
        scanGitHub(scanParams),
        scanTwitter(scanParams),
        scanFacebook(scanParams),
      ]);

    // Extract live URL and session ID from LinkedIn scan (it creates authenticated session first)
    console.log('[Execute] LinkedIn result:', { 
      liveUrl: linkedInResult.liveUrl, 
      sessionId: linkedInResult.sessionId,
      findingsCount: linkedInResult.findings?.length || 0
    });
    
    if (linkedInResult.liveUrl) {
      liveUrl = linkedInResult.liveUrl;
      sessionId = linkedInResult.sessionId;
      console.log('[Execute] Using LinkedIn session:', { liveUrl, sessionId });
    } else {
      console.log('[Execute] No LinkedIn session available');
    }

    allFindings.push(
      ...linkedInResult.findings,
      ...githubResult.findings,
      ...twitterResult.findings,
      ...facebookResult.findings
    );

    // Update scan with live URL and session ID if we have them
    if (liveUrl || sessionId) {
      await db.execute({
        sql: 'UPDATE scans SET live_url = ?, session_id = ? WHERE id = ?',
        args: [liveUrl, sessionId, scanId],
      });
    }

    // Save findings to database
    for (const finding of allFindings) {
      const findingId = randomUUID();
      await db.execute({
        sql: `INSERT INTO findings (id, scan_id, platform, url, finding_type, description, severity, points_deducted, raw_data)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          findingId,
          scanId,
          finding.platform,
          finding.url || null,
          finding.finding_type,
          finding.description,
          finding.severity,
          finding.points_deducted,
          finding.raw_data,
        ],
      });
    }

    // Calculate OPSEC score
    const score = calculateOpsecScore(allFindings);

    // Update scan with score and status
    await db.execute({
      sql: `UPDATE scans SET status = ?, score = ?, completed_at = strftime('%s', 'now') WHERE id = ?`,
      args: ['completed', score, scanId],
    });

    // Stop the Hyperbrowser session now that the scan is complete
    if (sessionId) {
      try {
        const hbClient = new Hyperbrowser({
          apiKey: process.env.HYPERBROWSER_API_KEY,
        });
        await hbClient.sessions.stop(sessionId);
        console.log('Stopped Hyperbrowser session:', sessionId);
      } catch (error) {
        console.error('Failed to stop Hyperbrowser session:', error);
      }
    }

    return NextResponse.json({ success: true, score, findings: allFindings.length });
  } catch (error) {
    console.error('Scan execution error:', error);

    // Stop the Hyperbrowser session if it exists
    if (sessionId) {
      try {
        const hbClient = new Hyperbrowser({
          apiKey: process.env.HYPERBROWSER_API_KEY,
        });
        await hbClient.sessions.stop(sessionId);
        console.log('Stopped Hyperbrowser session due to error:', sessionId);
      } catch (stopError) {
        console.error('Failed to stop Hyperbrowser session:', stopError);
      }
    }

    // Mark scan as failed
    await db.execute({
      sql: 'UPDATE scans SET status = ? WHERE id = ?',
      args: ['failed', scanId],
    });

    return NextResponse.json({ error: 'Scan execution failed' }, { status: 500 });
  }
}
