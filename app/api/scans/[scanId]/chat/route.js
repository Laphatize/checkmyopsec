import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_KEY);

export async function POST(request, { params }) {
  const { scanId } = await params;

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get scan details and findings
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
      sql: 'SELECT platform, finding_type, description, severity, points_deducted FROM findings WHERE scan_id = ?',
      args: [scanId],
    });

    const findings = findingsResult.rows;

    // Build context for the AI
    const context = `You are an OPSEC (Operational Security) advisor helping a user improve their online privacy and security.

User Information:
- Name: ${scan.full_name}
- Company: ${scan.company || 'Not specified'}
- Overall OPSEC Score: ${scan.score}/100

Findings from their scan:
${findings.map(f => `- [${f.platform}] ${f.severity.toUpperCase()} RISK: ${f.description} (Impact: -${f.points_deducted} points)`).join('\n')}

Your role:
1. Answer questions about their OPSEC scan results
2. Provide specific, actionable advice on how to improve their score
3. Explain what each finding means and why it's a risk
4. Suggest concrete steps to remediate issues
5. Be friendly, encouraging, and professional

Important:
- Focus on privacy and security best practices
- Don't be alarmist, but be honest about risks
- Give step-by-step instructions when relevant
- Reference specific platforms mentioned in their findings
- Write in plain text DO NOT USE MARKDOWN.
The user's question: ${message}`;

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(context);
    const response = await result.response;
    const aiMessage = response.text();

    return NextResponse.json({
      message: aiMessage,
      scanScore: scan.score,
      findingsCount: findings.length,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
