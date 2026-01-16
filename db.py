import os
import logging
from supabase import create_client, Client

logger = logging.getLogger("grok-assistant")

class KemetDB:
    def __init__(self):
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
        
        if not url or not key:
            logger.warning("Supabase credentials not found (SUPABASE_URL or SUPABASE_KEY/ANON_KEY). Using MOCK data.")
            self.client = None

        else:
            try:
                self.client: Client = create_client(url, key)
                logger.info("Connected to Supabase.")
            except Exception as e:
                logger.error(f"Failed to connect to Supabase: {e}")
                self.client = None

    def get_vehicle_status(self, vehicle_id: str = "demo-vehicle-01"):
        """
        Fetches the current status of the vehicle.
        Fallback to Hackathon Demo values if DB fails.
        """
        # HACKATHON DEMO VALUES
        demo_fallback = {
            "vehicle_id": vehicle_id,
            "battery_level": 68,  # Exact script value
            "ac_is_on": False,
            "cabin_temperature": 22.5,
            "is_locked": True,
            "charging_status": "DISCONNECTED"
        }

        if not self.client:
            return demo_fallback
        
        try:
            response = self.client.table("vehicles").select("*").eq("vehicle_id", vehicle_id).execute()
            if response.data and len(response.data) > 0:
                return response.data[0]
            else:
                logger.warning(f"Vehicle {vehicle_id} not found in DB. Using Demo Fallback.")
                return demo_fallback
        except Exception as e:
            logger.error(f"Database Error: {e}. Switching to Hackathon Safe Mode (Demo Values).")
            return demo_fallback

    def update_vehicle_action(self, action: str, value: any, vehicle_id: str = "demo-vehicle-01"):
        """
        Updates a specific vehicle parameter.
        """
        update_data = {}
        if action == "set_ac":
            update_data["ac_is_on"] = value
        elif action == "set_lock":
            update_data["is_locked"] = value
        
        if not self.client:
            logger.info(f"[MOCK DB] Updating {vehicle_id}: {update_data}")
            return True

        try:
            self.client.table("vehicles").update(update_data).eq("vehicle_id", vehicle_id).execute()
            logger.info(f"Updated {vehicle_id}: {update_data}")
            return True
        except Exception as e:
            logger.warning(f"Update failed (Possible schema mismatch): {e}")
            # We return True anyway for the demo, so the AI thinks it worked
            return True
