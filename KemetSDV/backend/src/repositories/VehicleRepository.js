/**
 * Vehicle Repository
 * Handles all CRUD operations for Vehicle State and Fleet Management.
 */
const db = require('../config/db');
const { updateMockState } = require('../db/index'); // specialized helper for mock mode

class VehicleRepository {

    // --- Telemetry & State ---

    async getState(vin) {
        const result = await db.query(
            `SELECT * FROM vehicle_state WHERE vin = $1`,
            [vin]
        );
        return result.rows[0] || null;
    }

    async updateState(vin, updates) {
        // If running in Mock Mode, bypass SQL generation for dynamic updates
        // because parsing "INSERT ... ON CONFLICT" in a mock is error-prone.
        if (db.isMock && updateMockState) {
            console.log(`[Repository] Mock Update for ${vin}:`, updates);
            return updateMockState(vin, updates);
        }

        // Dynamic update query builder (Postgres)
        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) return null;

        const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');

        const queryText = `
            INSERT INTO vehicle_state (vin, ${fields.join(', ')})
            VALUES ($1, ${values.map((_, i) => `$${i + 2}`).join(', ')})
            ON CONFLICT (vin) DO UPDATE
            SET ${setClause}, last_updated = CURRENT_TIMESTAMP
            RETURNING *
        `;

        const result = await db.query(queryText, [vin, ...values]);
        return result.rows[0];
    }

    // --- Controls ---

    async setGuardMode(vin, isActive) {
        return this.updateState(vin, { is_guard_active: isActive });
    }

    async setTrunkState(vin, isOpen) {
        return this.updateState(vin, { is_trunk_open: isOpen });
    }

    // --- Fleet ---

    async findByOwner(userId) {
        const result = await db.query(
            `SELECT v.*, vs.battery_level, vs.range_km, vs.location_name
             FROM vehicles v
             LEFT JOIN vehicle_state vs ON v.vin = vs.vin
             WHERE v.owner_id = $1`,
            [userId]
        );
        return result.rows;
    }
}

module.exports = new VehicleRepository();
