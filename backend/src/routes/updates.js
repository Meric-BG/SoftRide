const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all updates
router.get('/', (req, res) => {
    const updates = db.getUpdates();
    res.json(updates);
});

// Get available updates for a vehicle
router.get('/available/:vehicleId', authMiddleware, (req, res) => {
    const vehicle = db.getVehicleById(req.params.vehicleId);

    if (!vehicle) {
        return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    const allUpdates = db.getUpdates();
    const available = allUpdates.filter(u => {
        // Simple version comparison (in production, use semver)
        return u.version > vehicle.osVersion && u.status === 'deployed';
    });

    res.json(available);
});

// Deploy update (Admin only)
router.post('/deploy', authMiddleware, adminMiddleware, (req, res) => {
    const { version, notes, targetVehicles } = req.body;

    if (!version || !notes) {
        return res.status(400).json({ error: 'version et notes requis' });
    }

    const update = {
        id: uuidv4(),
        version,
        releaseDate: new Date().toISOString(),
        notes,
        deployedVehicles: 0,
        totalVehicles: db.getVehicles().length,
        status: 'deploying'
    };

    db.createUpdate(update);

    // Simulate deployment (in production, this would trigger MQTT messages)
    setTimeout(() => {
        const allUpdates = db.getUpdates();
        const index = allUpdates.findIndex(u => u.id === update.id);
        if (index !== -1) {
            allUpdates[index].status = 'deployed';
            allUpdates[index].deployedVehicles = targetVehicles || allUpdates[index].totalVehicles;
            db.data.updates = allUpdates;
            db.save();
        }
    }, 2000);

    res.status(201).json({ success: true, update });
});

// Get OS fragmentation stats (Admin only)
router.get('/stats', authMiddleware, adminMiddleware, (req, res) => {
    const vehicles = db.getVehicles();
    const versionCounts = {};

    vehicles.forEach(v => {
        versionCounts[v.osVersion] = (versionCounts[v.osVersion] || 0) + 1;
    });

    const stats = Object.entries(versionCounts).map(([version, count]) => ({
        version,
        count,
        percentage: ((count / vehicles.length) * 100).toFixed(1)
    }));

    res.json({
        total: vehicles.length,
        versions: stats
    });
});

module.exports = router;
