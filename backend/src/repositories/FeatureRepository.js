const { get, run, query } = require('../config/db');

class FeatureRepository {

    async findAll() {
        try {
            const data = query('SELECT * FROM features WHERE is_active = 1 AND is_visible = 1');
            return data.map(f => ({
                ...f,
                base_price: f.price_amount || 0,
                pricing_model: (f.payment_type || 'subscription').toLowerCase()
            }));
        } catch (err) {
            console.error('FeatureRepository.findAll error:', err);
            throw err;
        }
    }

    async findById(id) {
        try {
            const feature = get('SELECT * FROM features WHERE feature_id = ?', [id]);
            if (feature) {
                return {
                    ...feature,
                    base_price: feature.price_amount || 0,
                    pricing_model: (feature.payment_type || 'subscription').toLowerCase()
                };
            }
            return null;
        } catch (error) {
            console.error('FeatureRepository.findById error:', error);
            throw error;
        }
    }

    // Subscriptions logic
    async createSubscription(sub) {
        try {
            const columns = Object.keys(sub);
            const placeholders = columns.map(() => '?').join(', ');
            const values = Object.values(sub);

            const result = run(
                `INSERT INTO subscriptions (${columns.join(', ')}) VALUES (${placeholders})`,
                values
            );

            return get('SELECT * FROM subscriptions WHERE subscription_id = ?', [result.lastInsertRowid]);
        } catch (error) {
            console.error('Error in FeatureRepository.createSubscription:', error);
            throw error;
        }
    }

    async findSubscriptionsByVehicle(vin) {
        try {
            return query('SELECT * FROM subscriptions WHERE vehicle_vin = ?', [vin]);
        } catch (error) {
            console.error('Error in FeatureRepository.findSubscriptionsByVehicle:', error);
            throw error;
        }
    }

    async findSubscriptionsByUser(userId) {
        try {
            // Join with features to match previous Supabase behavior
            const sql = `
                SELECT s.*, f.name as feature_name, f.description as feature_description, f.price_amount as feature_price
                FROM subscriptions s
                JOIN features f ON s.feature_id = f.feature_id
                WHERE s.user_id = ?
            `;
            const rows = query(sql, [userId]);

            // Format to match Supabase structure if needed
            return rows.map(row => ({
                ...row,
                features: {
                    name: row.feature_name,
                    description: row.feature_description,
                    price_amount: row.feature_price
                }
            }));
        } catch (error) {
            console.error('Error in FeatureRepository.findSubscriptionsByUser:', error);
            throw error;
        }
    }

    async createFeatureActivation(activation) {
        try {
            const columns = Object.keys(activation);
            const placeholders = columns.map(() => '?').join(', ');
            const values = Object.values(activation);

            run(
                `INSERT INTO feature_activations (${columns.join(', ')}) VALUES (${placeholders})`,
                values
            );

            return get('SELECT * FROM feature_activations WHERE activation_id = ?', [activation.activation_id]);
        } catch (error) {
            console.error('Error in FeatureRepository.createFeatureActivation:', error);
            throw error;
        }
    }

    async create(feature) {
        try {
            const columns = Object.keys(feature);
            const placeholders = columns.map(() => '?').join(', ');
            const values = Object.values(feature);

            run(
                `INSERT INTO features (${columns.join(', ')}) VALUES (${placeholders})`,
                values
            );

            return this.findById(feature.feature_id);
        } catch (error) {
            console.error('Error in FeatureRepository.create:', error);
            throw error;
        }
    }
}

module.exports = new FeatureRepository();
