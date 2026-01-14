# Kemet Assistant - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

- **LiveKit**: Sign up at [cloud.livekit.io](https://cloud.livekit.io) to get `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`
- **xAI**: Get your API key from [console.x.ai](https://console.x.ai) for `XAI_API_KEY`
- **Supabase** (Optional): For vehicle data persistence, get credentials from your Supabase project

### 3. Run the Assistant

```bash
python assitant.py dev
```

This will start the LiveKit agent. The console will show a connection URL.

### 4. Connect and Talk

**Option A: LiveKit Playground** (Easiest for testing)
1. Open [agents-playground.livekit.io](https://agents-playground.livekit.io/)
2. Enter your LiveKit credentials
3. Connect and start talking!

**Option B: Custom Frontend** (For production)
- Integrate the LiveKit SDK into `apps/my-kemet` or your own frontend
- Connect to the same LiveKit room

### 5. Test Voice Interactions

Try saying:
- "What's my battery level?"
- "Turn on the AC"
- "Is my car locked?"
- Or just chat—Kemet's got jokes!

## Features Implemented ✅

- **Voice-to-Voice**: Speak naturally, get audio responses
- **AI Actions**: Kemet can control your car (battery check, AC, locks)
- **Interruptible**: You can cut Kemet off mid-sentence (built into `allow_interruptions=True`)
- **Chill Personality**: Kemet is funny, relaxed, and makes jokes

## Next Steps (Roadmap)

- **Voice Tone Adaptation** (Phase 4): Match user's energy and tone
- **Context Awareness** (Phase 5): Remember past conversations and user preferences

## Troubleshooting

### SSL Certificate Errors
The code includes a workaround for Fortinet/corporate SSL interception. If you still have issues, check your network settings.

### No Voice Output
Make sure your LiveKit room has proper audio permissions and your browser allows microphone access.

### Tools Not Working
Verify your Supabase credentials are correct in `.env`. The assistant will use mock data if Supabase is unavailable.
