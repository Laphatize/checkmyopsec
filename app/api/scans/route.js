import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { full_name, company, location, username_patterns } = await request.json();

    if (!full_name) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    // Create scan record
    const scanId = randomUUID();
    await db.execute({
      sql: `INSERT INTO scans (id, user_id, full_name, company, location, username_patterns, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      args: [scanId, user.userId, full_name, company, location, username_patterns],
    });

    // Start the scan asynchronously (we'll trigger the background job)
    // In production, you'd want to use a job queue like BullMQ, but for now we'll use a simple approach
    fetch(`${request.nextUrl.origin}/api/scans/${scanId}/execute`, {
      method: 'POST',
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      scan: { id: scanId, full_name, status: 'pending' },
    });
  } catch (error) {
    console.error('Create scan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC',
      args: [user.userId],
    });

    return NextResponse.json({ scans: result.rows });
  } catch (error) {
    console.error('Get scans error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
