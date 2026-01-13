const supabase = require('../config/supabase');

class FotaRepository {

    async findAllCampaigns() {
        const { data, error } = await supabase
            .from('fota_campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async findCampaignById(id) {
        const { data, error } = await supabase
            .from('fota_campaigns')
            .select('*')
            .eq('campaign_id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async createCampaign(campaign) {
        const { data, error } = await supabase
            .from('fota_campaigns')
            .insert([campaign])
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = new FotaRepository();
