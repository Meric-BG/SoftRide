require('dotenv').config();
const db = require('./backend/src/models/supabaseDB');

async function checkSentinel() {
    try {
        console.log('--- Checking Features ---');
        const { data, error } = await db.client.from('features').select('*');
        if (error) throw error;

        const sentinel = data.find(f => f.feature_id === 'FEAT_SENTINEL');
        const f1 = data.find(f => f.feature_id === 'f1');

        console.log('FEAT_SENTINEL exists:', !!sentinel);
        console.log('f1 exists:', !!f1);

        if (sentinel) console.log('Sentinel:', sentinel);
        if (f1) console.log('f1:', f1);

    } catch (e) {
        console.error(e);
    }
}

checkSentinel();
