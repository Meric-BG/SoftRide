# Kemet Assistant Documentation

## Overview
Kemet Assistant is a **Voice AI** capable of controlling vehicle functions and retrieving real-time status updates using the xAI Realtime API and Supabase.

## Architecture
- **Agent Framework**: LiveKit Agents (Python)
- **LLM**: xAI `grok-beta` (or similar realtime model) via `livekit-plugins-xai`
- **Database**: Supabase (PostgreSQL) for vehicle state
- **Voice**: LiveKit Realtime (WebRTC)

## Tools (Actions)
The assistant uses the following tools to interact with the car:
1.  **get_battery_level**: Fetches the current charge percentage from the `vehicles` table.
2.  **set_ac_state**: Turns the AC on or off (`ac_is_on` column).
3.  **is_car_locked**: Checks if the vehicle is locked (`is_locked` column).

## Setup
### Prerequisites
- Python 3.9+
- Supabase project
- xAI API Key
- LiveKit Cloud project

### Environment Variables
Create a `.env` file:
```bash
LIVEKIT_URL=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
XAI_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
```

### Running the Assistant
```bash
python3 assitant.py dev
```
