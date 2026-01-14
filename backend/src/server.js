require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const storeRoutes = require('./routes/store');
const updatesRoutes = require('./routes/updates');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
// Legacy root public directory removed

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/updates', updatesRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Erreur serveur interne' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║        🚗 KEMET API Server                    ║
║                                               ║
║        Port: ${PORT}                             ║
║        Environment: ${process.env.NODE_ENV || 'development'}              ║
║                                               ║
║        Endpoints disponibles:                 ║
║        • POST /api/auth/login                 ║
║        • POST /api/auth/register              ║
║        • GET  /api/vehicles/:id               ║
║        • GET  /api/store/features             ║
║        • GET  /api/updates                    ║
║        • GET  /api/analytics/overview         ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
