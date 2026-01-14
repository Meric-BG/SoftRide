const { get, run, query } = require('../config/db');

class RequestRepository {
    async create(request) {
        try {
            const columns = Object.keys(request);
            const placeholders = columns.map(() => '?').join(', ');
            const values = Object.values(request);

            run(
                `INSERT INTO service_requests (${columns.join(', ')}) VALUES (${placeholders})`,
                values
            );

            return this.findById(request.request_id);
        } catch (error) {
            console.error('Error in RequestRepository.create:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            return get('SELECT * FROM service_requests WHERE request_id = ?', [id]);
        } catch (error) {
            console.error('Error in RequestRepository.findById:', error);
            throw error;
        }
    }

    async findByUser(userId) {
        try {
            return query('SELECT * FROM service_requests WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        } catch (error) {
            console.error('Error in RequestRepository.findByUser:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            return query(`
                SELECT r.*, u.first_name, u.last_name, u.email 
                FROM service_requests r
                LEFT JOIN users u ON r.user_id = u.user_id
                ORDER BY r.created_at DESC
            `);
        } catch (error) {
            console.error('Error in RequestRepository.findAll:', error);
            throw error;
        }
    }

    async update(id, updates) {
        try {
            const keys = Object.keys(updates);
            if (keys.length === 0) return this.findById(id);

            const setClause = keys.map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);
            const now = new Date().toISOString();

            run(
                `UPDATE service_requests SET ${setClause}, updated_at = ? WHERE request_id = ?`,
                [...values, now, id]
            );

            return this.findById(id);
        } catch (error) {
            console.error('Error in RequestRepository.update:', error);
            throw error;
        }
    }
}

module.exports = new RequestRepository();
