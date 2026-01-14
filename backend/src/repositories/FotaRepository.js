const { get, run, query } = require('../config/db');

class FotaRepository {

    async findAllCampaigns() {
        try {
            return query('SELECT * FROM fota_campaigns ORDER BY created_at DESC');
        } catch (error) {
            console.error('Error in FotaRepository.findAllCampaigns:', error);
            throw error;
        }
    }

    async findCampaignById(id) {
        try {
            return get('SELECT * FROM fota_campaigns WHERE campaign_id = ?', [id]);
        } catch (error) {
            console.error('Error in FotaRepository.findCampaignById:', error);
            throw error;
        }
    }

    async createCampaign(campaign) {
        try {
            const columns = Object.keys(campaign);
            const placeholders = columns.map(() => '?').join(', ');
            const values = Object.values(campaign);

            run(
                `INSERT INTO fota_campaigns (${columns.join(', ')}) VALUES (${placeholders})`,
                values
            );

            return this.findCampaignById(campaign.campaign_id);
        } catch (error) {
            console.error('Error in FotaRepository.createCampaign:', error);
            throw error;
        }
    }

    async findUpdatesByVehicle(vin) {
        try {
            return query('SELECT * FROM vehicle_updates WHERE vehicle_vin = ?', [vin]);
        } catch (error) {
            console.error('Error in FotaRepository.findUpdatesByVehicle:', error);
            throw error;
        }
    }
}

module.exports = new FotaRepository();
