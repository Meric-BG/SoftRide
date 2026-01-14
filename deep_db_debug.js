const { query, get } = require('./backend/src/config/db');

async function deepDebug() {
    try {
        console.log('--- TABLES CHECK ---');
        const tables = query("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('Tables:', tables.map(t => t.name).join(', '));

        console.log('\n--- VIEWS CHECK ---');
        const views = query("SELECT name FROM sqlite_master WHERE type='view'");
        console.log('Views:', views.map(v => v.name).join(', '));

        console.log('\n--- VIEW: revenue_analytics_view ---');
        try {
            const rev = query('SELECT * FROM revenue_analytics_view');
            console.table(rev);
        } catch (e) {
            console.error('revenue_analytics_view error:', e.message);
        }

        console.log('\n--- VIEW: vehicle_status_view ---');
        try {
            const fleet = query('SELECT * FROM vehicle_status_view');
            console.table(fleet);
        } catch (e) {
            console.error('vehicle_status_view error:', e.message);
        }

        console.log('\n--- STATS QUERY (AnalyticsRepository Logic) ---');
        try {
            const revenueResult = get('SELECT SUM(amount) as total FROM payments WHERE status = "PAID"');
            console.log('Revenue Result:', revenueResult);

            const subsResult = get('SELECT COUNT(*) as count FROM subscriptions WHERE status = "active"');
            console.log('Active Subs:', subsResult);
        } catch (e) {
            console.error('Stats query error:', e.message);
        }

        console.log('\n--- REQUESTS JOIN CHECK ---');
        const requests = query(`
            SELECT r.request_id, r.user_id, u.email, u.first_name
            FROM service_requests r
            LEFT JOIN users u ON r.user_id = u.user_id
        `);
        console.table(requests);

    } catch (err) {
        console.error('Global Debug Error:', err);
    }
}

deepDebug();
