# TwinMind - Quick Start Guide

## 🚀 Get Started in 2 Minutes

### Option 1: Run Locally

```bash
# Step 1: Install dependencies
npm install --legacy-peer-deps

# Step 2: Start dev server
npm run dev

# Step 3: Open browser
# http://localhost:3000

# Step 4: Add your API key
# - Click Settings button
# - Paste your Groq API key (get one free at https://console.groq.com)
# - Click Save

# Step 5: Start recording!
# - Click "Start Recording"
# - Allow microphone access
# - Start speaking
```

### Option 2: Deploy to Vercel (Production)

```bash
# Step 1: Push to GitHub
git push origin main

# Step 2: Go to https://vercel.com/new
# Step 3: Import your repository
# Step 4: Click Deploy
# Step 5: Share your live link!

# Your app will be live in ~2 minutes at:
# https://<project-name>.vercel.app
```

---

## 🎙️ How to Use

### 1. Recording
1. Click **Start Recording** button
2. Speak naturally for your meeting/conversation
3. Audio is transcribed every ~30 seconds
4. Watch transcript appear on the left

### 2. Suggestions
1. Suggestions auto-generate every ~60 seconds
2. Each batch has 3 different types of suggestions
3. Click **Refresh** to generate new suggestions manually
4. Scroll through older suggestion batches

### 3. Chat
1. Click any suggestion to add it to chat
2. Or type your own questions directly
3. Press Enter to send
4. Get AI responses grounded in your conversation

### 4. Export
1. Click **Export** button
2. Download JSON file with everything:
   - Full transcript with timestamps
   - All suggestions with timestamps
   - Complete chat history
   - Session settings

---

## ⚙️ Settings

Click **Settings** to customize:

| Setting | Default | What It Does |
|---------|---------|--------------|
| API Key | (required) | Your Groq API credentials |
| Models | Mixtral-8x7b | Which AI models to use |
| Context Window | 3-8 chunks | How much conversation context to consider |
| Temperature | 0.7 | How creative (0=deterministic, 2=random) |
| Top P | 0.9 | Diversity of responses |
| Prompts | (editable) | Customize how the AI thinks |

All settings save automatically to your browser.

---

## 📚 What Is TwinMind?

A **real-time meeting copilot** that:

✅ **Listens** to your conversations via microphone
✅ **Transcribes** everything with Groq Whisper
✅ **Suggests** 3 relevant actions every minute
✅ **Answers** your questions grounded in context
✅ **Exports** everything for later review

Built for:
- Meeting preparation
- Decision support
- Action item tracking
- Idea development
- Team collaboration

---

## 🤔 Example Conversation

**You speak**:
> "So we're looking at launching in Q3. The main risk is the dependency on the payment team. We should probably verify those timelines before committing to anything."

**TwinMind suggests**:
1. ❓ **Q3 Launch Dependencies** - "What specific tasks depend on the payment team? Get details now."
2. 💡 **Verify Timeline** - "Ask payment team for Q3 availability confirmation."
3. ✅ **Next Steps** - "Action: Schedule payment team sync to confirm Q3 feasibility."

**You click** the first suggestion → Detailed answer appears in chat with talking points

---

## 🔑 API Key Setup

### Get Your Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Go to API Keys section
4. Create new API key
5. Copy the key (looks like `gsk_...`)
6. Paste into TwinMind Settings

### Free Tier Includes
- 30 requests/minute
- Generous daily quota
- All models available

---

## 📁 Files Overview

```
Transcript (Left)      Suggestions (Middle)    Chat (Right)
├── Recording button   ├── Auto-refresh        ├── Suggestion details
├── Transcript         ├── 3 suggestions       ├── User questions
├── Timestamps         ├── Type badges         ├── AI responses
└── Auto-scroll        └── Batches below       └── Timestamps
```

---

## ⚡ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Send chat message |
| Shift+Enter | New line in chat |
| (space) | Currently no shortcuts, could add! |

