require('dotenv').config();
const db = require('./backend/src/models/supabaseDB');

async function checkFeatures() {
    try {
        const { data, error } = await db.client.from('features').select('*');
        if (error) throw error;
        console.log('Features in DB:');
        data.forEach(f => {
            console.log(`- ${f.feature_id}: ${f.feature_name} = ${f.base_price} ${f.currency}`);
        });
    } catch (e) {
        console.error(e);
    }
}

checkFeatures();
