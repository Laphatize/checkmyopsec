import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { generateRecommendations } from '@/lib/scanner';

export async function GET(request, { params }) {
  const { scanId } = await params;

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get scan details
    const scanResult = await db.execute({
      sql: 'SELECT * FROM scans WHERE id = ? AND user_id = ?',
      args: [scanId, user.userId],
    });

    if (scanResult.rows.length === 0) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    const scan = scanResult.rows[0];

    // Get findings
    const findingsResult = await db.execute({
      sql: 'SELECT * FROM findings WHERE scan_id = ? ORDER BY points_deducted DESC',
      args: [scanId],
    });

    const findings = findingsResult.rows;

    // Generate recommendations
    const recommendations = generateRecommendations(findings);

    return NextResponse.json({
      scan,
      findings,
      recommendations,
    });
  } catch (error) {
    console.error('Get scan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
