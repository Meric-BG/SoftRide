-- 7. VEHICLE TELEMETRY TABLE (Real-time State)
-- Stores the current state of the vehicle (Battery, GPS, Lock, etc.)
CREATE TABLE IF NOT EXISTS public.vehicles_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    
    -- Battery & Range
    battery_level INTEGER DEFAULT 82, -- Percentage (0-100)
    range_km INTEGER DEFAULT 342, -- Estimated range
    is_charging BOOLEAN DEFAULT FALSE,
    time_remaining_minutes INTEGER DEFAULT 0,
    
    -- Climate
    indoor_temp DECIMAL DEFAULT 22.0, -- Celsius
    outdoor_temp DECIMAL DEFAULT 28.0, -- Celsius
    fan_speed INTEGER DEFAULT 1, -- 0-5
    is_climate_on BOOLEAN DEFAULT FALSE,
    
    -- Security & Access
    is_locked BOOLEAN DEFAULT TRUE,
    is_sentry_mode_on BOOLEAN DEFAULT FALSE,
    bonnet_open BOOLEAN DEFAULT FALSE,
    trunk_open BOOLEAN DEFAULT FALSE,
    
    -- Location
    latitude DECIMAL DEFAULT 14.7447, -- Default: Dakar (Almadies)
    longitude DECIMAL DEFAULT -17.5064,
    location_name TEXT DEFAULT 'Plage des Almadies, Dakar',
    speed_kmh INTEGER DEFAULT 0,
    
    -- Maintenance
    tire_pressure_bar DECIMAL DEFAULT 2.4,
    odometer_km INTEGER DEFAULT 12500,
    
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraint: One telemetry record per vehicle
    CONSTRAINT unique_vehicle_telemetry UNIQUE (vehicle_id)
);

-- ENABLE REALTIME for Telemetry
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles_telemetry;

-- RLS POLICIES
ALTER TABLE public.vehicles_telemetry ENABLE ROW LEVEL SECURITY;

-- Read Access: Owner can read their vehicle's telemetry
CREATE POLICY "Owner read telemetry" ON public.vehicles_telemetry 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.vehicles 
        WHERE id = public.vehicles_telemetry.vehicle_id 
        AND owner_id = auth.uid()
    )
);

-- Update Access: In a real scenario, this would be restricted to the "Vehicle API" service account.
-- For this demo, we verify the user owns the vehicle.
CREATE POLICY "Owner update telemetry" ON public.vehicles_telemetry 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.vehicles 
        WHERE id = public.vehicles_telemetry.vehicle_id 
        AND owner_id = auth.uid()
    )
);

-- SEED TELEMETRY for Existing Vehicles
-- This ensures every vehicle has a telemetry record to start with
INSERT INTO public.vehicles_telemetry (vehicle_id)
SELECT id FROM public.vehicles
ON CONFLICT (vehicle_id) DO NOTHING;
