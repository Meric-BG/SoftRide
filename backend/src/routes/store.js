const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all features
router.get('/features', (req, res) => {
    const features = db.getFeatures();
    res.json(features);
});

// Purchase a feature
router.post('/purchase', authMiddleware, (req, res) => {
    const { featureId, vehicleId } = req.body;

    if (!featureId || !vehicleId) {
        return res.status(400).json({ error: 'featureId et vehicleId requis' });
    }

    const feature = db.getFeatureById(featureId);
    if (!feature) {
        return res.status(404).json({ error: 'Feature non trouvée' });
    }

    // Check if user owns the vehicle
    const user = db.getUserById(req.user.id);
    if (user.vehicleId !== vehicleId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès refusé' });
    }

    // Check if already purchased
    const existing = db.getPurchasesByVehicleId(vehicleId)
        .find(p => p.featureId === featureId && p.status === 'active');

    if (existing) {
        return res.status(400).json({ error: 'Feature déjà achetée' });
    }

    // Create purchase
    const purchase = {
        id: uuidv4(),
        userId: req.user.id,
        vehicleId,
        featureId,
        purchaseDate: new Date().toISOString(),
        status: 'active',
        expiresAt: feature.type === 'subscription'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null
    };

    db.createPurchase(purchase);

    res.status(201).json({
        success: true,
        purchase,
        feature
    });
});

// Get user purchases
router.get('/purchases', authMiddleware, (req, res) => {
    const purchases = db.getPurchasesByUserId(req.user.id);
    const enriched = purchases.map(p => ({
        ...p,
        feature: db.getFeatureById(p.featureId)
    }));

    res.json(enriched);
});

module.exports = router;
