const { get, run, query } = require('../config/db');

class PaymentRepository {
    async create(payment) {
        try {
            const columns = Object.keys(payment);
            const placeholders = columns.map(() => '?').join(', ');
            const values = Object.values(payment);

            run(
                `INSERT INTO payments (${columns.join(', ')}) VALUES (${placeholders})`,
                values
            );

            return this.findById(payment.payment_id);
        } catch (error) {
            console.error('Error in PaymentRepository.create:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            return get('SELECT * FROM payments WHERE payment_id = ?', [id]);
        } catch (error) {
            console.error('Error in PaymentRepository.findById:', error);
            throw error;
        }
    }

    async updateStatus(id, status) {
        try {
            const now = new Date().toISOString();
            run(
                'UPDATE payments SET status = ?, updated_at = ? WHERE payment_id = ?',
                [status, now, id]
            );
            return this.findById(id);
        } catch (error) {
            console.error('Error in PaymentRepository.updateStatus:', error);
            throw error;
        }
    }

    async findByUser(userId) {
        try {
            return query(
                'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
        } catch (error) {
            console.error('Error in PaymentRepository.findByUser:', error);
            throw error;
        }
    }
}

module.exports = new PaymentRepository();
