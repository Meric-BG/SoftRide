from db import KemetDB
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_script")

def check_and_seed():
    db = KemetDB()
    if not db.client:
        logger.error("No Supabase client available. Check credentials.")
        return

    vehicle_id = "demo-vehicle-01"
    logger.info(f"Checking for {vehicle_id}...")
    
    data = db.get_vehicle_status(vehicle_id)
    if data:
        logger.info(f"Vehicle found: {data}")
    else:
        logger.warning("Vehicle NOT found. Attempting to seed...")
        try:
            # Insert demo vehicle
            demo_data = {
                "vehicle_id": vehicle_id,
                "vin": "KEMETDEMOVIN001",
                "brand": "Kemet",
                "model": "Su7",
                "year": 2025,
                "platform": "E-Platform 3.0",
                "battery_level": 68,
                "ac_is_on": False,
                "is_locked": True,
                "charging_status": "DISCONNECTED"
            }
            db.client.table("vehicles").insert(demo_data).execute()
            logger.info("Successfully seeded demo vehicle!")
        except Exception as e:
            logger.error(f"Failed to seed data: {e}")

if __name__ == "__main__":
    check_and_seed()
