-- ============================================
-- ARCHITECTURE BASE DE DONNÉES SDV - KEMET AUTOMOTIVE
-- Système de Gestion FOTA et Features On-Demand
-- ============================================

-- ============================================
-- 1. TABLES DE CONFIGURATION SYSTÈME
-- ============================================

-- Table des véhicules
CREATE TABLE vehicles (
    vehicle_id VARCHAR(50) PRIMARY KEY,
    vin VARCHAR(17) UNIQUE NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    production_date DATE,
    delivery_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Informations de connectivité
    last_connected TIMESTAMP,
    connectivity_status VARCHAR(20) DEFAULT 'disconnected',
    sim_iccid VARCHAR(20),
    modem_firmware_version VARCHAR(30),
    
    -- Métriques d'utilisation
    total_mileage DECIMAL(10,2) DEFAULT 0,
    battery_level INTEGER,
    last_location POINT,
    
    -- Configurations spécifiques
    hardware_version VARCHAR(30),
    software_base_version VARCHAR(30)
);

-- Table des domaines ECU
CREATE TABLE ecu_domains (
    domain_id SERIAL PRIMARY KEY,
    domain_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    critical_level INTEGER DEFAULT 1, -- 1=critique, 5=non-critique
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO ecu_domains (domain_name, description, critical_level) VALUES
    ('ADAS', 'Advanced Driver Assistance Systems', 1),
    ('COCKPIT', 'Cockpit Domain Controller', 2),
    ('POWERTRAIN', 'Powertrain Control', 1),
    ('CHASSIS', 'Chassis and Safety Systems', 1),
    ('MULTIMEDIA', 'Infotainment and Multimedia', 3),
    ('CONNECTED_SERVICES', 'Connected Services Gateway', 2),
    ('BODY', 'Body Control Module', 3),
    ('TELEMATICS', 'Telematics Control Unit', 2);

-- Table des ECUs
CREATE TABLE ecus (
    ecu_id VARCHAR(100) PRIMARY KEY,
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    domain_id INTEGER REFERENCES ecu_domains(domain_id),
    ecu_name VARCHAR(100) NOT NULL,
    ecu_type VARCHAR(50) NOT NULL,
    hardware_part_number VARCHAR(50),
    hardware_version VARCHAR(30),
    current_firmware_version VARCHAR(30),
    target_firmware_version VARCHAR(30),
    firmware_status VARCHAR(20) DEFAULT 'UP_TO_DATE',
    
    -- Capacités
    storage_capacity_mb INTEGER,
    available_storage_mb INTEGER,
    memory_mb INTEGER,
    processing_power VARCHAR(50),
    
    -- Statut
    health_status VARCHAR(20) DEFAULT 'HEALTHY',
    last_heartbeat TIMESTAMP,
    boot_count INTEGER DEFAULT 0,
    
    -- Configuration réseau
    ip_address INET,
    mac_address MACADDR,
    bus_type VARCHAR(20), -- CAN, LIN, Ethernet, etc.
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. GESTION DES FIRMWARES ET MISES À JOUR
-- ============================================

-- Table des paquets de firmware
CREATE TABLE firmware_packages (
    package_id VARCHAR(50) PRIMARY KEY,
    ecu_type VARCHAR(50) NOT NULL,
    target_version VARCHAR(30) NOT NULL,
    from_version VARCHAR(30),
    
    -- Informations du paquet
    package_name VARCHAR(100) NOT NULL,
    description TEXT,
    package_size_mb DECIMAL(10,2) NOT NULL,
    checksum_sha256 VARCHAR(64) NOT NULL,
    download_url TEXT NOT NULL,
    
    -- Métadonnées techniques
    min_hardware_version VARCHAR(30),
    dependencies JSONB, -- Liste des packages requis
    installation_instructions JSONB,
    rollback_possible BOOLEAN DEFAULT TRUE,
    estimated_install_time_seconds INTEGER,
    
    -- Validation
    is_validated BOOLEAN DEFAULT FALSE,
    validated_by VARCHAR(100),
    validation_date TIMESTAMP,
    
    -- Sécurité
    signature TEXT,
    certificate_id VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    release_date DATE NOT NULL
);

-- Table des campagnes FOTA
CREATE TABLE fota_campaigns (
    campaign_id VARCHAR(50) PRIMARY KEY,
    campaign_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Configuration de la campagne
    campaign_type VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, EMERGENCY, RECALL
    priority INTEGER DEFAULT 3, -- 1=Urgent, 5=Normal
    rollout_strategy VARCHAR(20) DEFAULT 'PHASED', -- PHASED, ALL_AT_ONCE
    
    -- Planning
    scheduled_start TIMESTAMP,
    scheduled_end TIMESTAMP,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    
    -- Ciblage
    target_vehicles JSONB, -- Liste des VINs ou critères
    target_ecu_types JSONB,
    min_battery_required INTEGER DEFAULT 30,
    require_parking BOOLEAN DEFAULT TRUE,
    require_wifi BOOLEAN DEFAULT FALSE,
    
    -- Contrôle
    max_parallel_installations INTEGER DEFAULT 100,
    pause_on_failure_rate DECIMAL(5,2) DEFAULT 10.0,
    
    -- Statut
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des tâches de mise à jour
CREATE TABLE update_tasks (
    task_id VARCHAR(50) PRIMARY KEY,
    campaign_id VARCHAR(50) REFERENCES fota_campaigns(campaign_id),
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id),
    ecu_id VARCHAR(100) REFERENCES ecus(ecu_id),
    package_id VARCHAR(50) REFERENCES firmware_packages(package_id),
    
    -- Séquence et dépendances
    execution_order INTEGER,
    depends_on JSONB, -- Liste des task_ids
    can_parallelize BOOLEAN DEFAULT FALSE,
    
    -- État d'exécution
    status VARCHAR(20) DEFAULT 'PENDING',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Timing
    scheduled_time TIMESTAMP,
    download_start_time TIMESTAMP,
    download_end_time TIMESTAMP,
    install_start_time TIMESTAMP,
    install_end_time TIMESTAMP,
    verification_start_time TIMESTAMP,
    verification_end_time TIMESTAMP,
    
    -- Métriques
    download_size_bytes BIGINT,
    download_speed_kbps DECIMAL(10,2),
    install_duration_seconds INTEGER,
    
    -- Résultat
    result_code VARCHAR(50),
    error_message TEXT,
    rollback_attempted BOOLEAN DEFAULT FALSE,
    rollback_successful BOOLEAN,
    
    -- Journalisation
    logs TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des verrous de mise à jour
CREATE TABLE update_locks (
    lock_id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id),
    ecu_id VARCHAR(100) REFERENCES ecus(ecu_id),
    task_id VARCHAR(50) REFERENCES update_tasks(task_id),
    lock_type VARCHAR(20) NOT NULL, -- DOWNLOAD, INSTALL, VERIFY
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    released_at TIMESTAMP
);

-- ============================================
-- 3. GESTION DES FEATURES ON-DEMAND
-- ============================================

-- Table des catégories de features
CREATE TABLE feature_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO feature_categories (category_name, description, display_order) VALUES
    ('PERFORMANCE', 'Améliorations des performances', 1),
    ('SAFETY', 'Fonctions de sécurité avancées', 2),
    ('COMFORT', 'Confort et commodités', 3),
    ('ENTERTAINMENT', 'Divertissement et multimédia', 4),
    ('CONNECTIVITY', 'Services connectés', 5),
    ('UTILITY', 'Utilitaires pratiques', 6);

-- Table des features
CREATE TABLE features (
    feature_id VARCHAR(50) PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    category_id INTEGER REFERENCES feature_categories(category_id),
    
    -- Configuration technique
    required_ecus JSONB NOT NULL, -- Liste des ECU types requis
    required_firmware_versions JSONB, -- Versions minimales requises
    installation_script TEXT,
    uninstallation_script TEXT,
    validation_script TEXT,
    
    -- Configuration commerciale
    pricing_model VARCHAR(20) DEFAULT 'ONE_TIME', -- ONE_TIME, SUBSCRIPTION, USAGE_BASED
    base_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Abonnement
    subscription_duration_days INTEGER, -- Pour les modèles par abonnement
    trial_period_days INTEGER DEFAULT 0,
    
    -- Métadonnées
    icon_url TEXT,
    preview_images JSONB,
    video_url TEXT,
    documentation_url TEXT,
    
    -- Gestion de cycle de vie
    is_active BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE,
    release_date DATE,
    end_of_sale_date DATE,
    end_of_support_date DATE,
    
    -- Statistiques
    total_purchases INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des dépendances entre features
CREATE TABLE feature_dependencies (
    dependency_id SERIAL PRIMARY KEY,
    parent_feature_id VARCHAR(50) REFERENCES features(feature_id),
    child_feature_id VARCHAR(50) REFERENCES features(feature_id),
    dependency_type VARCHAR(20) DEFAULT 'REQUIRES', -- REQUIRES, RECOMMENDS, CONFLICTS
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(parent_feature_id, child_feature_id),
    CHECK (parent_feature_id != child_feature_id)
);

-- Table des bundles de features
CREATE TABLE feature_bundles (
    bundle_id VARCHAR(50) PRIMARY KEY,
    bundle_name VARCHAR(100) NOT NULL,
    description TEXT,
    features_list JSONB NOT NULL, -- Liste des feature_ids
    bundle_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. GESTION DES UTILISATEURS ET ABONNEMENTS
-- ============================================

-- Table des utilisateurs
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    language_preference VARCHAR(10) DEFAULT 'fr',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    
    -- Authentification
    password_hash VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    
    -- Compte
    account_status VARCHAR(20) DEFAULT 'ACTIVE',
    registration_date DATE DEFAULT CURRENT_DATE,
    verified_email BOOLEAN DEFAULT FALSE,
    verified_phone BOOLEAN DEFAULT FALSE,
    
    -- Données de facturation
    billing_address JSONB,
    payment_methods JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison utilisateur-véhicule
CREATE TABLE user_vehicles (
    user_vehicle_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id),
    relationship_type VARCHAR(20) DEFAULT 'OWNER', -- OWNER, DRIVER, FAMILY, FLEET
    is_primary BOOLEAN DEFAULT FALSE,
    access_permissions JSONB DEFAULT '{"remote_control": true, "purchase_features": true}',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, vehicle_id)
);

-- Table des transactions
CREATE TABLE transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id),
    
    -- Détails de la transaction
    transaction_type VARCHAR(20) NOT NULL, -- PURCHASE, SUBSCRIPTION, RENEWAL, UPGRADE, REFUND
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    tax_amount DECIMAL(10,2),
    
    -- Paiement
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    payment_gateway_transaction_id VARCHAR(100),
    payment_gateway_response JSONB,
    
    -- Articles
    items JSONB NOT NULL, -- Liste des features/bundles achetés
    discount_code VARCHAR(50),
    discount_amount DECIMAL(10,2),
    
    -- Facturation
    invoice_number VARCHAR(50),
    invoice_url TEXT,
    
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Table des abonnements
CREATE TABLE subscriptions (
    subscription_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id),
    feature_id VARCHAR(50) REFERENCES features(feature_id),
    
    -- Détails de l'abonnement
    subscription_plan VARCHAR(50), -- MONTHLY, ANNUAL, LIFETIME
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    renewal_period_days INTEGER,
    
    -- Statut
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, CANCELLED, SUSPENDED
    cancellation_date DATE,
    cancellation_reason TEXT,
    
    -- Paiement
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    last_payment_date DATE,
    next_payment_date DATE,
    
    -- Métadonnées
    transaction_id VARCHAR(50) REFERENCES transactions(transaction_id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des activations de features
CREATE TABLE feature_activations (
    activation_id VARCHAR(50) PRIMARY KEY,
    subscription_id VARCHAR(50) REFERENCES subscriptions(subscription_id),
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id),
    feature_id VARCHAR(50) REFERENCES features(feature_id),
    
    -- État d'activation
    activation_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACTIVATING, ACTIVE, DEACTIVATING, INACTIVE, FAILED
    target_status VARCHAR(20), -- ACTIVE ou INACTIVE
    
    -- Processus d'activation
    activation_request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activation_start_time TIMESTAMP,
    activation_end_time TIMESTAMP,
    activation_duration_seconds INTEGER,
    
    -- Processus de désactivation
    deactivation_request_time TIMESTAMP,
    deactivation_start_time TIMESTAMP,
    deactivation_end_time TIMESTAMP,
    deactivation_duration_seconds INTEGER,
    
    -- Configuration
    activation_parameters JSONB, -- Paramètres spécifiques pour l'activation
    activation_result JSONB, -- Résultat de l'activation (logs, codes erreur, etc.)
    
    -- Sécurité
    activation_token VARCHAR(100),
    token_expiry TIMESTAMP,
    
    -- Gestion des erreurs
    error_code VARCHAR(50),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Contexte
    requested_by VARCHAR(100), -- user_id ou système
    request_source VARCHAR(50), -- MOBILE_APP, WEB_PORTAL, AUTOMATIC
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. ALGORITHME DE DÉSACTIVATION INTELLIGENTE
-- ============================================

-- Table des conditions de désactivation
CREATE TABLE deactivation_conditions (
    condition_id SERIAL PRIMARY KEY,
    feature_id VARCHAR(50) REFERENCES features(feature_id),
    condition_type VARCHAR(50) NOT NULL, -- VEHICLE_STATE, TIME, LOCATION, etc.
    condition_parameters JSONB NOT NULL,
    priority INTEGER DEFAULT 1,
    is_mandatory BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des tentatives de désactivation
CREATE TABLE deactivation_attempts (
    attempt_id VARCHAR(50) PRIMARY KEY,
    activation_id VARCHAR(50) REFERENCES feature_activations(activation_id),
    feature_id VARCHAR(50) REFERENCES features(feature_id),
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id),
    
    -- Contexte
    reason VARCHAR(50) NOT NULL, -- SUBSCRIPTION_EXPIRED, MANUAL_DEACTIVATION, SAFETY_EVENT
    triggered_by VARCHAR(100),
    
    -- État du véhicule au moment de la tentative
    vehicle_state JSONB, -- vitesse, état moteur, localisation, etc.
    
    -- Planification
    scheduled_time TIMESTAMP,
    earliest_allowed TIMESTAMP,
    latest_allowed TIMESTAMP,
    
    -- Exécution
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    attempt_time TIMESTAMP,
    completion_time TIMESTAMP,
    
    -- Résultat
    success BOOLEAN,
    failure_reason TEXT,
    next_attempt_time TIMESTAMP,
    
    -- Notification
    user_notified BOOLEAN DEFAULT FALSE,
    notification_time TIMESTAMP,
    user_response VARCHAR(20), -- POSTPONE, CONFIRM, CANCEL
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal des événements de sécurité
CREATE TABLE safety_events (
    event_id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id),
    event_type VARCHAR(50) NOT NULL,
    event_severity VARCHAR(20) DEFAULT 'INFO', -- INFO, WARNING, CRITICAL
    event_data JSONB NOT NULL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    
    -- Actions prises
    automatic_actions_taken JSONB,
    manual_intervention_required BOOLEAN DEFAULT FALSE,
    intervention_taken_by VARCHAR(100),
    intervention_notes TEXT
);

-- ============================================
-- 6. SYSTÈME DE RECOMMANDATION IA
-- ============================================

-- Table des profils d'utilisateurs pour IA
CREATE TABLE user_profiles_ai (
    profile_id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    
    -- Données de comportement
    driving_style JSONB, -- agressif, économique, etc.
    usage_patterns JSONB, -- trajets habituels, horaires, etc.
    feature_usage_stats JSONB,
    
    -- Préférences inférées
    inferred_preferences JSONB,
    recommended_categories JSONB,
    
    -- Métadonnées IA
    model_version VARCHAR(50),
    last_training_date DATE,
    confidence_scores JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Table des recommandations
CREATE TABLE feature_recommendations (
    recommendation_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id),
    feature_id VARCHAR(50) REFERENCES features(feature_id),
    
    -- Source de la recommandation
    recommendation_source VARCHAR(50) DEFAULT 'AI_ENGINE', -- AI_ENGINE, POPULAR, BUNDLE, MANUAL
    recommendation_reason TEXT,
    
    -- Scores et priorités
    relevance_score DECIMAL(5,4),
    priority_score DECIMAL(5,4),
    confidence_level DECIMAL(5,4),
    
    -- État
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, VIEWED, DISMISSED, PURCHASED
    viewed_at TIMESTAMP,
    dismissed_at TIMESTAMP,
    dismissed_reason TEXT,
    
    -- Traçabilité
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- ============================================
-- 7. INTERFACES UTILISATEURS ET JOURNALISATION
-- ============================================

-- Table des notifications
CREATE TABLE notifications (
    notification_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id),
    
    -- Contenu
    notification_type VARCHAR(50) NOT NULL, -- FOTA_UPDATE, FEATURE_EXPIRY, SAFETY_ALERT, PROMOTION
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Données supplémentaires
    
    -- Livraison
    channels JSONB DEFAULT '["PUSH"]', -- PUSH, EMAIL, SMS, IN_APP
    priority VARCHAR(20) DEFAULT 'NORMAL',
    
    -- État
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SENT, DELIVERED, READ, FAILED
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    
    -- Actions
    action_url TEXT,
    action_label VARCHAR(100),
    
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des sessions utilisateur
CREATE TABLE user_sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id),
    device_type VARCHAR(50), -- MOBILE, WEB, IN_VEHICLE
    device_info JSONB,
    ip_address INET,
    
    -- Session
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Token JWT ou similaire
    auth_token VARCHAR(500),
    token_expiry TIMESTAMP
);

-- Table d'audit
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(50),
    user_role VARCHAR(50),
    
    -- Action
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    
    -- Détails
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    
    -- Contexte
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Application
    module VARCHAR(50), -- ADMIN_PORTAL, MOBILE_APP, VEHICLE
    severity VARCHAR(20) DEFAULT 'INFO'
);

