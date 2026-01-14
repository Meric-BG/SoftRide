require('dotenv').config();
const db = require('./backend/src/models/supabaseDB');

async function updateFeatures() {
    try {
        console.log('Updating features...');

        // 1. Update FEAT_PERF_BOOST
        const { error: err1 } = await db.client
            .from('features')
            .update({
                base_price: 1500000,
                currency: 'XOF',
                feature_name: 'Boost Accélération'
            })
            .eq('feature_id', 'FEAT_PERF_BOOST');
        if (err1) console.error('Error updating PERF_BOOST:', err1);
        else console.log('Updated FEAT_PERF_BOOST to 1,500,000 XOF');

        // 2. Update FEAT_STREAMING
        const { error: err2 } = await db.client
            .from('features')
            .update({
                base_price: 2500,
                currency: 'XOF',
                feature_name: 'Connectivité Premium'
            })
            .eq('feature_id', 'FEAT_STREAMING');
        if (err2) console.error('Error updating STREAMING:', err2);
        else console.log('Updated FEAT_STREAMING to 2,500 XOF');

        // 3. Create or Update FEAT_SENTINEL
        // First check if it exists
        const { data: sentinel, error: errCheck } = await db.client
            .from('features')
            .select('*')
            .eq('feature_id', 'FEAT_SENTINEL')
            .single();

        if (!sentinel && (!errCheck || errCheck.code === 'PGRST116')) {
            // Insert
            const { error: errInsert } = await db.client
                .from('features')
                .insert({
                    feature_id: 'FEAT_SENTINEL',
                    feature_name: 'Mode Sentinelle',
                    base_price: 5000,
                    currency: 'XOF',
                    description: 'Surveillance 360',
                    pricing_model: 'SUBSCRIPTION',
                    is_active: true
                });
            if (errInsert) console.error('Error inserting SENTINEL:', errInsert);
            else console.log('Inserted FEAT_SENTINEL');
        } else {
            // Update
            const { error: errUpdate } = await db.client
                .from('features')
                .update({
                    base_price: 5000,
                    currency: 'XOF',
                    feature_name: 'Mode Sentinelle'
                })
                .eq('feature_id', 'FEAT_SENTINEL');
            if (errUpdate) console.error('Error updating SENTINEL:', errUpdate);
            else console.log('Updated FEAT_SENTINEL');
        }

    } catch (e) {
        console.error(e);
    }
}

updateFeatures();
