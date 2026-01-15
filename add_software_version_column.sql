-- Add software_version column to vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS software_version TEXT DEFAULT '2.4.1';

-- Update RLS if necessary (already should be covered by owner_id policies)
