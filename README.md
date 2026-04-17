# TwinMind - Live Conversation Copilot

A real-time meeting assistant that listens to your conversations, transcribes speech continuously, generates intelligent live suggestions, and provides context-aware chat powered by Groq AI models.

## Features

### 🎙️ Live Audio Transcription
- Continuous microphone recording with automatic transcription
- Groq Whisper Large V3 for accurate speech-to-text
- Audio chunks processed every 30 seconds (configurable)
- Timestamped transcript with duration tracking

### 💡 Intelligent Live Suggestions
- Generates exactly 3 fresh suggestions on every refresh
- Conversation-aware heuristics detect questions, decisions, ambiguity, action items
- Diverse suggestion types: questions, talking points, answers, fact-checks, clarifications, next steps
- Avoids repetition by remembering recent suggestions
- Groq GPT-OSS 120B for powerful reasoning

### 💬 Interactive Chat
- Click any suggestion for a detailed answer
- Type your own questions grounded in transcript context
- Continuous chat session with full message history
- Real-time generation with loading indicators

### 📊 Session Export
- Export complete session as JSON including transcript, suggestions, chat, and settings

### ⚙️ Customizable Settings
- Groq API key (stored in browser localStorage)
- Model selection for transcription and generation
- Context window configuration
- Temperature and top_p parameters
- Editable prompt templates

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **UI**: React 19 + Tailwind CSS
- **Icons**: Lucide React
- **API**: Groq SDK
- **Audio**: Browser MediaRecorder API
- **Storage**: localStorage
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Groq API key from [console.groq.com](https://console.groq.com)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Setup

1. Click **Settings** button in top right
2. Paste your Groq API key
3. (Optional) Customize prompts, models, context windows
4. Save settings

## Usage

### Recording a Conversation

1. Click **Start Recording** button
2. Grant microphone access when prompted
3. Speak naturally - audio is transcribed every ~30 seconds
4. Suggestions auto-refresh every ~60 seconds
5. Click **Stop Recording** to end session

### Working with Suggestions

- Each batch shows 3 suggestions with:
  - Type badge (Question, Talking Point, Answer, Fact Check, Clarification, Next Step)
  - Title (the action)
  - Preview (concise useful context)
- Click any suggestion to:
  - Add it to chat panel
  - Generate a detailed answer grounded in the conversation
  - See full context and reasoning

### Chat Interface

- Type questions directly in the input box
- Press Enter (or Shift+Enter) to send
- Messages are grounded in current transcript
- Assistant distinguishes facts from inferences
- Full conversation history maintained
- Real-time answer generation

### Exporting Your Session

1. Click **Export** button (available when transcript exists)
2. Browser downloads JSON file containing:
   - Complete transcript with timestamps
   - All suggestion batches
   - Full chat history
   - Session settings used
3. Use for archival, sharing, or analysis

## Architecture

### 3-Column Layout

```
┌─────────────────┬─────────────────┬─────────────────┐
│   TRANSCRIPT    │   SUGGESTIONS   │      CHAT       │
├─────────────────┼─────────────────┼─────────────────┤
│ Mic Control     │ Auto-refresh    │ Clickable       │
│ Recording       │ 3 suggestions   │ chat interface  │
│ Timestamped     │ per batch       │                 │
│ chunks          │ with types      │ Grounded in     │
│                 │                 │ transcript      │
└─────────────────┴─────────────────┴─────────────────┘
```

### API Routes

- **`/api/transcribe`** - Audio blob → text (Groq Whisper)
- **`/api/suggestions`** - Transcript → 3 suggestions (Groq LLM)
- **`/api/detailed-answer`** - Suggestion → detailed answer
- **`/api/chat`** - User question → grounded response

### Smart Suggestion Pipeline

1. **Extract Context**: Recent transcript chunks (configurable)
2. **Detect Signals**: Lightweight heuristics find:
   - Questions asked
   - Decision language
   - Ambiguity/confusion
   - Action items
   - Factual claims
3. **Structured Prompt**: Pass signals + context to LLM
4. **Generate**: Get exactly 3 diverse suggestions
5. **Validate**: Sanitize and verify JSON structure
6. **Avoid Repetition**: Check against recent suggestion titles
7. **Return**: Timestamped suggestion batch

### Context Windows

- **Live Suggestions**: Last 3 chunks (default)
  - Focused on current conversation state
  - Fast response time
  - Lower token usage

- **Chat/Detailed Answers**: Last 8 chunks (default)
  - Broader context for nuanced understanding
  - Better grounding in conversation
  - More tokens but more relevant

Both configurable in Settings.

## File Structure

```
app/
  page.tsx                 # Main page with 3-column layout
  layout.tsx              # App layout with metadata
  api/
    transcribe/
      route.ts            # Audio transcription
    suggestions/
      route.ts            # Live suggestions generation
    chat/
      route.ts            # Chat responses
    detailed-answer/
      route.ts            # Detailed answers

components/
  TranscriptPanel.tsx     # Left column - transcript
  SuggestionsPanel.tsx    # Middle column - suggestions
  ChatPanel.tsx           # Right column - chat
  MicControls.tsx         # Microphone recording controls
  SuggestionCard.tsx      # Individual suggestion display
  SettingsDialog.tsx      # Settings modal

lib/
  defaults.ts             # Default settings & storage keys
  heuristics.ts           # Conversation signal detection
  validators.ts           # JSON validation & sanitization
  exportSession.ts        # Session export logic

prompts/
  liveSuggestions.ts      # Live suggestions prompt template
  detailedAnswer.ts       # Detailed answer prompt template
  chat.ts                 # Chat prompt template

types/
  index.ts                # TypeScript type definitions
```

## Key Design Decisions

### Why Context Windows?

Don't send full transcript to every API call. Instead:
- Use recent chunks only for speed & cost
- Pass conversation signals (not raw text) for better reasoning
- Larger window for chat (needs full context)
- Smaller window for suggestions (focuses on current state)

### Why Heuristics?

Lightweight regex/keyword detection improves suggestion quality by:
- Telling the model what conversational state we're in
- Guiding it to suggest appropriate types
- Reducing need for complex in-context learning

### Why No Database?

This app is stateless and disposable:
- No server-side storage overhead
- Full privacy - no data leaves the browser except API calls
- Easy deployment to Vercel
- localStorage handles settings persistence

### Why Client-Side API Key?

Users paste their own key because:
- Zero infrastructure costs for app creator
- User owns their credentials
- Works on Vercel free tier
- No backend to secure

**Security**: Key is never transmitted to external services. API calls go directly from browser to Groq.

## Heuristics

Conversation signal detection happens on recent transcript before prompting:

- **questionDetected**: Looks for `?` marks and question keywords (what, when, why, how, should, would)
- **decisionLanguageDetected**: Finds decision markers (decide, choose, prefer, recommend, should go with)
- **ambiguityDetected**: Spots confusion (unclear, ambiguous, clarify, what do you mean)
- **actionItemDetected**: Locates action language (let's, we need to, follow up, owner, responsible)
- **factualClaimDetected**: Finds factual language (according to, data shows, studies, statistics, increased)
- **clarificationNeeded**: Detects requests for explanation (could you, can you, tell me, explain, more detail)

These are passed to the suggestion prompt to guide model behavior.

## Prompting Strategy

### Live Suggestions Prompt
- Takes recent context + detected signals
- Requests exactly 3 suggestions
- Enforces diverse types
- Instructs for concrete, actionable previews
- Returns strict JSON schema
- Includes list of recent suggestion titles to avoid repetition

### Detailed Answer Prompt
- Takes broader context + the clicked suggestion
- Asks for detailed, grounded response
- Requests talking points, caveats, phrasing ideas
- Distinguishes facts from inferences
- Returns markdown formatted response

### Chat Prompt
- Takes transcript context + user question
- Asks for concise, grounded answer
- Emphasizes facts vs. inferences
- Notes when external knowledge needed
- Returns markdown formatted response

## Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Go to vercel.com/new
# Connect GitHub repo
# Click Import
# Click Deploy
```

App is live at `https://<project>.vercel.app`

### Self-Hosted

```bash
npm run build
npm start
```

Runs on port 3000 by default.

## Configuration

### Environment Variables

No env vars required! Users provide their API key in Settings.

Optional (for local development):
```bash
# .env.local (not committed)
NEXT_PUBLIC_GROQ_API_KEY=your_key_here
```

### Settings (localStorage)

Users can customize via Settings dialog:
- **API Key**: Groq API key (required)
- **Models**: Transcription, suggestion, and chat models
- **Context Windows**: How many chunks for each operation
- **Generation Parameters**: Temperature, top_p
- **Chunk Duration**: How often to transcribe
- **Prompts**: Customize suggestion, answer, and chat prompts
- **Repetition**: Toggle avoiding repeated suggestions

All saved to localStorage.

## Performance

Typical timings:

| Operation | Time | Notes |
|-----------|------|-------|
| Transcription (30s audio) | 3-5s | Groq Whisper is fast |
| Suggestions (3x) | 2-3s | Structured JSON helps |
| Chat response | 2-3s | Smaller context = faster |

Groq's inference is extremely fast. Sessions feel responsive and interactive.

## API Quotas

Groq free tier includes:
- 30 requests/minute
- Generous daily quotas
- Clear error messages when rate limited

Paid plans available for higher usage.

See [groq.com/pricing](https://groq.com/pricing)

## Troubleshooting

### "Microphone access denied"
- Check browser microphone permissions
- Refresh page and try again
- Ensure you're using HTTPS (required by browser)

### "Invalid API key"
- Verify key from [console.groq.com](https://console.groq.com)
- Key should be 50+ characters
- Remove and re-paste in Settings

### No suggestions appearing
- Ensure at least one transcript chunk exists
- Check API key is set (warning in header)
- View browser console for errors
- Verify Groq API quota not exceeded

### Transcription is empty
- Check microphone is not muted
- Speak clearly at normal volume
- Ensure 30-second chunk has actual content
- Silent audio is skipped

### Settings not persisting
- Check localStorage is enabled
- Try incognito/private window
- Settings persist per browser/domain

## Development Tips

### Adding New Suggestion Types

1. Update `types/index.ts` - `SuggestionType` enum
2. Add color mapping in `components/SuggestionCard.tsx`
3. Update heuristics if needed in `lib/heuristics.ts`
4. Update prompt to request new type

### Customizing Prompts

All prompts in `prompts/` folder:

- `liveSuggestions.ts` - What suggestions look like
- `detailedAnswer.ts` - Format for detailed answers
- `chat.ts` - Format for chat responses

Edit template functions to change model behavior.

### Adding New Models

1. Update `DEFAULT_SETTINGS` in `lib/defaults.ts`
2. Add to select dropdowns in `components/SettingsDialog.tsx`
3. Groq SDK handles the rest automatically

### Debugging

Check browser console for:
- API errors with status codes
- JSON parsing failures
- Network errors

Check API routes in terminal:
- `console.error()` statements show server-side errors
- Check Groq SDK error messages

## Known Limitations

- No persistence across browser refresh (except settings)
- No multi-user collaboration
- No real-time sync across devices
- Transcript is client-side only
- No audio file upload (microphone only)
- No speaker diarization

## Future Enhancements

- Speaker diarization (who said what)
- Meeting summaries
- Action item tracking
- Calendar/CRM integration
- Mobile app
- Cloud backup
- Team sharing
- Analytics dashboard

## License

MIT - Free to use and modify

## Support

- [Groq Documentation](https://groq.com/docs)
- [GitHub Issues](https://github.com)

---

**Ready to build smarter conversations?**

Start recording and let TwinMind enhance your meetings.
# TwinMind
# TwinMind
