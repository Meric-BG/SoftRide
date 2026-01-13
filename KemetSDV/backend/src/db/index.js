/**
* Kemet Mock Database Adapter
* Simulates a PostgreSQL connection for development/demo purposes.
* Supports basic SQL interactions required by the repository layer.
*/

// In-Memory Storage
const db = {
    users: [
        { id: 1, name: 'Admin', email: 'admin@kemet.auto', password_hash: 'admin', role: 'admin' },
        { id: 2, name: 'Lini Badji', email: 'lini@hub.bj', password_hash: 'demo123', role: 'user' }
    ],
    vehicles: [
        { vin: 'VIN123', owner_id: 2, model_name: 'GEZO', connection_status: 'online' }
    ],
    vehicle_state: [
        {
            vin: 'VIN123',
            speed: 0,
            gear: 'P',
            battery_level: 85,
            range_km: 340,
            is_guard_active: true,
            is_trunk_open: false,
            is_charging: false,
            signal_strength: '4G',
            location_name: 'Kigali Innovation City'
        }
    ],
    fota_campaigns: [],
    // ... add other tables as needed
};

const query = async (text, params = []) => {
    console.log(`[MockDB] SQL: ${text} | Params: ${JSON.stringify(params)}`);

    // Normalization
    const sql = text.trim().toLowerCase();

    // --- Mock Implementation of Specific Queries ---

    // 1. SELECT * FROM vehicle_state WHERE vin = $1
    if (sql.includes('select * from vehicle_state where vin')) {
        const vin = params[0];
        const row = db.vehicle_state.find(v => v.vin === vin);
        return { rows: row ? [row] : [] };
    }

    // 2. INSERT ... ON CONFLICT DO UPDATE (Vehicle Sync)
    // Matches the VehicleRepository.updateState query structure
    if (sql.includes('insert into vehicle_state') && sql.includes('on conflict')) {
        const vin = params[0]; // Assuming $1 is VIN
        let row = db.vehicle_state.find(v => v.vin === vin);

        if (!row) {
            // Basic Insert Mock (not perfect mapping but sufficient for demo)
            row = { vin, last_updated: new Date() };
            db.vehicle_state.push(row);
        }

        // We can't parse dynamic SQL easily here.
        // The repository should use the 'updateMockState' helper if isMock is true.

        return { rows: [row] };
    }

    // 3. Auth
    if (sql.includes('select') && sql.includes('from users')) {
        const email = params[0];
        const user = db.users.find(u => u.email === email);
        return { rows: user ? [user] : [] };
    }

    return { rows: [] };
};

// Export helper to allow Repository to inject data directly/bypassing SQL parser
const updateMockState = (vin, updates) => {
    let row = db.vehicle_state.find(v => v.vin === vin);
    if (!row) {
        row = { vin, ...updates };
        db.vehicle_state.push(row);
    } else {
        Object.assign(row, updates);
    }
    return row;
};

module.exports = {
    query,
    isMock: true,
    updateMockState, // Backdoor for Repositories
    db // Expose raw DB for debugging
};
