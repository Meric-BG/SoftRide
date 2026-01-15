-- Enable Realtime for vehicle_features
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicle_features;

-- Enable RLS for vehicle_features
ALTER TABLE public.vehicle_features ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can see their own vehicle's features
CREATE POLICY "Users view own vehicle features" ON public.vehicle_features
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.vehicles
    WHERE id = public.vehicle_features.vehicle_id
    AND owner_id = auth.uid()
  )
);

-- Policy: Owners can insert/update features (for self-service activation)
-- In production, this might be restricted to a service role, 
-- but for the demo, we allow the owner to activate features they purchased.
CREATE POLICY "Users manage own vehicle features" ON public.vehicle_features
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.vehicles
    WHERE id = public.vehicle_features.vehicle_id
    AND owner_id = auth.uid()
  )
);
