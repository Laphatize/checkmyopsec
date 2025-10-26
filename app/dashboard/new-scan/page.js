'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewScanPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    location: '',
    usernamePatterns: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          company: formData.company || null,
          location: formData.location || null,
          username_patterns: formData.usernamePatterns || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create scan');
        setLoading(false);
        return;
      }

      router.push(`/dashboard/scans/${data.scan.id}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/">
          check<span className='font-bold'>my</span><span className='text-green-500'>opsec</span>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">New OPSEC Scan</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Enter your information to start scanning for publicly accessible data
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Scan Information</CardTitle>
              <CardDescription>
                We'll search for this information across LinkedIn, Twitter, GitHub, and other platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md dark:bg-red-950 dark:text-red-400 dark:border-red-900">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  The name we'll search for across platforms
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Helps narrow down search results and find company-related information leaks
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Helps identify the correct person in search results
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usernamePatterns">Known Usernames (Optional)</Label>
                <Textarea
                  id="usernamePatterns"
                  placeholder="johndoe, jdoe123, john_doe_dev"
                  value={formData.usernamePatterns}
                  onChange={(e) => setFormData({ ...formData, usernamePatterns: e.target.value })}
                  rows={3}
                />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Comma-separated list of usernames you use online
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Scan...' : 'Start Scan'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What we'll check:</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• LinkedIn profile and posts for company information leaks</li>
            <li>• Twitter/X bio and tweets mentioning your employer</li>
            <li>• GitHub commits and profiles with your name or email</li>
            <li>• Facebook public profile information</li>
            <li>• Other social media platforms where data is publicly accessible</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
