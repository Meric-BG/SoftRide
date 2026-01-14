require('dotenv').config();
const db = require('./backend/src/models/supabaseDB');

async function fixSentinel() {
    try {
        console.log('Fixing Sentinel...');

        // 1. Create FEAT_SENTINEL
        const { error: errInsert } = await db.client
            .from('features')
            .insert({
                feature_id: 'FEAT_SENTINEL',
                feature_name: 'Mode Sentinelle',
                description: 'Surveillance vidéo 360° et alertes en temps réel',
                base_price: 5000,
                currency: 'XOF',
                pricing_model: 'SUBSCRIPTION',
                is_active: true
            });

        if (errInsert) {
            // If duplicate, just ignore or update
            if (errInsert.code === '23505') {
                console.log('FEAT_SENTINEL already exists (duplicate key). Updating instead.');
                await db.client.from('features').update({
                    base_price: 5000,
                    currency: 'XOF'
                }).eq('feature_id', 'FEAT_SENTINEL');
            } else {
                console.error('Error inserting SENTINEL:', errInsert);
            }
        } else {
            console.log('✅ Created FEAT_SENTINEL');
        }

        // 2. Deprecate f1
        const { error: errDeprecate } = await db.client
            .from('features')
            .update({ is_active: false, feature_name: 'Mode Sentinelle (Deprecated)' })
            .eq('feature_id', 'f1');

        if (errDeprecate) console.error('Error deprecating f1:', errDeprecate);
        else console.log('Deprecated f1 (set inactive)');

    } catch (e) {
        console.error(e);
    }
}

fixSentinel();
