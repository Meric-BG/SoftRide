const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../data/kemet.db');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath, { verbose: console.log });
db.pragma('foreign_keys = ON');

// Initialize database if needed
const initSqlPath = path.resolve(__dirname, '../db/init_sqlite.sql');
const initSql = fs.readFileSync(initSqlPath, 'utf8');

try {
    db.exec(initSql);
    console.log('✅ SQLite Database initialized successfully');
} catch (error) {
    console.error('❌ Error initializing SQLite Database:', error);
}

// Helper to sanitize parameters (convert booleans to 0/1 for SQLite)
const sanitizeParams = (params) => {
    if (Array.isArray(params)) {
        return params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);
    }
    if (params && typeof params === 'object') {
        const sanitized = {};
        for (const key in params) {
            const val = params[key];
            sanitized[key] = typeof val === 'boolean' ? (val ? 1 : 0) : val;
        }
        return sanitized;
    }
    return params;
};

// Helper for queries
const query = (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.all(sanitizeParams(params));
};

const get = (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.get(sanitizeParams(params));
};

const run = (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.run(sanitizeParams(params));
};

module.exports = {
    db,
    query,
    get,
    run
};