-- ============================================
-- 8. PORTAL ADMIN KEMET AUTOMOTIVE
-- ============================================

-- Table des administrateurs
CREATE TABLE admin_users (
    admin_id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(200),
    
    -- Rôles et permissions
    role VARCHAR(50) DEFAULT 'OPERATOR',
    permissions JSONB DEFAULT '[]',
    
    -- Authentification
    password_hash VARCHAR(255),
    mfa_enabled BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    
    -- Statut
    is_active BOOLEAN DEFAULT TRUE,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des campagnes marketing
CREATE TABLE marketing_campaigns (
    campaign_id VARCHAR(50) PRIMARY KEY,
    campaign_name VARCHAR(100) NOT NULL,
    campaign_type VARCHAR(50), -- PROMOTION, NEW_FEATURE, SEASONAL
    
    -- Ciblage
    target_audience JSONB,
    target_vehicles JSONB,
    target_features JSONB,
    
    -- Contenu
    title VARCHAR(200),
    message TEXT,
    media_urls JSONB,
    
    -- Planning
    start_date DATE,
    end_date DATE,
    send_time TIME,
    
    -- Métriques
    status VARCHAR(20) DEFAULT 'DRAFT',
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    
    created_by VARCHAR(50) REFERENCES admin_users(admin_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des analytics
CREATE TABLE analytics_dashboards (
    dashboard_id SERIAL PRIMARY KEY,
    dashboard_name VARCHAR(100) NOT NULL,
    dashboard_type VARCHAR(50), -- FOTA, FEATURES, REVENUE, USAGE
    config JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(50) REFERENCES admin_users(admin_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. VUES ET INDEX OPTIMISÉS
-- ============================================

-- Vue des véhicules avec statut
CREATE VIEW vehicle_status_view AS
SELECT 
    v.vehicle_id,
    v.vin,
    v.brand,
    v.model,
    v.connectivity_status,
    v.last_connected,
    COUNT(DISTINCT e.ecu_id) as ecu_count,
    COUNT(DISTINCT CASE WHEN e.firmware_status != 'UP_TO_DATE' THEN e.ecu_id END) as pending_updates,
    COUNT(DISTINCT fa.feature_id) as active_features
FROM vehicles v
LEFT JOIN ecus e ON v.vehicle_id = e.vehicle_id
LEFT JOIN feature_activations fa ON v.vehicle_id = fa.vehicle_id 
    AND fa.activation_status = 'ACTIVE'
GROUP BY v.vehicle_id, v.vin, v.brand, v.model, v.connectivity_status, v.last_connected;

-- Vue des mises à jour en cours
CREATE VIEW active_updates_view AS
SELECT 
    c.campaign_id,
    c.campaign_name,
    c.status as campaign_status,
    COUNT(DISTINCT t.vehicle_id) as vehicles_targeted,
    COUNT(DISTINCT CASE WHEN t.status = 'COMPLETED' THEN t.task_id END) as tasks_completed,
    COUNT(DISTINCT CASE WHEN t.status = 'FAILED' THEN t.task_id END) as tasks_failed,
    COUNT(DISTINCT CASE WHEN t.status IN ('PENDING', 'IN_PROGRESS') THEN t.task_id END) as tasks_pending
FROM fota_campaigns c
LEFT JOIN update_tasks t ON c.campaign_id = t.campaign_id
WHERE c.status IN ('IN_PROGRESS', 'SCHEDULED')
GROUP BY c.campaign_id, c.campaign_name, c.status;

-- Vue des revenus par feature
CREATE VIEW revenue_analytics_view AS
SELECT 
    f.feature_id,
    f.feature_name,
    f.category_id,
    fc.category_name,
    COUNT(DISTINCT s.subscription_id) as total_subscriptions,
    COUNT(DISTINCT CASE WHEN s.status = 'ACTIVE' THEN s.subscription_id END) as active_subscriptions,
    SUM(CASE WHEN t.transaction_type IN ('PURCHASE', 'SUBSCRIPTION', 'RENEWAL') THEN t.amount ELSE 0 END) as total_revenue,
    AVG(CASE WHEN s.status = 'ACTIVE' THEN s.price END) as average_price
FROM features f
LEFT JOIN feature_categories fc ON f.category_id = fc.category_id
LEFT JOIN subscriptions s ON f.feature_id = s.feature_id
LEFT JOIN transactions t ON s.transaction_id = t.transaction_id
GROUP BY f.feature_id, f.feature_name, f.category_id, fc.category_name;

-- Index optimisés pour les requêtes fréquentes
CREATE INDEX idx_vehicle_connectivity ON vehicles(connectivity_status, last_connected);
CREATE INDEX idx_ecu_firmware_status ON ecus(firmware_status, vehicle_id);
CREATE INDEX idx_subscriptions_dates ON subscriptions(status, end_date, start_date);
CREATE INDEX idx_feature_activation_status ON feature_activations(vehicle_id, activation_status, updated_at);
CREATE INDEX idx_update_task_status ON update_tasks(status, vehicle_id, scheduled_time);
CREATE INDEX idx_notifications_delivery ON notifications(user_id, status, created_at);

-- Indexes migrés depuis les définitions de tables
CREATE INDEX idx_vehicle_ecus ON ecus (vehicle_id);
CREATE INDEX idx_domain_ecus ON ecus (domain_id);
CREATE INDEX idx_campaign_status ON fota_campaigns (status);
CREATE INDEX idx_campaign_dates ON fota_campaigns (scheduled_start, scheduled_end);
CREATE INDEX idx_task_status ON update_tasks (status);
CREATE INDEX idx_vehicle_tasks ON update_tasks (vehicle_id);
CREATE INDEX idx_campaign_tasks ON update_tasks (campaign_id);
CREATE INDEX idx_vehicle_locks ON update_locks (vehicle_id);
CREATE INDEX idx_active_locks ON update_locks (released_at) WHERE released_at IS NULL;
CREATE INDEX idx_feature_category ON features (category_id);
CREATE INDEX idx_feature_active ON features (is_active, is_visible);
CREATE INDEX idx_user_vehicles ON user_vehicles (user_id);
CREATE INDEX idx_vehicle_users ON user_vehicles (vehicle_id);
CREATE INDEX idx_user_transactions ON transactions (user_id);
CREATE INDEX idx_transaction_date ON transactions (transaction_date);
CREATE INDEX idx_active_subscriptions ON subscriptions (status, end_date);
CREATE INDEX idx_user_subscriptions ON subscriptions (user_id);
CREATE INDEX idx_vehicle_subscriptions ON subscriptions (vehicle_id);
CREATE INDEX idx_active_features ON feature_activations (vehicle_id, activation_status);
CREATE INDEX idx_pending_activations ON feature_activations (activation_status) WHERE activation_status IN ('PENDING', 'ACTIVATING', 'DEACTIVATING');
CREATE INDEX idx_pending_deactivations ON deactivation_attempts (status) WHERE status IN ('SCHEDULED', 'RETRY');
CREATE INDEX idx_vehicle_deactivations ON deactivation_attempts (vehicle_id, scheduled_time);
CREATE INDEX idx_vehicle_events ON safety_events (vehicle_id, detected_at);
CREATE INDEX idx_unresolved_events ON safety_events (resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_user_recommendations ON feature_recommendations (user_id, status);
CREATE INDEX idx_active_recommendations ON feature_recommendations (expires_at);
CREATE INDEX idx_user_notifications ON notifications (user_id, status);
CREATE INDEX idx_pending_notifications ON notifications (status) WHERE status = 'PENDING';
CREATE INDEX idx_active_sessions ON user_sessions (is_active, last_activity);
CREATE INDEX idx_user_sessions ON user_sessions (user_id, login_time);
CREATE INDEX idx_audit_timestamp ON audit_logs (timestamp);
CREATE INDEX idx_audit_user ON audit_logs (user_id, timestamp);
CREATE INDEX idx_audit_entity ON audit_logs (entity_type, entity_id);

-- ============================================
-- 10. FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction pour mettre à jour le timestamp de modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour les timestamps
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ecus_updated_at BEFORE UPDATE ON ecus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fota_campaigns_updated_at BEFORE UPDATE ON fota_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour vérifier la disponibilité d'une feature pour un véhicule
CREATE OR REPLACE FUNCTION check_feature_availability(
    p_vehicle_id VARCHAR(50),
    p_feature_id VARCHAR(50)
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_vehicle vehicles%ROWTYPE;
    v_feature features%ROWTYPE;
    v_ecu_count INTEGER;
BEGIN
    -- Récupérer les informations du véhicule et de la feature
    SELECT * INTO v_vehicle FROM vehicles WHERE vehicle_id = p_vehicle_id;
    SELECT * INTO v_feature FROM features WHERE feature_id = p_feature_id;
    
    IF v_vehicle.vehicle_id IS NULL THEN
        RETURN jsonb_build_object(
            'available', false,
            'reason', 'VEHICLE_NOT_FOUND'
        );
    END IF;
    
    IF v_feature.feature_id IS NULL THEN
        RETURN jsonb_build_object(
            'available', false,
            'reason', 'FEATURE_NOT_FOUND'
        );
    END IF;
    
    -- Vérifier les ECUs requis
    SELECT COUNT(*) INTO v_ecu_count
    FROM ecus e
    WHERE e.vehicle_id = p_vehicle_id
    AND e.ecu_type = ANY(SELECT jsonb_array_elements_text(v_feature.required_ecus));
    
    IF v_ecu_count < jsonb_array_length(v_feature.required_ecus) THEN
        RETURN jsonb_build_object(
            'available', false,
            'reason', 'MISSING_REQUIRED_ECUS',
            'missing_ecus', v_feature.required_ecus
        );
    END IF;
    
    -- Vérifier les dépendances entre features
    -- (à implémenter selon les besoins spécifiques)
    
    RETURN jsonb_build_object(
        'available', true,
        'vehicle_compatible', true,
        'feature_details', jsonb_build_object(
            'feature_id', v_feature.feature_id,
            'feature_name', v_feature.feature_name,
            'price', v_feature.base_price,
            'currency', v_feature.currency
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Procédure pour planifier une désactivation intelligente
CREATE OR REPLACE FUNCTION schedule_intelligent_deactivation(
    p_activation_id VARCHAR(50),
    p_reason VARCHAR(50)
)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_attempt_id VARCHAR(50);
    v_vehicle_id VARCHAR(50);
    v_feature_id VARCHAR(50);
    v_scheduled_time TIMESTAMP;
BEGIN
    -- Générer un ID unique pour la tentative
    v_attempt_id := 'DEACT_' || extract(epoch from now()) || '_' || floor(random() * 10000)::text;
    
    -- Récupérer les informations de l'activation
    SELECT vehicle_id, feature_id INTO v_vehicle_id, v_feature_id
    FROM feature_activations
    WHERE activation_id = p_activation_id;
    
    -- Déterminer le moment optimal pour la désactivation
    -- (basé sur les habitudes de conduite, état du véhicule, etc.)
    -- Pour simplifier, on planifie dans 2 heures
    v_scheduled_time := CURRENT_TIMESTAMP + INTERVAL '2 hours';
    
    -- Insérer la tentative de désactivation
    INSERT INTO deactivation_attempts (
        attempt_id,
        activation_id,
        feature_id,
        vehicle_id,
        reason,
        scheduled_time,
        status,
        triggered_by
    ) VALUES (
        v_attempt_id,
        p_activation_id,
        v_feature_id,
        v_vehicle_id,
        p_reason,
        v_scheduled_time,
        'SCHEDULED',
        'SYSTEM'
    );
    
    -- Programmer une notification pour l'utilisateur
    INSERT INTO notifications (
        notification_id,
        user_id,
        vehicle_id,
        notification_type,
        title,
        message,
        channels,
        priority
    )
    SELECT 
        'NOTIF_' || extract(epoch from now()) || '_' || floor(random() * 10000)::text,
        uv.user_id,
        v_vehicle_id,
        'FEATURE_EXPIRY',
        'Désactivation programmée',
        'Votre fonctionnalité va être désactivée dans 2 heures. Le véhicule doit être à l''arrêt.',
        '["PUSH", "IN_APP"]',
        'HIGH'
    FROM user_vehicles uv
    WHERE uv.vehicle_id = v_vehicle_id
    AND uv.is_primary = true
    LIMIT 1;
    
    RETURN v_attempt_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. DONNÉES DE TEST
-- ============================================

-- Insertion de données de démonstration
INSERT INTO vehicles (vehicle_id, vin, brand, model, year, platform) VALUES
    ('VH001', '1HGBH41JXMN109186', 'KEMET', 'NEO_SDV', 2024, 'SDV_PLATFORM_2024'),
    ('VH002', '2HGBH41JXMN109187', 'KEMET', 'NEO_SDV', 2024, 'SDV_PLATFORM_2024'),
    ('VH003', '3HGBH41JXMN109188', 'KEMET', 'IONIQ_SDV', 2025, 'SDV_PLATFORM_2025');

-- Insertion d'ECUs de démonstration
INSERT INTO ecus (ecu_id, vehicle_id, domain_id, ecu_name, ecu_type, hardware_version, current_firmware_version) VALUES
    ('ECU_ADAS_001', 'VH001', 1, 'ADAS Controller', 'ADAS_CTRL', 'HW2.1', 'FW1.2.3'),
    ('ECU_COCKPIT_001', 'VH001', 2, 'Cockpit Domain', 'COCKPIT_DC', 'HW3.0', 'FW2.1.0'),
    ('ECU_POWERTRAIN_001', 'VH001', 3, 'Powertrain ECU', 'POWERTRAIN', 'HW1.5', 'FW1.0.1'),
    ('ECU_TELEMATICS_001', 'VH001', 8, 'Telematics Unit', 'TCU', 'HW2.0', 'FW3.2.1');

-- Insertion de features de démonstration
INSERT INTO features (feature_id, feature_name, description, category_id, required_ecus, base_price, pricing_model) VALUES
    ('FEAT_ADV_CRUISE', 'Advanced Cruise Control', 'Contrôle adaptatif de vitesse avec maintien de voie', 1, '["ADAS_CTRL", "COCKPIT_DC", "POWERTRAIN"]', 299.99, 'SUBSCRIPTION'),
    ('FEAT_PERF_BOOST', 'Performance Boost', '+50HP Engine Performance Boost', 1, '["POWERTRAIN"]', 999.99, 'ONE_TIME'),
    ('FEAT_PARK_ASSIST', 'Enhanced Park Assist', 'Aide au stationnement 360°', 2, '["ADAS_CTRL", "COCKPIT_DC"]', 199.99, 'SUBSCRIPTION'),
    ('FEAT_STREAMING', 'Premium Streaming', 'Accès aux services de streaming premium', 4, '["COCKPIT_DC", "TCU"]', 14.99, 'SUBSCRIPTION');

-- Insertion d'un utilisateur de test
INSERT INTO users (user_id, email, first_name, last_name) VALUES
    ('USR001', 'test@kemet-auto.com', 'Jean', 'Dupont');

-- Lien utilisateur-véhicule
INSERT INTO user_vehicles (user_id, vehicle_id, relationship_type, is_primary) VALUES
    ('USR001', 'VH001', 'OWNER', true);
