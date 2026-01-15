const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fotaRepo = require('../repositories/FotaRepository');
const vehicleRepo = require('../repositories/VehicleRepository');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all updates
router.get('/', async (req, res) => {
    try {
        const updates = await fotaRepo.findAllCampaigns();
        res.json(updates);
    } catch (error) {
        console.error('Get updates error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get available updates for a vehicle
router.get('/available/:vehicleId', authMiddleware, async (req, res) => {
    try {
        const vehicle = await vehicleRepo.findById(req.params.vehicleId);

        if (!vehicle) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        const allCampaigns = await fotaRepo.findAllCampaigns();

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

        const vehicle = await vehicleRepo.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        const campaign = await fotaRepo.findCampaignById(campaignId);
        if (!campaign) {
            return res.status(404).json({ error: 'Mise à jour non trouvée' });
        }

        // Simulate installation (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Extract version from campaign name (e.g., "Update to 2.5.0")
        const versionMatch = campaign.campaign_name.match(/(\d+\.\d+\.\d+)/);
        const newVersion = versionMatch ? versionMatch[1] : '2.5.0';

        // Update vehicle OS version
        await vehicleRepo.update(vehicleId, {
            last_seen: new Date().toISOString()
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

        // Fetch all vehicles to count target fleet
        const allVehicles = await vehicleRepo.findAll();
        const targetCount = allVehicles.length;

        const campaign = {
            campaign_id: uuidv4(),
            campaign_name: `Update to ${version}`,
            version,
            description: notes,
            campaign_type: 'SCHEDULED',
            priority: 3,
            rollout_strategy: 'PHASED',
            scheduled_start: new Date().toISOString(),
            status: 'COMPLETED', // For demo, mark as completed immediately
            created_by: req.user.id,
            created_at: new Date().toISOString()
        };

        const created = await fotaRepo.createCampaign(campaign);

        // Broadcast to all connected clients (e.g., 3D Map)
        const systemEvents = require('../services/SystemEvents');
        systemEvents.broadcast('TECH_UPDATE', {
            version,
            message: `Mise à jour ${version} publiée !`,
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            campaign: created,
            message: `Mise à jour ${version} déployée vers ${targetVehicles || targetCount} véhicules`
        });
    } catch (error) {
        console.error('Deploy update error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get OS fragmentation stats (Admin only)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // Stats omitted for MVP speed
        const vehicles = [];
        const campaigns = [];

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
