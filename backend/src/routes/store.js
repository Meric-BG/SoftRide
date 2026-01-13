const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/supabaseDB');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all features
router.get('/features', async (req, res) => {
    try {
        const features = await db.getFeatures();
        res.json(features);
    } catch (error) {
        console.error('Get features error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Purchase a feature
router.post('/purchase', authMiddleware, async (req, res) => {
    try {
        const { featureId, vehicleId } = req.body;

        if (!featureId || !vehicleId) {
            return res.status(400).json({ error: 'featureId et vehicleId requis' });
        }

        const feature = await db.getFeatureById(featureId);
        if (!feature) {
            return res.status(404).json({ error: 'Feature non trouvée' });
        }

        // Check if already purchased
        const existing = await db.getSubscriptionsByVehicleId(vehicleId);
        const alreadyPurchased = existing.find(s =>
            s.feature_id === featureId && s.status === 'ACTIVE'
        );

        if (alreadyPurchased) {
            return res.status(400).json({ error: 'Feature déjà achetée' });
        }

        // Create subscription
        const subscription = {
            subscription_id: uuidv4(),
            user_id: req.user.id,
            vehicle_id: vehicleId,
            feature_id: featureId,
            subscription_plan: feature.pricing_model === 'SUBSCRIPTION' ? 'MONTHLY' : 'LIFETIME',
            start_date: new Date().toISOString().split('T')[0],
            end_date: feature.pricing_model === 'SUBSCRIPTION'
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                : new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 100 years for lifetime
            status: 'ACTIVE',
            auto_renew: feature.pricing_model === 'SUBSCRIPTION',
            price: feature.base_price,
            currency: feature.currency
        };

        const created = await db.createSubscription(subscription);

        // Create feature activation
        const activation = {
            activation_id: uuidv4(),
            subscription_id: created.subscription_id,
            vehicle_id: vehicleId,
            feature_id: featureId,
            activation_status: 'ACTIVE',
            target_status: 'ACTIVE',
            activation_request_time: new Date().toISOString(),
            activation_start_time: new Date().toISOString(),
            activation_end_time: new Date().toISOString(),
            requested_by: req.user.id,
            request_source: 'WEB_PORTAL'
        };

        await db.createFeatureActivation(activation);

        res.status(201).json({
            success: true,
            subscription: created,
            feature
        });
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get user purchases
router.get('/purchases', authMiddleware, async (req, res) => {
    try {
        const subscriptions = await db.getSubscriptionsByUserId(req.user.id);
        res.json(subscriptions);
    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
