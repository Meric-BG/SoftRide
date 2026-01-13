const express = require('express');
const db = require('../models/supabaseDB');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview
router.get('/overview', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const overview = await db.getAnalyticsOverview();
        res.json(overview);
    } catch (error) {
        console.error('Get overview error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get revenue analytics
router.get('/revenue', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const overview = await db.getAnalyticsOverview();
        res.json(overview.revenue);
    } catch (error) {
        console.error('Get revenue error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get fleet analytics
router.get('/fleet', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const overview = await db.getAnalyticsOverview();
        res.json(overview.fleet);
    } catch (error) {
        console.error('Get fleet error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get sales analytics
router.get('/sales', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const overview = await db.getAnalyticsOverview();
        res.json(overview.sales);
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get top selling features
router.get('/top-sales', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const topSales = await db.getTopSales(10);
        res.json(topSales);
    } catch (error) {
        console.error('Get top sales error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
