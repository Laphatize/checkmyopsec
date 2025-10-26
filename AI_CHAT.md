# AI Chat Advisor Feature

CheckMyOpsec includes an AI-powered chat advisor built with Google's Gemini API that helps users understand their OPSEC scan results and get personalized advice.

## Features

### 1. Contextual Understanding
The AI advisor has full context of:
- Your OPSEC score
- All findings from the scan
- Platform-specific issues
- Severity levels of each finding
- Points deducted per issue

### 2. Personalized Advice
Ask questions like:
- "What's my biggest OPSEC risk?"
- "How can I improve my score?"
- "What should I remove from LinkedIn?"
- "Why is mentioning AWS a security concern?"
- "What platforms should I focus on first?"

### 3. Step-by-Step Guidance
The AI provides:
- Specific, actionable steps
- Platform-specific instructions
- Privacy best practices
- Risk explanations
- Remediation guides

## How It Works

### Backend (API Route)

Located at: [app/api/scans/[scanId]/chat/route.js](app/api/scans/[scanId]/chat/route.js)

```javascript
POST /api/scans/[scanId]/chat
{
  "message": "How can I improve my score?"
}

// Response:
{
  "message": "Based on your scan results...",
  "scanScore": 65,
  "findingsCount": 8
}
```

**What it does:**
1. Authenticates the user
2. Fetches scan details and findings from database
3. Builds context prompt with all findings
4. Sends question + context to Gemini API
5. Returns AI-generated response

**Context Prompt Structure:**
```
You are an OPSEC advisor...

User Information:
- Name: John Doe
- Company: Acme Corp
- Overall OPSEC Score: 65/100

Findings:
- [LinkedIn] HIGH RISK: Mentioned AWS, Docker in posts (Impact: -15 points)
- [GitHub] HIGH RISK: Company email in commits (Impact: -20 points)
...

User's question: How can I improve my score?
```

### Frontend (Chat Component)

Located at: [components/opsec-chat.jsx](components/opsec-chat.jsx)

**Features:**
- ✅ Chat interface with message history
- ✅ Suggested questions on first load
- ✅ Loading states
- ✅ Keyboard support (Enter to send)
- ✅ Auto-scroll to latest message
- ✅ Error handling

**UI Components:**
- Message bubbles (user vs AI)
- Text input with auto-resize
- Suggested question chips
- AI thinking indicator
- Powered by Gemini badge

### Integration (Results Page)

Located at: [app/dashboard/scans/\[scanId\]/page.js](app/dashboard/scans/[scanId]/page.js)

The chat is integrated as a third tab alongside Findings and Recommendations:

```
Tabs:
├── Findings (9)
├── Recommendations (7)
└── AI Advisor  ← New!
```

## Setup

### 1. Get Google Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### 2. Add to Environment Variables

```bash
# .env.local
GOOGLE_KEY=your-google-gemini-api-key
```

### 3. Verify Installation

```bash
# Check that @google/generative-ai is installed
npm list @google/generative-ai

# Should show:
# @google/generative-ai@0.x.x
```

## Example Conversations

### Example 1: Understanding Risks

**User:** "Why is mentioning AWS in my LinkedIn posts a problem?"

**AI:** "Mentioning AWS in your LinkedIn posts is a security concern for several reasons:

1. **Tech Stack Disclosure**: It reveals the cloud infrastructure your company uses, which helps attackers understand your architecture.

2. **Attack Surface**: Knowing you use AWS allows attackers to focus on AWS-specific vulnerabilities and misconfigurations.

3. **Social Engineering**: This information can be used in phishing attacks. For example, an attacker might pose as AWS support.

**Recommended Actions:**
- Edit or delete posts mentioning specific cloud providers
- Keep job descriptions general ("cloud infrastructure" instead of "AWS")
- Move technical discussions to private channels
- Review all posts from the last year for similar mentions

This would improve your score by approximately 15 points."

### Example 2: Improving Score

**User:** "What's the fastest way to improve my score?"

**AI:** "Based on your scan results, here are the highest-impact fixes:

**1. Remove Company Email from GitHub (Impact: +20 points)**
- Configure Git with personal email:
  ```
  git config --global user.email "personal@email.com"
  ```
- Update past commits if needed
- Check public repos for commits with company email

**2. Edit LinkedIn Posts (Impact: +15 points)**
- Delete or edit posts mentioning internal tools (Docker, Kubernetes)
- Remove specific tech stack references
- Keep posts about general problem-solving instead

**3. Make Facebook Private (Impact: +15 points)**
- Settings > Privacy
- Change "Who can see your posts?" to "Friends"
- Review past posts for public visibility

These 3 changes alone would bring your score from 50 to 100!"

### Example 3: Platform-Specific Advice

**User:** "How do I remove my company from my Twitter bio?"

**AI:** "Here's how to remove company info from your Twitter/X bio:

**Steps:**
1. Open Twitter and go to your profile
2. Click "Edit profile"
3. In the bio field, remove any mention of your company name
4. Click "Save"

