-- SUPABASE SCHEMA FOR KEMET ECOSYSTEM (COMPLETE)
-- Shared between Kemet Manager (Admin) and My Kemet (Consumer)

-- 1. VEHICLES TABLE (The "VIM" database)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vim TEXT UNIQUE NOT NULL,
    model TEXT DEFAULT 'Kemet Falcon',
    price_xof DECIMAL DEFAULT 35000000.00, -- Base price for revenue tracking
    is_sold BOOLEAN DEFAULT FALSE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SOFTWARE UPDATES TABLE
CREATE TABLE IF NOT EXISTS public.software_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL DEFAULT 'Système Kemet OS',
    version TEXT NOT NULL,
    release_notes TEXT,
    file_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    release_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. STORE FEATURES TABLE
CREATE TABLE IF NOT EXISTS public.store_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_xof DECIMAL DEFAULT 0.00,
    price_annual_xof DECIMAL DEFAULT 0.00,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    category TEXT DEFAULT 'Performance',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. VEHICLE FEATURES (Purchased/Installed features)
CREATE TABLE IF NOT EXISTS public.vehicle_features (
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES public.store_features(id) ON DELETE CASCADE,
    installed_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ, -- NULL for one-time purchases
    PRIMARY KEY (vehicle_id, feature_id)
);

-- 5. TRANSACTIONS TABLE (For Dashboard Financials)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL, -- 'VEHICLE_PURCHASE' or 'FEATURE_ACTIVATION'
    amount_xof DECIMAL NOT NULL,
    item_id UUID, -- References vehicles(id) or store_features(id)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PROFILE EXTENSION
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    vim_linked TEXT REFERENCES public.vehicles(vim),
    role TEXT DEFAULT 'USER', -- 'USER' or 'ADMIN'
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- AUTOMATIC PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.software_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_features;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- SEED DATA: Generate 10 Unique VIMs
INSERT INTO public.vehicles (vim, model, price_xof) VALUES
('KMT-FALCON-001-XYZ', 'Kemet Falcon S', 35000000),
('KMT-FALCON-002-ABC', 'Kemet Falcon S', 35000000),
('KMT-FALCON-003-DEF', 'Kemet Falcon S', 38000000),
('KMT-FALCON-004-GHI', 'Kemet Falcon S', 38000000),
('KMT-FALCON-005-JKL', 'Kemet Falcon Performance', 45000000),
('KMT-FALCON-006-MNO', 'Kemet Falcon Performance', 45000000),
('KMT-FALCON-007-PQR', 'Kemet Falcon Ultra', 55000000),
('KMT-FALCON-008-STU', 'Kemet Falcon Ultra', 55000000),
('KMT-FALCON-009-VWX', 'Kemet Falcon X', 75000000),
('KMT-FALCON-010-YZ0', 'Kemet Falcon X', 75000000)
ON CONFLICT (vim) DO NOTHING;

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.software_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Software Updates & Features: Public read for active/published
CREATE POLICY "Public read published updates" ON public.software_updates FOR SELECT USING (is_published = true);
CREATE POLICY "Public read active features" ON public.store_features FOR SELECT USING (is_active = true);

-- Vehicles: Users read own vehicle, Admins read all
CREATE POLICY "Users read own vehicle" ON public.vehicles FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Admins read all vehicles" ON public.vehicles FOR ALL 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'ADMIN' );
