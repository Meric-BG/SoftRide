const jwt = require('jsonwebtoken');
const path = require('path');
const JWT_SECRET = process.env.JWT_SECRET || 'kemet-super-secret-key-change-me-in-production';
console.log(`🔐 JWT Secret initialized: ${JWT_SECRET.substring(0, 5)}...`);

const authMiddleware = (req, res, next) => {
    let token = req.header('Authorization')?.replace('Bearer ', '');

    // Support token in query params (for EventSource/SSE)
    if (!token && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error(`❌ Token Error: ${error.message} (Secret used: ${JWT_SECRET.substring(0, 5)}...)`);
        res.status(401).json({ error: 'Token invalide.' });
    }
};

const adminMiddleware = (req, res, next) => {
    console.log(`🛡️ adminMiddleware check: UserID=${req.user.id}, Role=${req.user.role}`);
    if (req.user.role !== 'admin') {
        console.warn(`⛔ Access denied for UserID=${req.user.id}. Role 'admin' required, found '${req.user.role}'`);
        return res.status(403).json({ error: 'Accès refusé. Droits administrateur requis.' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware, JWT_SECRET };