---

## ❓ FAQ

### Q: Where is my data stored?
A: Nowhere! Everything stays in your browser. Nothing leaves except API calls to Groq.

### Q: Can I share my session?
A: Export to JSON and share the file. Others can review transcripts/suggestions.

### Q: Can I run this offline?
A: No, you need internet for audio transcription and AI responses (requires Groq API).

### Q: Can I use my own API key?
A: Yes! That's the only way it works. Paste your own Groq key in Settings.

### Q: How much does it cost?
A: Groq free tier is generous. Check [groq.com/pricing](https://groq.com/pricing) for details.

### Q: Can I customize the AI behavior?
A: Absolutely! Edit the prompts in Settings for different suggestion styles.

### Q: Does it work on mobile?
A: Yes, it's responsive, but best on desktop due to 3-column layout.

### Q: Can I use different AI models?
A: Yes! Go to Settings and pick from available Groq models.

---

## 🐛 Troubleshooting

### "Microphone access denied"
- Check browser permission for microphone
- Refresh page and try again
- Make sure you're using HTTPS

### "Invalid API key"
- Verify key from [console.groq.com](https://console.groq.com)
- Key should be 50+ characters
- Remove spaces when copying/pasting

### "No suggestions appearing"
- Ensure you have transcript (speak for 30+ seconds first)
- Check API key is set (warning in header)
- Check internet connection
- Try refreshing the page

### "Transcription is empty"
- Check microphone is not muted
- Speak clearly and at normal volume
- Ensure 30-second chunk has actual content
- Silent audio is skipped

### "Settings disappeared"
- Clear browser cache and try again
- Try incognito window
- Check if localStorage is enabled

---

## 📖 Documentation

For more details, see:

- **README.md** - Comprehensive user guide
- **DEPLOYMENT.md** - Architecture and deployment
- **DESIGN_DECISIONS.md** - Why each choice was made
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **DELIVERY_CHECKLIST.md** - Complete requirements checklist

---

## 💡 Tips for Best Results

1. **Use Good Audio**: Clear microphone = better transcription
2. **Speak Naturally**: Don't over-articulate, just talk normally
3. **Wait for Suggestions**: Let 60 seconds pass for fresh suggestions
4. **Review Exports**: Download session JSON for archival
5. **Customize Prompts**: Edit prompts in Settings for your use case
6. **Check Context**: Adjust context windows for your meeting style

---

## 🚀 Next Steps

1. **Local Demo**: Run locally with `npm run dev`
2. **Get API Key**: Go to [console.groq.com](https://console.groq.com)
3. **Record Demo**: Have a 5-minute conversation
4. **Check Suggestions**: See if they match your context
5. **Deploy**: Push to Vercel when ready
6. **Share**: Send link to friends/team

---

## 🎯 Use Cases

- **Meetings**: Get real-time suggestions and action items
- **Brainstorming**: Generate ideas and next steps
- **Decisions**: Get clarification suggestions on the fly
- **Fact-Checking**: Detect claims that need verification
- **Interview Prep**: Practice and get feedback
- **Podcasts**: Generate show notes automatically
- **Lectures**: Create study notes from audio

---

## 📞 Support

**Issues?**
1. Check Troubleshooting section above
2. Review [README.md](./README.md)
3. Check [groq.com/docs](https://groq.com/docs)
4. Review [groq.com/status](https://groq.com/status) for API status

**Want to extend it?**
- Add new suggestion types in `types/index.ts`
- Edit prompts in `prompts/` folder
- Customize UI in `components/`
- Add features in API routes

---

## 🎉 Ready?

1. Install dependencies: `npm install --legacy-peer-deps`
2. Start dev server: `npm run dev`
3. Open http://localhost:3000
4. Add API key in Settings
5. Click "Start Recording"
6. **Start building smarter conversations!**

---

**Questions?** Check the docs or jump in and experiment!

**Have fun!** 🚀
