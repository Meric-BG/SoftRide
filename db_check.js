const { query } = require('./backend/src/config/db');

async function debug() {
    try {
        console.log('--- USERS ---');
        const users = query('SELECT user_id, email, first_name, last_name FROM users');
        console.table(users);

        console.log('--- SERVICE REQUESTS ---');
        const requests = query('SELECT request_id, user_id, type, subject, status FROM service_requests');
        console.table(requests);

        console.log('--- JOIN TEST ---');
        const join = query(`
            SELECT r.request_id, u.email 
            FROM service_requests r
            JOIN users u ON r.user_id = u.user_id
        `);
        console.table(join);
    } catch (err) {
        console.error(err);
    }
}

debug();
