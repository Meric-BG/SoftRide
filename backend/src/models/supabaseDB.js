const supabase = require('../config/supabase');

/**
 * Supabase Database Adapter
 * Replaces the JSON-based database with PostgreSQL queries
 */

class SupabaseDB {
    constructor() {
        this.client = supabase;
    }

    // ============================================
    // USERS
    // ============================================

    async getUsers() {
        const { data, error } = await this.client
            .from('users')
            .select('*');

        if (error) throw error;
        return data;
    }

    async getUserById(id) {
        const { data, error } = await this.client
            .from('users')
            .select('*')
            .eq('user_id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
        return data;
    }

    async getUserByEmail(email) {
        const { data, error } = await this.client
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async createUser(user) {
        const { data, error } = await this.client
            .from('users')
            .insert([user])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateUser(id, updates) {
        const { data, error } = await this.client
            .from('users')
            .update(updates)
            .eq('user_id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============================================
    // VEHICLES
    // ============================================

    async getVehicles() {
        const { data, error } = await this.client
            .from('vehicles')
            .select('*');

        if (error) throw error;
        return data;
    }

    async getVehicleById(id) {
        const { data, error } = await this.client
            .from('vehicles')
            .select('*')
            .eq('vehicle_id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async updateVehicle(id, updates) {
        const { data, error } = await this.client
            .from('vehicles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('vehicle_id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async createVehicle(vehicle) {
        const { data, error } = await this.client
            .from('vehicles')
            .insert([vehicle])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============================================
    // FEATURES
    // ============================================

    async getFeatures() {
        const { data, error } = await this.client
            .from('features')
            .select('*')
            .eq('is_active', true)
            .eq('is_visible', true);

        if (error) throw error;
        return data;
    }

    async getFeatureById(id) {
        const { data, error } = await this.client
            .from('features')
            .select('*')
            .eq('feature_id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async createFeature(feature) {
        const { data, error } = await this.client
            .from('features')
            .insert([feature])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============================================
    // SUBSCRIPTIONS (replaces purchases)
    // ============================================

    async getSubscriptions() {
        const { data, error } = await this.client
            .from('subscriptions')
            .select('*, features(*), users(*), vehicles(*)');

        if (error) throw error;
        return data;
    }

    async getSubscriptionsByUserId(userId) {
        const { data, error } = await this.client
            .from('subscriptions')
            .select('*, features(*)')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    }

    async getSubscriptionsByVehicleId(vehicleId) {
        const { data, error } = await this.client
            .from('subscriptions')
            .select('*, features(*)')
            .eq('vehicle_id', vehicleId);

        if (error) throw error;
        return data;
    }

    async createSubscription(subscription) {
        const { data, error } = await this.client
            .from('subscriptions')
            .insert([subscription])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============================================
    // FEATURE ACTIVATIONS
    // ============================================

    async getActiveFeaturesByVehicle(vehicleId) {
        const { data, error } = await this.client
            .from('feature_activations')
            .select('*, features(*), subscriptions(*)')
            .eq('vehicle_id', vehicleId)
            .eq('activation_status', 'ACTIVE');

        if (error) throw error;
        return data;
    }

    async createFeatureActivation(activation) {
        const { data, error } = await this.client
            .from('feature_activations')
            .insert([activation])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // ============================================
    // FOTA CAMPAIGNS & UPDATES
    // ============================================

    async getFOTACampaigns() {
        const { data, error } = await this.client
            .from('fota_campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getFOTACampaignById(id) {
        const { data, error } = await this.client
            .from('fota_campaigns')
            .select('*')
            .eq('campaign_id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async createFOTACampaign(campaign) {
        const { data, error } = await this.client
            .from('fota_campaigns')
            .insert([campaign])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getUpdateTasks(campaignId = null) {
        let query = this.client
            .from('update_tasks')
            .select('*, vehicles(*), ecus(*), firmware_packages(*)');

        if (campaignId) {
            query = query.eq('campaign_id', campaignId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    // ============================================
    // ANALYTICS
    // ============================================

    async getAnalyticsOverview() {
        // Use the SQL view created in the schema
        const { data: revenueData, error: revenueError } = await this.client
            .from('revenue_analytics_view')
            .select('*');

        if (revenueError) throw revenueError;

        const { data: vehiclesData, error: vehiclesError } = await this.client
            .from('vehicle_status_view')
            .select('*');

        if (vehiclesError) throw vehiclesError;

        // Calculate totals
        const totalRevenue = revenueData.reduce((sum, item) => sum + (parseFloat(item.total_revenue) || 0), 0);
        const activeSubscriptions = revenueData.reduce((sum, item) => sum + (item.active_subscriptions || 0), 0);

        return {
            revenue: {
                total: totalRevenue,
                monthly: totalRevenue * 0.3, // Estimation
                mrr: revenueData.reduce((sum, item) => sum + (parseFloat(item.average_price) || 0) * (item.active_subscriptions || 0), 0),
                growth: 12.5 // TODO: Calculate from historical data
            },
            fleet: {
                total: vehiclesData.length,
                active: vehiclesData.filter(v => v.connectivity_status === 'connected').length,
                growth: 8.2 // TODO: Calculate from historical data
            },
            sales: {
                total: activeSubscriptions,
                growth: 24.3 // TODO: Calculate from historical data
            }
        };
    }

    async getTopSales(limit = 10) {
        const { data, error } = await this.client
            .from('revenue_analytics_view')
            .select('*')
            .order('total_revenue', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    // ============================================
    // TRANSACTIONS
    // ============================================

    async createTransaction(transaction) {
        const { data, error } = await this.client
            .from('transactions')
            .insert([transaction])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getTransactionsByUser(userId) {
        const { data, error } = await this.client
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('transaction_date', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getTransactionById(transactionId) {
        const { data, error } = await this.client
            .from('transactions')
            .select('*')
            .eq('transaction_id', transactionId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async updateTransaction(transactionId, updates) {
        const { data, error } = await this.client
            .from('transactions')
            .update(updates)
            .eq('transaction_id', transactionId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = new SupabaseDB();