**Alternative Approach:**
If you want to keep professional context without naming the company:
- Instead of: "Software Engineer at Acme Corp"
- Use: "Software Engineer | Tech Enthusiast"

**Additional Tips:**
- Also check your location field
- Review pinned tweets for company mentions
- Check if your username includes company name

This change will improve your score by 10 points and reduce social engineering risks."

## Suggested Questions

The chat displays these suggested questions on first load:

1. "What's my biggest OPSEC risk?"
2. "How can I improve my score?"
3. "What should I remove from LinkedIn?"
4. "Why is this a security concern?"
5. "What platforms should I focus on first?"

Users can click any suggestion to automatically send that question.

## Technical Details

### API Call Flow

```
User types message
    ↓
Frontend sends POST to /api/scans/[scanId]/chat
    ↓
Backend authenticates user
    ↓
Backend fetches scan + findings from database
    ↓
Backend builds context prompt
    ↓
Backend calls Gemini API
    ↓
Gemini generates response
    ↓
Backend returns AI message to frontend
    ↓
Frontend displays in chat
```

### Rate Limiting

Currently no rate limiting on chat API. Consider adding:

```javascript
// Suggested implementation
const MAX_MESSAGES_PER_SCAN = 50;
const MAX_MESSAGES_PER_MINUTE = 5;
```

### Cost Considerations

**Gemini API Pricing** (as of 2024):
- Free tier: 60 requests per minute
- Input: $0.00125 per 1K characters
- Output: $0.005 per 1K characters

**Estimated costs:**
- Average question: ~500 characters
- Average context: ~2000 characters
- Average response: ~1000 characters
- Cost per message: ~$0.004

For 1000 users with 10 messages each:
- Total: 10,000 messages
- Cost: ~$40

**To reduce costs:**
1. Implement message limits per scan
2. Cache common questions/answers
3. Use rate limiting
4. Consider switching to gemini-pro-free in production

### Error Handling

The chat handles:
- ✅ Network errors
- ✅ API failures
- ✅ Invalid scan IDs
- ✅ Unauthenticated users
- ✅ Gemini API errors

Error responses show:
```
"Sorry, I encountered an error. Please try again."
```

### Security

**What's Protected:**
- ✅ User authentication required
- ✅ Can only access own scans
- ✅ No user data leaked to Gemini
- ✅ API key stored in environment variables

**What's Sent to Gemini:**
- Scan findings (platform, description, severity)
- OPSEC score
- User's question
- Generic prompt/instructions

**NOT sent to Gemini:**
- User email
- User ID
- Raw HTML/data from social media
- Credentials or secrets

## Best Practices

### For Users

**Good Questions:**
- "What's the biggest risk in my scan?"
- "How do I fix the LinkedIn issues?"
- "What should I do first?"
- "Why is X a security concern?"

**Less Helpful Questions:**
- "Hello" (too vague)
- "Fix everything" (too broad)
- Questions about unrelated topics

### For Developers

**Prompt Engineering Tips:**
1. Keep context concise but complete
2. Set clear role for AI (OPSEC advisor)
3. Specify output format (actionable steps)
4. Include examples in system prompt
5. Test with real scan data

**Maintenance:**
1. Monitor Gemini API usage
2. Track popular questions
3. Update system prompt based on user feedback
4. Add more suggested questions
5. Consider caching common answers

## Troubleshooting

### "Failed to generate response"

**Causes:**
- Invalid Google API key
- Gemini API quota exceeded
- Network error

**Fix:**
```bash
# Verify API key is set
echo $GOOGLE_KEY

# Test API key manually
curl https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
  -H "x-goog-api-key: YOUR_KEY"
```

### AI gives generic responses

**Cause:** Not enough context in findings

**Fix:** Improve scanner to capture more specific details

### Chat not loading

**Cause:** Missing dependencies or build error

**Fix:**
```bash
npm install @google/generative-ai
npm run build
```

## Future Enhancements

### Planned Features

- [ ] Message history persistence (save to database)
- [ ] Export chat conversation
- [ ] Voice input for questions
- [ ] Pre-built response templates
- [ ] Multi-language support
- [ ] Chat analytics dashboard

### Advanced Features

- [ ] RAG (Retrieval Augmented Generation) with OPSEC knowledge base
- [ ] Fine-tuned model on OPSEC best practices
- [ ] Automated fix suggestions with code examples
- [ ] Integration with security frameworks (NIST, etc.)
- [ ] Comparison with industry benchmarks

## Related Files

- [components/opsec-chat.jsx](components/opsec-chat.jsx) - Chat UI component
- [app/api/scans/\[scanId\]/chat/route.js](app/api/scans/[scanId]/chat/route.js) - Chat API endpoint
- [app/dashboard/scans/\[scanId\]/page.js](app/dashboard/scans/[scanId]/page.js) - Results page integration

## Resources

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Generative AI SDK for Node.js](https://github.com/google/generative-ai-js)
- [Gemini Prompting Guide](https://ai.google.dev/docs/prompt_best_practices)
