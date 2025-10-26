'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export function ShareCard({ scanId, score, fullName }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/dashboard/scans/${scanId}`
    : '';

  const shareText = `I scored ${score}/100 on CheckMyOpsec! Check your operational security at ${typeof window !== 'undefined' ? window.location.origin : ''}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
  };

  const getScoreBadge = () => {
    if (score >= 90) return { text: 'Excellent', color: 'text-green-600 dark:text-green-400' };
    if (score >= 70) return { text: 'Good', color: 'text-blue-600 dark:text-blue-400' };
    if (score >= 50) return { text: 'Fair', color: 'text-yellow-600 dark:text-yellow-400' };
    return { text: 'Needs Work', color: 'text-red-600 dark:text-red-400' };
  };

  const badge = getScoreBadge();

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Your Results
        </CardTitle>
        <CardDescription>
          Show others your OPSEC awareness or share this tool
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Your OPSEC Score</div>
            <div className="text-3xl font-bold">{score}/100</div>
          </div>
          <div className={`text-xl font-semibold ${badge.color}`}>
            {badge.text}
          </div>
        </div>

        {/* Share Actions */}
        <div className="space-y-2">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full justify-start"
            aria-label="Copy share link"
          >
            {copied ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Copied to clipboard!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>

          <Button
            onClick={handleTwitterShare}
            variant="outline"
            className="w-full justify-start"
            aria-label="Share on Twitter"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on Twitter/X
          </Button>

          <Button
            onClick={handleLinkedInShare}
            variant="outline"
            className="w-full justify-start"
            aria-label="Share on LinkedIn"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Share on LinkedIn
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          Sharing helps spread OPSEC awareness. Your detailed findings remain private.
        </p>
      </CardContent>
    </Card>
  );
}
