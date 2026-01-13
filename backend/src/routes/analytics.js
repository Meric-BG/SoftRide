const express = require('express');
const db = require('../models/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get revenue analytics
router.get('/revenue', authMiddleware, adminMiddleware, (req, res) => {
    const analytics = db.getAnalytics();
    res.json(analytics.revenue);
});

// Get fleet analytics
router.get('/fleet', authMiddleware, adminMiddleware, (req, res) => {
    const analytics = db.getAnalytics();
    const vehicles = db.getVehicles();

    res.json({
        ...analytics.fleet,
        total: vehicles.length,
        active: vehicles.length
    });
});

// Get sales analytics
router.get('/sales', authMiddleware, adminMiddleware, (req, res) => {
    const analytics = db.getAnalytics();
    res.json(analytics.sales);
});

// Get top selling features
router.get('/top-sales', authMiddleware, adminMiddleware, (req, res) => {
    const purchases = db.getPurchases();
    const featureCounts = {};

    purchases.forEach(p => {
        featureCounts[p.featureId] = (featureCounts[p.featureId] || 0) + 1;
    });

    const topFeatures = Object.entries(featureCounts)
        .map(([featureId, count]) => {
            const feature = db.getFeatureById(featureId);
            return {
                feature,
                count,
                revenue: feature.price * count
            };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

    res.json(topFeatures);
});

// Get dashboard overview
router.get('/overview', authMiddleware, adminMiddleware, (req, res) => {
    const analytics = db.getAnalytics();
    const vehicles = db.getVehicles();
    const purchases = db.getPurchases();

    // Calculate MRR from active subscriptions
    const activeSubscriptions = purchases.filter(p => {
        const feature = db.getFeatureById(p.featureId);
        return feature && feature.type === 'subscription' && p.status === 'active';
    });

    const mrr = activeSubscriptions.reduce((sum, p) => {
        const feature = db.getFeatureById(p.featureId);
        return sum + (feature ? feature.price : 0);
    }, 0);

    res.json({
        revenue: {
            total: analytics.revenue.total,
            monthly: analytics.revenue.monthly,
            mrr,
            growth: analytics.revenue.growth
        },
        fleet: {
            total: vehicles.length,
            active: vehicles.length,
            growth: analytics.fleet.growth
        },
        sales: {
            total: purchases.length,
            revenue: analytics.sales.total,
            growth: analytics.sales.growth
        }
    });
});

module.exports = router;
