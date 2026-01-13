
/**
 * Migration Script: JSON → Supabase
 * 
 * This script migrates data from the JSON database to Supabase PostgreSQL
 * 
 * Usage: node backend/src/scripts/migrate-to-supabase.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

const JSON_DB_PATH = path.join(__dirname, '../models/db.json');

async function migrateData() {
    console.log('🚀 Starting migration from JSON to Supabase...\n');

    if (!supabase) {
        console.error('❌ Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env');
        process.exit(1);
    }

    // Load JSON data
    const jsonData = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
    console.log('📂 JSON data loaded successfully');

    try {
        // 1. Migrate Users
        console.log('\n👤 Migrating users...');
        if (jsonData.users && jsonData.users.length > 0) {
            const { data, error } = await supabase
                .from('users')
                .upsert(jsonData.users.map(u => ({
                    user_id: u.id,
                    email: u.email,
                    phone_number: null,
                    first_name: u.name?.split(' ')[0] || 'User',
                    last_name: u.name?.split(' ')[1] || '',
                    password_hash: u.password,
                    account_status: 'ACTIVE',
                    verified_email: true
                })), { onConflict: 'user_id' });

            if (error) throw error;
            console.log(`✅ Migrated ${jsonData.users.length} users`);
        }

        // 2. Migrate Vehicles
        console.log('\n🚗 Migrating vehicles...');
        if (jsonData.vehicles && jsonData.vehicles.length > 0) {
            const { data, error } = await supabase
                .from('vehicles')
                .upsert(jsonData.vehicles.map(v => ({
                    vehicle_id: v.id,
                    vin: v.vin,
                    brand: 'KEMET',
                    model: v.model || 'Gezo',
                    year: 2026,
                    platform: 'SDV_PLATFORM_2026',
                    battery_level: v.battery,
                    connectivity_status: v.locked ? 'connected' : 'disconnected',
                    last_connected: v.lastUpdate,
                    is_active: true
                })), { onConflict: 'vehicle_id' });

            if (error) throw error;
            console.log(`✅ Migrated ${jsonData.vehicles.length} vehicles`);
        }

        // 3. Link users to vehicles
        console.log('\n🔗 Linking users to vehicles...');
        if (jsonData.users && jsonData.users.length > 0) {
            const userVehicles = jsonData.users
                .filter(u => u.vehicleId)
                .map(u => ({
                    user_id: u.id,
                    vehicle_id: u.vehicleId,
                    relationship_type: 'OWNER',
                    is_primary: true
                }));

            if (userVehicles.length > 0) {
                const { data, error } = await supabase
                    .from('user_vehicles')
                    .upsert(userVehicles, { onConflict: 'user_id,vehicle_id' });

                if (error) throw error;
                console.log(`✅ Linked ${userVehicles.length} user-vehicle relationships`);
            }
        }

        // 4. Migrate Features
        console.log('\n⭐ Migrating features...');
        if (jsonData.features && jsonData.features.length > 0) {
            const { data, error } = await supabase
                .from('features')
                .upsert(jsonData.features.map(f => ({
                    feature_id: f.id,
                    feature_name: f.name,
                    description: f.description,
                    category_id: 1, // Default category
                    required_ecus: JSON.stringify(['COCKPIT_DC']),
                    base_price: f.price,
                    currency: 'XOF', // ISO code for West African CFA franc
                    pricing_model: f.type === 'subscription' ? 'SUBSCRIPTION' : 'ONE_TIME',
                    subscription_duration_days: f.interval === 'monthly' ? 30 : null,
                    is_active: f.active,
                    is_visible: true,
                    release_date: new Date().toISOString().split('T')[0]
                })), { onConflict: 'feature_id' });

            if (error) throw error;
            console.log(`✅ Migrated ${jsonData.features.length} features`);
        }

        // 5. Migrate Purchases → Subscriptions
        console.log('\n💳 Migrating purchases to subscriptions...');
        if (jsonData.purchases && jsonData.purchases.length > 0) {
            const { data, error } = await supabase
                .from('subscriptions')
                .upsert(jsonData.purchases.map(p => ({
                    subscription_id: p.id,
                    user_id: p.userId,
                    vehicle_id: p.vehicleId,
                    feature_id: p.featureId,
                    subscription_plan: 'MONTHLY',
                    start_date: p.purchaseDate?.split('T')[0] || new Date().toISOString().split('T')[0],
                    end_date: p.expiresAt?.split('T')[0] || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: p.status === 'active' ? 'ACTIVE' : 'EXPIRED',
                    auto_renew: true,
                    price: 5000,
                    currency: 'XOF' // ISO code for West African CFA franc
                })), { onConflict: 'subscription_id' });

            if (error) throw error;
            console.log(`✅ Migrated ${jsonData.purchases.length} subscriptions`);
        }

        // 6. Migrate Updates → FOTA Campaigns
        console.log('\n📦 Migrating updates to FOTA campaigns...');
        if (jsonData.updates && jsonData.updates.length > 0) {
            const { data, error } = await supabase
                .from('fota_campaigns')
                .upsert(jsonData.updates.map(u => ({
                    campaign_id: u.id,
                    campaign_name: `Update to ${u.version}`,
                    description: u.notes,
                    campaign_type: 'SCHEDULED',
                    priority: 3,
                    rollout_strategy: 'PHASED',
                    scheduled_start: u.releaseDate,
                    status: u.status === 'deployed' ? 'COMPLETED' : 'DRAFT',
                    created_by: 'SYSTEM',
                    created_at: u.releaseDate
                })), { onConflict: 'campaign_id' });

            if (error) throw error;
            console.log(`✅ Migrated ${jsonData.updates.length} FOTA campaigns`);
        }

        console.log('\n✨ Migration completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${jsonData.users?.length || 0}`);
        console.log(`   Vehicles: ${jsonData.vehicles?.length || 0}`);
        console.log(`   Features: ${jsonData.features?.length || 0}`);
        console.log(`   Subscriptions: ${jsonData.purchases?.length || 0}`);
        console.log(`   FOTA Campaigns: ${jsonData.updates?.length || 0}`);

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('Details:', error);
        process.exit(1);
    }
}

// Run migration
migrateData()
    .then(() => {
        console.log('\n✅ All done!');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Fatal error:', err);
        process.exit(1);
    });
