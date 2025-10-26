import { NextResponse } from 'next/server';
import { config } from 'dotenv';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { calculateOpsecScore, generateRecommendations } from '@/lib/scanner';
import { Hyperbrowser } from '@hyperbrowser/sdk';

// Load environment variables
config({ path: '.env.local' });

export async function POST(request, { params }) {
  try {
    console.log('[Force Complete] Starting...');

    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      console.log('[Force Complete] No authenticated user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.userId;
    const { scanId } = await params;
    console.log('[Force Complete] User:', userId, 'Scan:', scanId);

    // Get the scan
    const scanResult = await db.execute({
      sql: 'SELECT * FROM scans WHERE id = ? AND user_id = ?',
      args: [scanId, userId],
    });

    console.log('[Force Complete] Scan query returned:', scanResult.rows.length, 'rows');

    if (scanResult.rows.length === 0) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    const scan = scanResult.rows[0];
    console.log('[Force Complete] Scan status:', scan.status);

    // Only allow force complete for scanning or pending scans
    if (scan.status !== 'scanning' && scan.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only force complete scans that are in progress' },
        { status: 400 }
      );
    }

    // Get current findings
    const findingsResult = await db.execute({
      sql: 'SELECT * FROM findings WHERE scan_id = ?',
      args: [scanId],
    });

    const findings = findingsResult.rows;

    // Calculate score based on current findings
    const score = calculateOpsecScore(findings);
    console.log('[Force Complete] Calculated score:', score);

    // Update scan status to completed
    await db.execute({
      sql: 'UPDATE scans SET status = ?, score = ?, completed_at = ? WHERE id = ?',
      args: ['completed', score, Math.floor(Date.now() / 1000), scanId],
    });

    // Stop the Hyperbrowser session if it exists
    if (scan.session_id) {
      try {
        const hbClient = new Hyperbrowser({
          apiKey: process.env.HYPERBROWSER_API_KEY,
        });
        await hbClient.sessions.stop(scan.session_id);
        console.log('[Force Complete] Stopped Hyperbrowser session:', scan.session_id);
      } catch (error) {
        console.error('[Force Complete] Failed to stop Hyperbrowser session:', error);
      }
    }

    console.log('[Force Complete] Success!');

    return NextResponse.json({
      message: 'Scan force completed successfully',
      scan: {
        ...scan,
        status: 'completed',
        score: score,
        completed_at: Math.floor(Date.now() / 1000),
      },
    });
  } catch (error) {
    console.error('[Force Complete] Error:', error);
    console.error('[Force Complete] Stack:', error.stack);
    return NextResponse.json(
      { error: `Failed to force complete scan: ${error.message}` },
      { status: 500 }
    );
  }
}
