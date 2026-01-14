-- Kemet SDV - SQLite Schema Init

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone_number TEXT,
    account_status TEXT DEFAULT 'ACTIVE',
    verified_email BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
    vin TEXT PRIMARY KEY,
    owner_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    brand_name TEXT,
    model_name TEXT,
    battery_level INTEGER DEFAULT 100,
    range_km INTEGER DEFAULT 400,
    os_version TEXT DEFAULT '1.0.0',
    is_locked BOOLEAN DEFAULT 1,
    is_charging BOOLEAN DEFAULT 0,
    climate_state BOOLEAN DEFAULT 0,
    location_name TEXT DEFAULT 'Dakar',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON vehicles(owner_id);

-- 3. FEATURES (Catalog)
CREATE TABLE IF NOT EXISTS features (
    feature_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'FCFA',
    payment_type TEXT, -- 'one-time', 'subscription'
    billing_interval TEXT, -- 'monthly', null
    is_active BOOLEAN DEFAULT 1,
    is_visible BOOLEAN DEFAULT 1,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. SUBSCRIPTIONS (Purchases)
CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    vehicle_vin TEXT REFERENCES vehicles(vin) ON DELETE CASCADE,
    feature_id TEXT REFERENCES features(feature_id),
    status TEXT DEFAULT 'active',
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    auto_renew BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_vehicle ON subscriptions(vehicle_vin);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- 5. FEATURE ACTIVATIONS
CREATE TABLE IF NOT EXISTS feature_activations (
    activation_id TEXT PRIMARY KEY,
    subscription_id INTEGER REFERENCES subscriptions(subscription_id) ON DELETE CASCADE,
    vehicle_vin TEXT REFERENCES vehicles(vin) ON DELETE CASCADE,
    feature_id TEXT REFERENCES features(feature_id),
    activation_status TEXT DEFAULT 'ACTIVE',
    target_status TEXT DEFAULT 'ACTIVE',
    activation_request_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    activation_start_time DATETIME,
    activation_end_time DATETIME,
    requested_by INTEGER REFERENCES users(user_id),
    request_source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activations_vehicle ON feature_activations(vehicle_vin);
CREATE INDEX IF NOT EXISTS idx_activations_subscription ON feature_activations(subscription_id);

-- 6. PAYMENTS (For tracking payment transactions)
CREATE TABLE IF NOT EXISTS payments (
    payment_id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    feature_id TEXT REFERENCES features(feature_id),
    subscription_id INTEGER REFERENCES subscriptions(subscription_id),
    operator TEXT, -- 'ORANGE', 'WAVE', etc.
    phone_number TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'FCFA',
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'FAILED'
    transaction_ref TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 7. ANALYTICS VIEWS
DROP VIEW IF EXISTS revenue_analytics_view;
CREATE VIEW revenue_analytics_view AS
    SELECT f.feature_id, f.name, f.price_amount, 
           COUNT(s.subscription_id) as active_subscriptions, 
           (f.price_amount * COUNT(s.subscription_id)) as total_revenue
    FROM features f
    LEFT JOIN subscriptions s ON f.feature_id = s.feature_id AND s.status = 'active'
    GROUP BY f.feature_id, f.name, f.price_amount;

DROP VIEW IF EXISTS vehicle_status_view;
CREATE VIEW vehicle_status_view AS
    SELECT vin, model_name, 
           CASE WHEN last_seen > datetime('now', '-1 hour') THEN 'connected' ELSE 'offline' END as connectivity_status
    FROM vehicles;

-- 8. SEED DATA
-- Default Admin: admin@kemet.com / admin123
INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, account_status) VALUES 
('admin@kemet.com', '$2b$10$gkQWPsEU8cYWUxdtuyC9PedDwWQEK9gR4c9MQHNxXz496bMD23k6.', 'Admin', 'Kemet', 'ACTIVE');

-- Default Features
INSERT OR IGNORE INTO features (feature_id, name, description, price_amount, payment_type, billing_interval) VALUES 
('premium-connect', 'Connectivité Premium', 'Accès streaming, cartes satellite et navigation en temps réel', 2500, 'subscription', 'monthly'),
('acceleration-boost', 'Acceleration Boost', 'Réduction du 0-100 km/h de 4.4s à 3.9s', 1500000, 'one-time', NULL),
('sentry-mode', 'Mode Sentinelle', 'Sécurité active avec enregistrement vidéo 360°', 5000, 'subscription', 'monthly'),
('cold-weather-pack', 'Pack Hiver', 'Sièges et volant chauffants toutes places', 250000, 'one-time', NULL);

-- 9. FOTA TABLES
CREATE TABLE IF NOT EXISTS fota_campaigns (
    campaign_id TEXT PRIMARY KEY,
    campaign_name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT,
    release_notes TEXT,
    campaign_type TEXT DEFAULT 'SCHEDULED',
    priority INTEGER DEFAULT 3,
    rollout_strategy TEXT DEFAULT 'PHASED',
    scheduled_start DATETIME,
    status TEXT DEFAULT 'available',
    size_mb INTEGER,
    is_critical BOOLEAN DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicle_updates (
    update_id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_vin TEXT REFERENCES vehicles(vin) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES fota_campaigns(campaign_id),
    status TEXT DEFAULT 'available', -- 'available', 'downloading', 'installing', 'completed', 'failed'
    progress INTEGER DEFAULT 0,
    installed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed FOTA
INSERT OR IGNORE INTO fota_campaigns (campaign_id, campaign_name, version, description, release_notes, size_mb, is_critical, status) VALUES 
('v1.1.0-release', 'Version 1.1.0', '1.1.0', 'Mise à jour de performance', 'Amélioration de la gestion batterie et nouvelles icônes.', 450, 0, 'COMPLETED');
