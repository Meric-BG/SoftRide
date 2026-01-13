const supabase = require('../config/supabase');

class FeatureRepository {

    async findAll() {
        const { data, error } = await supabase
            .from('features')
            .select('*')
            .eq('is_active', true)
            .eq('is_visible', true);

        if (error) throw error;
        return data;
    }

    async findById(id) {
        const { data, error } = await supabase
            .from('features')
            .select('*')
            .eq('feature_id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // Subscriptions logic
    async createSubscription(sub) {
        const { data, error } = await supabase
            .from('subscriptions')
            .insert([sub])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async findSubscriptionsByVehicle(vehicleId) {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('vehicle_id', vehicleId);

        if (error) throw error;
        return data;
    }

    async findSubscriptionsByUser(userId) {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*, features(*)')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    }

    async createFeatureActivation(activation) {
        const { data, error } = await supabase
            .from('feature_activations')
            .insert([activation])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = new FeatureRepository();
