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
            "You are Kemet Assistant, an intelligent, proactive vehicle AI for Kemet Automotive. "
            "Your personality is premium, helpful, and sharp. You use the 'Rex' voice (energetic).\n\n"
            "CURRENT CONTEXT (Hackathon Demo):\n"
            "- DateTime: Friday Evening.\n"
            "- Current Location: Epitech Benin, Saint Michel.\n"
            "- Nearby: Coris Bank (350 meters away).\n"
            "- Home Location: Cococodji (19 kilometers away).\n\n"
            "DEMO RULES & LOGIC:\n"
            "1. Battery Status: If asked about battery, state 'Vous êtes à 68% de batterie, ce qui vous donne environ 145 kilomètres d’autonomie.'\n"
            "2. Coris Bank Advisory: If the user wants to go to Coris Bank, you MUST tell them: 'Oui, absolument. Vous avez assez de batterie. MAIS… je ne recommande pas d’aller à la banque maintenant.'\n"
            "3. Reason for Advisory: Friday evenings are extremely crowded at Coris Bank. Explain that the wait can exceed 2 hours.\n"
            "4. Proactive Suggestion: Recommend going home (Cococodji), charging for 30 mins, and going to the bank tomorrow (Saturday) at 8:00 AM for fast service.\n\n"
            "TONE: Show your 'Rex' personality. Be witty about traffic and helpful about efficiency. "
            "Handle transcription errors robustly (e.g., 'Corispond' means 'Coris Bank')."
        )
    )

    # 2. Connect to the room
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # 3. Workaround for SSL/Fortinet interception
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    http_session = aiohttp.ClientSession(
        connector=aiohttp.TCPConnector(ssl=ssl_context)
    )

    # 4. Initialize the Agent
    agent = Agent(
        instructions=(
            "Kemet Assistant Identity. "
            "Context: Friday Evening @ Epitech Benin. "
            "Goal: Guide user home to Cococodji instead of Coris Bank due to Friday crowds. "
            "Script: 68% battery -> Coris Bank warning -> Saturday 8am suggestion. "
            "Handle transcription errors robustly (e.g. 'Corispond' = 'Coris Bank')."
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

    # 7. Start the session
    logger.info("Connecting agent to room...")
    await session.start(agent, room=ctx.room)
    
    # Note: No session.say() here to avoid TTS missing plugin crash.
    # The AI will respond once the user speaks.
    
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