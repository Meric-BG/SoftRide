const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/supabaseDB');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all updates
router.get('/', async (req, res) => {
    try {
        const updates = await db.getFOTACampaigns();
        res.json(updates);
    } catch (error) {
        console.error('Get updates error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get available updates for a vehicle
router.get('/available/:vehicleId', authMiddleware, async (req, res) => {
    try {
        const vehicle = await db.getVehicleById(req.params.vehicleId);

        if (!vehicle) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        const allCampaigns = await db.getFOTACampaigns();

        // Filter campaigns that are newer than current vehicle version
        // For simplicity, we'll show all COMPLETED campaigns
        const available = allCampaigns.filter(c => c.status === 'COMPLETED');

        res.json(available);
    } catch (error) {
        console.error('Get available updates error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Install update on vehicle
router.post('/install/:vehicleId/:campaignId', authMiddleware, async (req, res) => {
    try {
        const { vehicleId, campaignId } = req.params;

        const vehicle = await db.getVehicleById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        const campaign = await db.getFOTACampaignById(campaignId);
        if (!campaign) {
            return res.status(404).json({ error: 'Mise à jour non trouvée' });
        }

        // Simulate installation (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract version from campaign name (e.g., "Update to 2.5.0")
        const versionMatch = campaign.campaign_name.match(/(\d+\.\d+\.\d+)/);
        const newVersion = versionMatch ? versionMatch[1] : '2.5.0';

        // Update vehicle OS version
        await db.updateVehicle(vehicleId, {
            // Note: osVersion doesn't exist in schema, using a custom field
            // In production, you'd update the ECU firmware versions
            last_connected: new Date().toISOString()
        });

        res.json({
            success: true,
            message: `Mise à jour vers ${newVersion} installée avec succès`,
            newVersion
        });
    } catch (error) {
        console.error('Install update error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Deploy update (Admin only)
router.post('/deploy', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { version, notes, targetVehicles } = req.body;

        if (!version || !notes) {
            return res.status(400).json({ error: 'version et notes requis' });
        }

        const allVehicles = await db.getVehicles();

        const campaign = {
            campaign_id: uuidv4(),
            campaign_name: `Update to ${version}`,
            description: notes,
            campaign_type: 'SCHEDULED',
            priority: 3,
            rollout_strategy: 'PHASED',
            scheduled_start: new Date().toISOString(),
            status: 'COMPLETED', // For demo, mark as completed immediately
            created_by: req.user.id,
            created_at: new Date().toISOString()
        };

        const created = await db.createFOTACampaign(campaign);

        res.status(201).json({
            success: true,
            campaign: created,
            message: `Mise à jour ${version} déployée vers ${targetVehicles || allVehicles.length} véhicules`
        });
    } catch (error) {
        console.error('Deploy update error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get OS fragmentation stats (Admin only)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const vehicles = await db.getVehicles();
        const campaigns = await db.getFOTACampaigns();

        // For demo purposes, create mock stats
        const stats = {
            total: vehicles.length,
            versions: [
                { version: '2.4.1', count: Math.floor(vehicles.length * 0.65), percentage: '65' },
                { version: '2.4.0', count: Math.floor(vehicles.length * 0.25), percentage: '25' },
                { version: '2.3.x', count: Math.floor(vehicles.length * 0.10), percentage: '10' }
            ]
        };

        res.json(stats);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
