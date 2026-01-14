const express = require('express');
const { v4: uuidv4 } = require('uuid');
const featureRepo = require('../repositories/FeatureRepository');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all features
router.get('/features', async (req, res) => {
    try {
        const features = await featureRepo.findAll();
        res.json(features);
    } catch (error) {
        console.error('Get features error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Add a feature (Admin)
router.post('/features', async (req, res) => {
    try {
        const { name, description, price, pricing_model, image_url } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: 'Nom et prix requis' });
        }

        const newFeature = {
            feature_id: 'f' + Date.now(),
            name,
            description,
            base_price: price,
            pricing_model: pricing_model || 'SUBSCRIPTION',
            image_url,
            currency: 'FCFA',
            is_active: true,
            is_visible: true,
            created_at: new Date().toISOString()
        };

        const created = await featureRepo.create(newFeature);
        res.status(201).json(created);
    } catch (error) {
        console.error('Create feature error:', error);
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

        const feature = await featureRepo.findById(featureId);
        if (!feature) {
            return res.status(404).json({ error: 'Feature non trouvée' });
        }

        // Check if already purchased
        const existing = await featureRepo.findSubscriptionsByVehicle(vehicleId);
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

        const created = await featureRepo.createSubscription(subscription);

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

        await featureRepo.createFeatureActivation(activation);

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
        const subscriptions = await featureRepo.findSubscriptionsByUser(req.user.id);
        res.json(subscriptions);
    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
