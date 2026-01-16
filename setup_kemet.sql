-- Add columns for Kemet Assistant control
-- Run this in your Supabase SQL Editor

ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS ac_is_on BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cabin_temperature DECIMAL(4,2) DEFAULT 20.0,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS charging_status VARCHAR(20) DEFAULT 'DISCONNECTED'; -- 'CHARGING', 'FULL', 'DISCONNECTED'

-- Insert a demo vehicle if it doesn't exist
INSERT INTO vehicles (vehicle_id, vin, brand, model, year, platform, battery_level, ac_is_on, is_locked)
VALUES ('demo-vehicle-01', 'KEMETDEMOVIN001', 'Kemet', 'Su7', 2025, 'E-Platform 3.0', 68, FALSE, TRUE)
ON CONFLICT (vehicle_id) DO NOTHING;
