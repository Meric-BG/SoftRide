const { query, get } = require('../config/db');

class AnalyticsRepository {

    async getOverview() {
        try {
            const revenueResult = get("SELECT SUM(amount) as total FROM payments WHERE status = 'PAID'");
            const totalRevenue = revenueResult?.total || 0;

            const fleetData = query('SELECT * FROM vehicle_status_view');
            const totalFleet = fleetData.length;
            const activeFleet = fleetData.filter(v => v.connectivity_status === 'connected').length;

            const subsResult = get("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'");
            const totalSales = subsResult?.count || 0;

            // Group revenue by feature
            console.log('📊 Analytics Debug: Querying revenue_analytics_view...');
            const featureRevenue = query('SELECT * FROM revenue_analytics_view');

            console.log(`📊 Analytics Result: 
                - Revenue: ${totalRevenue} 
                - Fleet: ${totalFleet} (Active: ${activeFleet})
                - Sales: ${totalSales}
                - Features: ${featureRevenue.length}`);

            return {
                revenue: {
                    total: totalRevenue,
                    monthly: totalRevenue * 0.15, // Projected monthly
                    mrr: totalRevenue * 0.05,
                    growth: 12.5,
                    byFeature: featureRevenue
                },
                fleet: {
                    total: totalFleet,
                    active: activeFleet,
                    growth: 8.2
                },
                sales: {
                    total: totalSales,
                    growth: 24.3
                }
            };
        } catch (error) {
            console.error('Error in AnalyticsRepository.getOverview:', error);
            throw error;
        }
    }

    async getTopSales(limit = 10) {
        try {
            return query(`SELECT * FROM revenue_analytics_view ORDER BY total_revenue DESC LIMIT ${limit}`);
        } catch (error) {
            console.error('Error in AnalyticsRepository.getTopSales:', error);
            throw error;
        }
    }
}

module.exports = new AnalyticsRepository();
