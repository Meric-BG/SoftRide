const analyticsRepo = require('./backend/src/repositories/AnalyticsRepository');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/src/.env') });

async function testAnalytics() {
    console.log('🧪 Testing AnalyticsRepository.getOverview()...');
    try {
        const stats = await analyticsRepo.getOverview();
        console.log('✅ Stats retrieved successfully:', JSON.stringify(stats, null, 2));
    } catch (error) {
        console.error('❌ Error during test:', error);
    }
}

testAnalytics();
