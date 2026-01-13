const express = require('express');
const vehicleRepo = require('../repositories/VehicleRepository');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get vehicle info
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const vehicle = await vehicleRepo.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        res.json(vehicle);
    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Lock/Unlock vehicle
router.post('/:id/lock', authMiddleware, async (req, res) => {
    try {
        const { locked } = req.body;
        const vehicle = await vehicleRepo.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        const updated = await vehicleRepo.update(req.params.id, {
            locked: locked !== undefined ? locked : !vehicle.locked
        });

        res.json({ success: true, vehicle: updated });
    } catch (error) {
        console.error('Lock vehicle error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Climate control
router.post('/:id/climate', authMiddleware, async (req, res) => {
    try {
        const { climate } = req.body;
        const vehicle = await vehicleRepo.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        const updated = await vehicleRepo.update(req.params.id, {
            climate: climate !== undefined ? climate : !vehicle.climate
        });

        res.json({ success: true, vehicle: updated });
    } catch (error) {
        console.error('Climate control error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Charge port control
router.post('/:id/charge', authMiddleware, async (req, res) => {
    try {
        const { charging } = req.body;
        const vehicle = await vehicleRepo.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ error: 'Véhicule non trouvé' });
        }

        const updated = await vehicleRepo.update(req.params.id, {
            charging: charging !== undefined ? charging : !vehicle.charging
        });

        res.json({ success: true, vehicle: updated });
    } catch (error) {
        console.error('Charge control error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Get vehicle features
router.get('/:id/features', authMiddleware, async (req, res) => {
    try {
        const features = await vehicleRepo.getActiveFeatures(req.params.id);
        res.json(features);
    } catch (error) {
        console.error('Get features error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
