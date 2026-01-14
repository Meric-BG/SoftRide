const { get, run, query } = require('../config/db');

class UserRepository {

    async findByEmail(email) {
        try {
            return get('SELECT * FROM users WHERE email = ?', [email]);
        } catch (error) {
            console.error('Error in UserRepository.findByEmail:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const user = get('SELECT * FROM users WHERE user_id = ?', [id]);
            if (!user) return null;

            // Fetch vehicles for this user to match previous Supabase behavior
            const vehicles = query('SELECT * FROM vehicles WHERE owner_id = ?', [id]);
            return {
                ...user,
                vehicles: vehicles // Return all vehicles as an array
            };
        } catch (error) {
            console.error('Error in UserRepository.findById:', error);
            throw error;
        }
    }

    async update(id, updates) {
        try {
            const keys = Object.keys(updates);
            if (keys.length === 0) return this.findById(id);

            const setClause = keys.map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);

            // Add updated_at
            const now = new Date().toISOString();

            run(`UPDATE users SET ${setClause}, updated_at = ? WHERE user_id = ?`, [...values, now, id]);

            return this.findById(id);
        } catch (error) {
            console.error('Error in UserRepository.update:', error);
            throw error;
        }
    }

    async updatePhone(id, phoneNumber) {
        return this.update(id, { phone_number: phoneNumber });
    }

    async updateEmail(id, email) {
        const existing = await this.findByEmail(email);
        if (existing && existing.user_id !== id) {
            throw new Error('Cet email est déjà utilisé');
        }
        return this.update(id, { email });
    }

    async create(user) {
        try {
            const columns = Object.keys(user);
            const placeholders = columns.map(() => '?').join(', ');
            const values = Object.values(user);

            const result = run(
                `INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders})`,
                values
            );

            return this.findById(result.lastInsertRowid);
        } catch (error) {
            console.error('Error in UserRepository.create:', error);
            throw error;
        }
    }
}

module.exports = new UserRepository();
