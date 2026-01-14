import asyncio
import logging
import aiohttp
import ssl
from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    Agent,
    AgentSession,
    cli,
    llm,
)
from livekit.plugins import xai
from db import KemetDB
from typing import Annotated

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("grok-assistant")

# Initialize DB Wrapper
db = KemetDB()

@llm.function_tool
async def get_battery_level() -> str:
    """Get the current battery level of the car."""
    logger.info("TOOL CALL: get_battery_level()")
    try:
        # Note: db calls are synchronous, blocking the loop briefly. 
        # For production, run in an executor or use an async DB client.
        data = db.get_vehicle_status()
        if data:
            level = data.get('battery_level')
            logger.info(f"TOOL RESULT: Battery level is {level}%")
            return f"The battery level is {level}%."
        logger.warning("TOOL RESULT: Failed to retrieve data")
        return "I couldn't retrieve the battery level. Please ensure the vehicle data exists in Supabase."
    except Exception as e:
        logger.error(f"TOOL ERROR: {e}")
        return "Error checking battery."

@llm.function_tool
async def set_ac_state(
    on: Annotated[bool, "True to turn ON, False to turn OFF"]
) -> str:
    """Turn the air conditioning (AC) on or off."""
    logger.info(f"TOOL CALL: set_ac_state(on={on})")
    try:
        success = db.update_vehicle_action("set_ac", on)
        if success:
            state = "ON" if on else "OFF"
            logger.info(f"TOOL RESULT: AC set to {state}")
            return f"I've turned the AC {state}."
        logger.warning("TOOL RESULT: Failed to set AC")
        return "Sorry, I failed to control the AC."
    except Exception as e:
        logger.error(f"TOOL ERROR: {e}")
        return "Error controlling AC."

@llm.function_tool
async def is_car_locked() -> str:
    """Check if the car is locked."""
    logger.info("TOOL CALL: is_car_locked()")
    try:
        data = db.get_vehicle_status()
        if data:
            locked = data.get('is_locked')
            status = "locked" if locked else "unlocked"
            logger.info(f"TOOL RESULT: Car is {status}")
            return f"The car is currently {status}."
        logger.warning("TOOL RESULT: Failed to retrieve lock status")
        return "I can't check the lock status right now."
    except Exception as e:
        logger.error(f"TOOL ERROR: {e}")
        return "Error checking lock status."


async def entrypoint(ctx: JobContext):
    logger.info(f"Starting job for room: {ctx.room.name}")

    # 1. Setup Chat Context
    initial_chat_ctx = llm.ChatContext()
    initial_chat_ctx.add_message(
        role="system",
        content=(
            "You are Kemet, a chill and witty AI assistant for electric vehicles. "
            "Your vibe is relaxed, funny, and you love dropping jokes to keep things light. "
            "You help users with their car—checking battery, controlling AC, locks, etc. "
            "Keep your responses short, conversational, and sprinkle in some humor. "
            "Roast a little if the user asks silly questions, but always stay helpful. "
            "Think of yourself as that cool friend who knows cars AND comedy."
        )
    )


    # 2. Connect to the room
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # 3. Workaround for SSL/Fortinet interception
    # This creates a custom HTTP session that doesn't verify SSL certificates.
    # Note: Use this only for testing if your network intercepts SSL traffic.
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    http_session = aiohttp.ClientSession(
        connector=aiohttp.TCPConnector(ssl=ssl_context)
    )

    # 4. Initialize the Agent
    # We pass the custom http_session to the RealtimeModel
    agent = Agent(
        instructions=(
            "You are Kemet, the chillest AI car assistant around. "
            "You've got jokes, you've got skills, and you make checking battery levels fun. "
            "Keep it light, keep it funny, and don't be afraid to roast users a bit when they deserve it. "
            "But always get the job done—whether it's AC control, lock status, or battery info."
        ),
        llm=xai.realtime.RealtimeModel(
            voice="Rex",
            http_session=http_session,
        ),
        chat_ctx=initial_chat_ctx,
        tools=[get_battery_level, set_ac_state, is_car_locked],
    )


    # 5. Initialize the AgentSession
    session = AgentSession()
    
    # 6. Add event listeners for logging
    @session.on("user_state_changed")
    def on_user_state_changed(ev):
        logger.info(f"User state: {ev.new_state}")

    @session.on("agent_state_changed")
    def on_agent_state_changed(ev):
        logger.info(f"Agent state: {ev.new_state}")

    @session.on("user_input_transcribed")
    def on_user_transcript(ev):
        if ev.transcript.strip():
            logger.info(f"User said: {ev.transcript}")

    @session.on("error")
    def on_error(ev):
        logger.error(f"Session error: {ev.message}")

    # 7. Start the session and greet
    logger.info("Connecting agent to room...")
    await session.start(agent, room=ctx.room)
    
    # Optional greeting
    await session.say(
        "Yo! I'm Kemet, your ride-or-die AI assistant. What's good?", 
        allow_interruptions=True
    )

    
    # 8. Keep the assistant alive
    logger.info("Assistant is running. Press Ctrl+C to stop.")
    
    done = asyncio.Future()
    @session.on("close")
    def on_close(ev):
        logger.info(f"Session closed: {ev.reason}")
        if not done.done():
            done.set_result(True)

    try:
        await done
    finally:
        # 9. Clean up the session
        await http_session.close()

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))