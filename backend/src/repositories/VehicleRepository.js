const { get, run, query } = require('../config/db');

class VehicleRepository {

    async findById(id) {
        try {
            return get('SELECT * FROM vehicles WHERE vin = ?', [id]);
        } catch (error) {
            console.error('Error in VehicleRepository.findById:', error);
            throw error;
        }
    }

    async update(vin, updates) {
        try {
            const keys = Object.keys(updates);
            if (keys.length === 0) return this.findById(vin);

            const setClause = keys.map(key => `${key} = ?`).join(', ');
            const values = Object.values(updates);

            const now = new Date().toISOString();

            run(`UPDATE vehicles SET ${setClause}, updated_at = ?, last_seen = ? WHERE vin = ?`, [...values, now, now, vin]);

            return this.findById(vin);
        } catch (error) {
            console.error('Error in VehicleRepository.update:', error);
            throw error;
        }
    }

    async create(vehicle) {
        try {
            const columns = Object.keys(vehicle);
            const placeholders = columns.map(() => '?').join(', ');
            const values = Object.values(vehicle);

            run(
                `INSERT INTO vehicles (${columns.join(', ')}) VALUES (${placeholders})`,
                values
            );

            return this.findById(vehicle.vin);
        } catch (error) {
            console.error('Error in VehicleRepository.create:', error);
            throw error;
        }
    }

    async getActiveFeatures(vehicleId) {
        try {
            // vehicleId matches 'vin' in vehicles table and 'vehicle_vin' in subscriptions
            const sql = `
                SELECT f.* 
                FROM features f
                JOIN subscriptions s ON f.feature_id = s.feature_id
                WHERE s.vehicle_vin = ? AND s.status = 'active'
            `;
            return query(sql, [vehicleId]);
        } catch (error) {
            console.error('Error in VehicleRepository.getActiveFeatures:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            return query('SELECT * FROM vehicles ORDER BY created_at DESC');
        } catch (error) {
            console.error('Error in VehicleRepository.findAll:', error);
            throw error;
        }
    }
}

module.exports = new VehicleRepository();
