const supabase = require('../config/supabase');

class VehicleRepository {

    async findById(id) {
        // Support querying by vehicle_id OR vin if needed. 
        // For now, assume ID since routes use :id
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .or(`vehicle_id.eq.${id},vin.eq.${id}`) // Flexible lookup
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async update(id, updates) {
        const { data, error } = await supabase
            .from('vehicles')
            .update({
                ...updates,
                last_seen: new Date().toISOString()
            })
            .eq('vehicle_id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getActiveFeatures(vehicleId) {
        // Joining tables via Supabase
        const { data, error } = await supabase
            .from('subscriptions')
            .select(`
                status,
                features (
                    name, 
                    description, 
                    price_amount
                )
            `)
            .eq('vehicle_id', vehicleId)
            .eq('status', 'active');

        if (error) throw error;
        return data.map(sub => sub.features);
    }
}

module.exports = new VehicleRepository();
