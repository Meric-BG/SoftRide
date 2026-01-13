-- Kemet SDV - Supabase Schema Init
-- Run this in your Supabase SQL Editor to create the necessary tables.

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY, -- or UUID if you prefer
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Stored hashed
    account_status VARCHAR(50) DEFAULT 'ACTIVE',
    verified_email BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id VARCHAR(50) PRIMARY KEY, -- e.g., 'v1' or UUID
    vin VARCHAR(17) UNIQUE NOT NULL,
    owner_id INTEGER REFERENCES users(user_id),
    model_name VARCHAR(100),
    battery_level INTEGER DEFAULT 100,
    range_km INTEGER DEFAULT 400,
    os_version VARCHAR(20),
    is_locked BOOLEAN DEFAULT TRUE,
    is_charging BOOLEAN DEFAULT FALSE,
    climate_state BOOLEAN DEFAULT FALSE,
    location_name VARCHAR(255),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. FEATURES (Catalog)
CREATE TABLE IF NOT EXISTS features (
    feature_id VARCHAR(50) PRIMARY KEY, -- 'f1', 'f2'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'FCFA',
    payment_type VARCHAR(50), -- 'one-time', 'subscription'
    billing_interval VARCHAR(50), -- 'monthly', null
    is_active BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE
);

-- 4. SUBSCRIPTIONS (Purchases)
CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id),
    feature_id VARCHAR(50) REFERENCES features(feature_id),
    status VARCHAR(50) DEFAULT 'active',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT FALSE
);

-- 5. FOTA CAMPAIGNS
CREATE TABLE IF NOT EXISTS fota_campaigns (
    campaign_id SERIAL PRIMARY KEY,
    version VARCHAR(20) NOT NULL,
    release_notes TEXT,
    release_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status VARCHAR(50) DEFAULT 'draft', -- 'deployed', 'legacy'
    target_criteria JSONB, 
    deployed_count INTEGER DEFAULT 0,
    total_target INTEGER DEFAULT 0
);

-- 6. ANALYTICS VIEWS (Optional, for dashboard)
CREATE VIEW revenue_analytics_view AS
    SELECT f.name, f.price_amount, COUNT(s.subscription_id) as active_subscriptions, 
    (f.price_amount * COUNT(s.subscription_id)) as total_revenue
    FROM features f
    LEFT JOIN subscriptions s ON f.feature_id = s.feature_id
    GROUP BY f.feature_id;

CREATE VIEW vehicle_status_view AS
    SELECT vehicle_id, model_name, 
    CASE WHEN last_seen > NOW() - INTERVAL '1 hour' THEN 'connected' ELSE 'offline' END as connectivity_status
    FROM vehicles;

-- SEED DATA (Optional)
INSERT INTO users (email, password_hash, first_name, role) VALUES 
('admin@kemet.com', '$2a$10$rKZhVJQx8qVXqF5xKJ5pAOYvN8vZGqYvN8vZGqYvN8vZGqYvN8vZG', 'Admin', 'admin')
ON CONFLICT (email) DO NOTHING;
