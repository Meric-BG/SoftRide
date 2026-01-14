const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

// Initialize SQLite Database
require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const storeRoutes = require('./routes/store');
const updatesRoutes = require('./routes/updates');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes = require('./routes/payment');
const requestRoutes = require('./routes/requests');

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Permissive for POC to avoid connection issues
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/updates', updatesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/requests', requestRoutes);

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
