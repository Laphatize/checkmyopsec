import { Hyperbrowser } from '@hyperbrowser/sdk';

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY,
});

// Helper function to create an authenticated LinkedIn session
async function createLinkedInSession() {
  console.log('[createLinkedInSession] Checking credentials...');
  if (!process.env.LINKEDIN_USERNAME || !process.env.LINKEDIN_PASSWORD) {
    console.warn('[createLinkedInSession] LinkedIn credentials not set, scanning without authentication');
    return null;
  }
  console.log('[createLinkedInSession] Credentials found, creating session...');

  try {
    const session = await hbClient.sessions.create({
      sessionOptions: {
        acceptCookies: true,
        stealth: true, // Enable stealth mode to avoid bot detection
        // Additional stealth options for better evasion
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    // Login to LinkedIn
    await hbClient.agents.hyperAgent.startAndWait({
      task: `Go to https://www.linkedin.com/login

IMPORTANT: DO NOT click "Sign in with Apple" or "Sign in with Google" or any SSO buttons.

Instead, use the EMAIL/PASSWORD form:
1. Find the input field labeled "Email or phone" and enter: ${process.env.LINKEDIN_USERNAME}
2. Find the input field labeled "Password" and enter: ${process.env.LINKEDIN_PASSWORD}
3. Click the "Sign in" button (NOT "Sign in with Apple" or any SSO button)
4. Wait for the LinkedIn feed to load completely
5. If asked to verify or do 2FA, try to proceed anyway or skip if possible`,
      sessionId: session.id,
      keepBrowserOpen: true,
      maxSteps: 15,
    });

    console.log('LinkedIn session created successfully');
    return { sessionId: session.id, liveUrl: session.liveUrl };
  } catch (error) {
    console.error('Failed to create LinkedIn session:', error);
    return null;
  }
}

// Helper function to create an authenticated Twitter/X session
async function createTwitterSession() {
  if (!process.env.X_USERNAME || !process.env.X_PASSWORD) {
    console.warn('Twitter/X credentials not set, scanning without authentication');
    return null;
  }

  try {
    const session = await hbClient.sessions.create({
      sessionOptions: {
        acceptCookies: true,
        stealth: true, // Enable stealth mode to avoid bot detection
        // Additional stealth options for better evasion
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    // Login to Twitter/X
    await hbClient.agents.hyperAgent.startAndWait({
      task: `Go to https://twitter.com/login or https://x.com/login

IMPORTANT: DO NOT click "Sign in with Google" or "Sign in with Apple" or any SSO buttons.

Instead, use the USERNAME/PASSWORD form:
1. Find the input field for username/email/phone and enter: ${process.env.X_USERNAME}
2. Click "Next" if there's a next button
3. Find the password input field and enter: ${process.env.X_PASSWORD}
4. Click the "Log in" button (NOT any SSO buttons)
5. Wait for the home timeline/feed to load completely
6. If asked for verification, try to skip or proceed anyway`,
      sessionId: session.id,
      keepBrowserOpen: true,
      maxSteps: 15,
    });

    console.log('Twitter session created successfully');
    return session.id;
  } catch (error) {
    console.error('Failed to create Twitter session:', error);
    return null;
  }
}

export async function scanLinkedIn({ fullName, company }) {
  const findings = [];
  let sessionData = null;
  let sessionId = null;
  let liveUrl = null;

  try {
    // Create authenticated session
    console.log('[LinkedIn Scan] Attempting to create authenticated session...');
    sessionData = await createLinkedInSession();
    if (sessionData) {
      sessionId = sessionData.sessionId;
      liveUrl = sessionData.liveUrl;
      console.log('[LinkedIn Scan] Session created successfully:', { sessionId, liveUrl });
    } else {
      console.log('[LinkedIn Scan] No session created - will use ephemeral session');
    }

    const searchQuery = company
      ? `Search LinkedIn for "${fullName}" who works at ${company}. Use the search bar and filter by People. Once you find their profile, analyze: 1) Their current job title and full description, 2) Recent posts and articles they've shared (look for mentions of tools, frameworks, or tech stack), 3) Skills section for technical tools, 4) Any posts mentioning security practices, infrastructure, or internal systems. Return detailed findings in JSON format with: {profileUrl, jobTitle, jobDescription, recentPosts: [{content, date}], techStackMentions: [string], securityMentions: [string], hasDetailedJobDescription: boolean}`
      : `Search LinkedIn for "${fullName}". Use the search bar and filter by People. Once you find their profile, analyze: 1) Current company and job title, 2) Recent posts they've shared, 3) Skills that might reveal company tech stack, 4) Job description details. Return detailed findings in JSON format with: {profileUrl, company, jobTitle, recentPosts: [{content, date}], techStackMentions: [string]}`;

    // If authenticated session was created, use it. Otherwise, create an ephemeral session
    const agentOptions = {
      task: searchQuery,
      maxSteps: 20,
    };

    if (sessionId) {
      agentOptions.sessionId = sessionId;
    } else {
      // No authenticated session - use sessionOptions for ephemeral session
      agentOptions.sessionOptions = {
        stealth: true,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };
    }

    const result = await hbClient.agents.hyperAgent.startAndWait(agentOptions);

    const data = result.data?.finalResult;

    if (data && data.includes('profileUrl')) {
      // Profile found
      findings.push({
        platform: 'LinkedIn',
        finding_type: 'profile_found',
        description: 'LinkedIn profile found and analyzed',
        severity: 'low',
        points_deducted: 5,
        raw_data: data,
      });

      // Check for tech stack mentions with improved detection
      const techKeywords = ['react', 'node', 'python', 'aws', 'kubernetes', 'docker', 'typescript', 'postgresql', 'mongodb', 'redis', 'kafka', 'jenkins', 'terraform'];
      const foundTech = techKeywords.filter(keyword => data.toLowerCase().includes(keyword));
      const hasTechMentions = foundTech.length > 0 || data.includes('techStackMentions');

      if (hasTechMentions) {
        // Try to extract specific examples from the data
        let specificExample = '';
        try {
          // Look for recentPosts or techStackMentions in the JSON response
          const jsonMatch = data.match(/\{[^}]*(?:techStackMentions|recentPosts)[^}]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.techStackMentions && parsed.techStackMentions.length > 0) {
              specificExample = `Mentioned: ${parsed.techStackMentions.join(', ')}`;
            } else if (parsed.recentPosts && parsed.recentPosts.length > 0) {
              specificExample = `Found in post: "${parsed.recentPosts[0].content?.substring(0, 100)}..."`;
            }
          }
        } catch (e) {
          // If parsing fails, just list found keywords
          specificExample = foundTech.length > 0 ? `Technologies found: ${foundTech.join(', ').toUpperCase()}` : '';
        }

        findings.push({
          platform: 'LinkedIn',
          finding_type: 'tech_stack_exposure',
          description: specificExample || 'LinkedIn profile or posts mention specific internal tools, frameworks, or tech stack',
          severity: 'high',
          points_deducted: 15,
          raw_data: data,
        });
      }

      // Check for security mentions
      const securityKeywords = ['security', 'authentication', 'authorization', 'encryption', 'vpn', 'firewall', 'penetration', 'vulnerability'];
      const hasSecurityMentions = securityKeywords.some(keyword => data.toLowerCase().includes(keyword));

      if (hasSecurityMentions) {
        findings.push({
          platform: 'LinkedIn',
          finding_type: 'security_practice_exposure',
          description: 'LinkedIn posts or profile discuss company security practices or tools',
          severity: 'high',
          points_deducted: 15,
          raw_data: data,
        });
      }

      // Check for detailed job description
      if (data.toLowerCase().includes('responsibilities') || data.toLowerCase().includes('infrastructure') || data.includes('hasDetailedJobDescription')) {
        findings.push({
          platform: 'LinkedIn',
          finding_type: 'detailed_job_description',
          description: 'Job description reveals specific details about company infrastructure or responsibilities',
          severity: 'medium',
          points_deducted: 10,
          raw_data: data,
        });
      }

      // Check for recent posts that might leak information
      if (data.includes('recentPosts') && data.toLowerCase().includes('post')) {
        findings.push({
          platform: 'LinkedIn',
          finding_type: 'active_poster',
          description: 'User actively posts on LinkedIn - review posts for potential information leaks',
          severity: 'low',
          points_deducted: 5,
          raw_data: data,
        });
      }
    }
  } catch (error) {
    console.error('LinkedIn scan error:', error);
    findings.push({
      platform: 'LinkedIn',
      finding_type: 'scan_error',
      description: `Scan failed: ${error.message}`,
      severity: 'info',
      points_deducted: 0,
      raw_data: JSON.stringify({ error: error.message }),
    });
  } finally {
    // Note: We don't stop the session here to keep the live URL active
    // The session will be stopped when the scan is completed or manually stopped
    // This allows users to watch the live preview during scanning
  }

  return { findings, liveUrl, sessionId };
}

export async function scanGitHub({ fullName, usernamePatterns }) {
  const findings = [];

  try {
    const usernames = usernamePatterns ? usernamePatterns.split(',').map(u => u.trim()).join(', ') : fullName;

    const searchQuery = `Search GitHub for users with name "${fullName}" or usernames similar to: ${usernames}. For any matching profiles found: 1) Check if they use a company email in commits, 2) Look for repositories that might be work-related, 3) Check profile bio for company mentions. Return a JSON object with: profileUrl, email (if found in commits), companyInBio (boolean), publicRepos (count).`;

    const result = await hbClient.agents.hyperAgent.startAndWait({
      task: searchQuery,
      maxSteps: 15,
      sessionOptions: {
        stealth: true,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const data = result.data?.finalResult;

    if (data && data.includes('profileUrl')) {
      findings.push({
        platform: 'GitHub',
        finding_type: 'profile_found',
        description: 'GitHub profile found with real name',
        severity: 'medium',
        points_deducted: 8,
        raw_data: data,
      });

      // Check for company email in commits
      if (data.includes('@') && (data.includes('.com') || data.includes('.io'))) {
        findings.push({
          platform: 'GitHub',
          finding_type: 'company_email_exposed',
          description: 'Company email address found in Git commits',
          severity: 'high',
          points_deducted: 20,
          raw_data: data,
        });
      }

      // Check for company in bio
      if (data.toLowerCase().includes('companyinbio') || data.toLowerCase().includes('company')) {
        findings.push({
          platform: 'GitHub',
          finding_type: 'company_in_bio',
          description: 'GitHub profile bio mentions company name',
          severity: 'medium',
          points_deducted: 10,
          raw_data: data,
        });
      }
    }
  } catch (error) {
    console.error('GitHub scan error:', error);
    findings.push({
      platform: 'GitHub',
      finding_type: 'scan_error',
      description: `Scan failed: ${error.message}`,
      severity: 'info',
      points_deducted: 0,
      raw_data: JSON.stringify({ error: error.message }),
    });
  }

  return { findings, liveUrl: null };
}

export async function scanTwitter({ fullName, usernamePatterns, company }) {
  const findings = [];
  let sessionId = null;

  try {
    // Create authenticated session
    sessionId = await createTwitterSession();

    const searchTerms = usernamePatterns
      ? usernamePatterns.split(',').map(u => u.trim()).join(', ')
      : fullName;

    const searchQuery = company
      ? `Search Twitter/X for profiles matching: ${searchTerms}. Use the search function to find the user. If a matching profile is found: 1) Check their bio for company name "${company}", 2) Read their recent tweets (at least 10) for mentions of work, internal tools, or company information, 3) Check if profile is public or protected. Return detailed JSON: {profileUrl, bio, bioMentionsCompany: boolean, recentTweets: [{text, date}], tweetsMentionWork: boolean, mentionedTools: [string]}`
      : `Search Twitter/X for profiles matching: ${searchTerms}. Use the search function. If found: 1) Check bio for company/employer mentions, 2) Read recent tweets for work-related content, 3) Check profile visibility. Return JSON: {profileUrl, bio, hasWorkTweets: boolean, recentTweets: [{text}], isPublic: boolean}`;

    // If authenticated session was created, use it. Otherwise, create an ephemeral session
    const agentOptions = {
      task: searchQuery,
      maxSteps: 15,
    };

    if (sessionId) {
      agentOptions.sessionId = sessionId;
    } else {
      // No authenticated session - use sessionOptions for ephemeral session
      agentOptions.sessionOptions = {
        stealth: true,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };
    }

    const result = await hbClient.agents.hyperAgent.startAndWait(agentOptions);

    const data = result.data?.finalResult;

    if (data && data.includes('profileUrl')) {
      findings.push({
        platform: 'Twitter',
        finding_type: 'profile_found',
        description: 'Twitter/X profile found',
        severity: 'low',
        points_deducted: 5,
        raw_data: data,
      });

      // Check if bio mentions company
      if (data.toLowerCase().includes('biomentionscompany') || data.toLowerCase().includes('company')) {
        findings.push({
          platform: 'Twitter',
          finding_type: 'company_in_bio',
          description: 'Twitter bio mentions company name or employer',
          severity: 'medium',
          points_deducted: 10,
          raw_data: data,
        });
      }

      // Check if tweets mention company or work
      const workKeywords = ['work', 'job', 'office', 'team', 'project', 'deployment', 'release', 'sprint'];
      const hasTechMentions = data.includes('mentionedTools') || workKeywords.some(keyword => data.toLowerCase().includes(keyword));

      if (hasTechMentions) {
        findings.push({
          platform: 'Twitter',
          finding_type: 'work_tweets',
          description: 'Tweets mention work, company information, or technical tools',
          severity: 'medium',
          points_deducted: 12,
          raw_data: data,
        });
      }

      // Check for tech stack exposure in tweets
      const techKeywords = ['aws', 'docker', 'kubernetes', 'react', 'node', 'python', 'typescript'];
      if (techKeywords.some(keyword => data.toLowerCase().includes(keyword))) {
        findings.push({
          platform: 'Twitter',
          finding_type: 'tech_stack_tweets',
          description: 'Tweets reveal specific technologies or tools used at work',
          severity: 'high',
          points_deducted: 15,
          raw_data: data,
        });
      }
    }
  } catch (error) {
    console.error('Twitter scan error:', error);
    findings.push({
      platform: 'Twitter',
      finding_type: 'scan_error',
      description: `Scan failed: ${error.message}`,
      severity: 'info',
      points_deducted: 0,
      raw_data: JSON.stringify({ error: error.message }),
    });
  } finally {
    // Note: We don't stop the session here to keep the live URL active
    // The session will be stopped when the scan is completed or manually stopped
    // This allows users to watch the live preview during scanning
  }

  return { findings, liveUrl: null };
}

export async function scanFacebook({ fullName, location }) {
  const findings = [];

  try {
    const searchQuery = location
      ? `Search Facebook for "${fullName}" in ${location}. Check if there's a public profile visible without login. Return a JSON object with: hasPublicProfile (boolean), visibleInfo (string describing what's visible).`
      : `Search Facebook for "${fullName}". Check if there's a public profile visible without login. Return a JSON object with: hasPublicProfile (boolean), visibleInfo (string describing what's visible).`;

    const result = await hbClient.agents.hyperAgent.startAndWait({
      task: searchQuery,
      maxSteps: 10,
      sessionOptions: {
        stealth: true,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const data = result.data?.finalResult;

    if (data && (data.toLowerCase().includes('true') || data.toLowerCase().includes('public'))) {
      findings.push({
        platform: 'Facebook',
        finding_type: 'public_profile',
        description: 'Facebook profile is publicly accessible without login',
        severity: 'medium',
        points_deducted: 15,
        raw_data: data,
      });
    }
  } catch (error) {
    console.error('Facebook scan error:', error);
    findings.push({
      platform: 'Facebook',
      finding_type: 'scan_error',
      description: `Scan failed: ${error.message}`,
      severity: 'info',
      points_deducted: 0,
      raw_data: JSON.stringify({ error: error.message }),
    });
  }

  return { findings, liveUrl: null };
}

export function calculateOpsecScore(findings) {
  const MAX_SCORE = 100;
  const totalDeductions = findings.reduce((sum, finding) => sum + finding.points_deducted, 0);

  const score = Math.max(0, MAX_SCORE - totalDeductions);

  return score;
}

export function generateRecommendations(findings) {
  const recommendations = [];

  for (const finding of findings) {
    switch (finding.finding_type) {
      case 'tech_stack_exposure':
        recommendations.push({
          severity: 'high',
          title: 'Remove tech stack details from LinkedIn',
          description: 'Avoid posting about specific internal tools, frameworks, or technical architecture on LinkedIn. This information can be used by attackers to craft targeted attacks.',
        });
        break;
      case 'security_practice_exposure':
        recommendations.push({
          severity: 'high',
          title: 'Don\'t discuss security practices publicly',
          description: 'Never post about company security practices, authentication methods, or security tools on social media. This gives attackers valuable information.',
        });
        break;
      case 'company_email_exposed':
        recommendations.push({
          severity: 'high',
          title: 'Use personal email for GitHub commits',
          description: 'Configure Git to use a personal email address instead of your company email for public repositories. Run: git config --global user.email "personal@email.com"',
        });
        break;
      case 'public_profile':
        recommendations.push({
          severity: 'medium',
          title: 'Make Facebook profile private',
          description: 'Change your Facebook privacy settings to prevent strangers from viewing your profile. Go to Settings > Privacy and set "Who can see your future posts?" to "Friends".',
        });
        break;
      case 'company_in_bio':
        recommendations.push({
          severity: 'medium',
          title: 'Consider removing company from bio',
          description: 'While not always necessary, removing company affiliation from social media bios reduces your attack surface and separates personal from professional identity.',
        });
        break;
      case 'detailed_job_description':
        recommendations.push({
          severity: 'medium',
          title: 'Simplify job description',
          description: 'Keep LinkedIn job descriptions high-level. Avoid mentioning specific infrastructure, cloud providers, or internal systems.',
        });
        break;
      case 'work_tweets':
        recommendations.push({
          severity: 'medium',
          title: 'Separate work from personal social media',
          description: 'Consider using a separate professional account for work-related posts, or avoid posting about work details on personal accounts.',
        });
        break;
    }
  }

  // Remove duplicates
  const uniqueRecs = recommendations.filter((rec, index, self) =>
    index === self.findIndex((r) => r.title === rec.title)
  );

  return uniqueRecs;
}
