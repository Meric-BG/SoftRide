const supabase = require('../config/supabase');

const DEFAULT_FEATURES = [
    {
        feature_id: 'f1',
        name: 'Mode Sentinelle',
        description: 'Caméras et capteurs actifs pour une sécurité maximale.',
        base_price: 5000,
        pricing_model: 'SUBSCRIPTION',
        currency: 'FCFA',
        is_active: true,
        is_visible: true,
        created_at: new Date().toISOString()
    },
    {
        feature_id: 'f2',
        name: 'Boost Accélération',
        description: 'Réduisez le 0-100 km/h de 0.5s.',
        base_price: 1500000,
        pricing_model: 'LIFETIME',
        currency: 'FCFA',
        is_active: true,
        is_visible: true,
        created_at: new Date().toISOString()
    },
    {
        feature_id: 'f3',
        name: 'Connectivité Premium',
        description: 'Streaming musique, cartes satellite, et navigation live.',
        base_price: 2500,
        pricing_model: 'SUBSCRIPTION',
        currency: 'FCFA',
        is_active: true,
        is_visible: true,
        created_at: new Date().toISOString()
    }
];

// In-memory store for POC fallback persistence of features
const featuresFallbackStore = [...DEFAULT_FEATURES];

class FeatureRepository {

    async findAll() {
        try {
            const { data, error } = await supabase
                .from('features')
                .select('*')
                .eq('is_active', true)
                .eq('is_visible', true);

            if (error) {
                console.warn('Supabase features fetch error:', error.message);
                return featuresFallbackStore;
            }

            // Map database fields to application fields
            const dbData = (data || []).map(f => ({
                ...f,
                base_price: f.base_price || f.price_amount || 0,
                pricing_model: f.pricing_model || f.payment_type || 'SUBSCRIPTION'
            }));

            // Merge with fallback store, avoiding duplicates by feature_id
            const allFeatures = [...dbData];
            featuresFallbackStore.forEach(fall => {
                if (!allFeatures.find(f => f.feature_id === fall.feature_id)) {
                    allFeatures.push(fall);
                }
            });

            return allFeatures;
        } catch (err) {
            console.error('FeatureRepository.findAll error:', err);
            return featuresFallbackStore;
        }
    }

    async findById(id) {
        const { data, error } = await supabase
            .from('features')
            .select('*')
            .eq('feature_id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            const fallback = featuresFallbackStore.find(f => f.feature_id === id);
            if (fallback) return fallback;
            console.error('Feature not found in Supabase nor Fallback:', id);
        }

        const feature = data || featuresFallbackStore.find(f => f.feature_id === id);
        if (feature) {
            return {
                ...feature,
                base_price: feature.base_price || feature.price_amount || 0,
                pricing_model: feature.pricing_model || feature.payment_type || 'SUBSCRIPTION'
            };
        }
        return null;
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

    async create(feature) {
        // Map application fields to database fields if necessary for Supabase
        const dbFeature = {
            ...feature,
            price_amount: feature.price_amount || feature.base_price,
            payment_type: feature.payment_type || feature.pricing_model
        };

        const { data, error } = await supabase
            .from('features')
            .insert([dbFeature])
            .select()
            .single();

        if (error) {
            console.error('Error creating feature:', error);
            // Fallback for POC
            console.warn('⚠️ Supabase Feature issue. Using fallback for POC.');
            const fallbackFeature = {
                ...feature,
                created_at: feature.created_at || new Date().toISOString()
            };
            featuresFallbackStore.push(fallbackFeature);
            return fallbackFeature;
        }
        return data;
    }
}

module.exports = new FeatureRepository();
