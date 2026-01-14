const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userRepo = require('../repositories/UserRepository');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Helper to generate a unique VIN
const generateVIN = (brand) => {
    const prefix = 'KMT-VIN';
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const year = new Date().getFullYear();
    const suffix = 'AD';
    return `${prefix}-${randomHex}-${timestamp}-${year}-${suffix}`;
};

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        const user = await userRepo.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        // Verify hashed password
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        const userRole = user.email === 'admin@kemet.com' ? 'admin' : 'user';

        const token = jwt.sign(
            { id: user.user_id, email: user.email, role: userRole },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.user_id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
                role: userRole
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, brand, model, phone } = req.body;

        if (!email || !password || !name || !brand || !model) {
            return res.status(400).json({ error: 'Tous les champs sont requis (nom, email, mot de passe, véhicule)' });
        }

        const existingUser = await userRepo.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create User
        const newUser = {
            email,
            password_hash: hashedPassword,
            first_name: firstName,
            last_name: lastName,
            phone_number: phone || null,
            account_status: 'ACTIVE',
            verified_email: false
        };

        const createdUser = await userRepo.create(newUser);

        // Generate and Create Vehicle (VIN as PK)
        const vin = generateVIN(brand);
        const newVehicle = {
            vin,
            owner_id: createdUser.user_id,
            brand_name: brand,
            model_name: model,
            battery_level: 100,
            range_km: 450,
            os_version: '1.0.0',
            location_name: 'Dakar',
            is_locked: true
        };

        const vehicleRepo = require('../repositories/VehicleRepository');
        await vehicleRepo.create(newVehicle);

        const token = jwt.sign(
            { id: createdUser.user_id, email: createdUser.email, role: 'user' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: createdUser.user_id,
                email: createdUser.email,
                name: `${createdUser.first_name} ${createdUser.last_name}`,
                role: 'user',
                vin: vin
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription: ' + error.message });
    }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await userRepo.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json({
            id: user.user_id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            firstName: user.first_name,
            lastName: user.last_name,
            phone_number: user.phone_number,
            role: user.email === 'admin@kemet.com' ? 'admin' : 'user',
            vehicles: user.vehicles || null
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Update phone number
router.put('/phone', authMiddleware, async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Numéro de téléphone requis' });
        }

        const updated = await userRepo.updatePhone(req.user.id, phone);
        res.json({
            success: true,
            user: {
                id: updated.user_id,
                email: updated.email,
                name: `${updated.first_name} ${updated.last_name}`,
                phone_number: updated.phone_number
            }
        });
    } catch (error) {
        console.error('Update phone error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du téléphone' });
    }
});

// Update email
router.put('/email', authMiddleware, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email requis' });
        }

        const updated = await userRepo.updateEmail(req.user.id, email);
        res.json({
            success: true,
            user: {
                id: updated.user_id,
                email: updated.email,
                name: `${updated.first_name} ${updated.last_name}`,
                phone_number: updated.phone_number
            }
        });
    } catch (error) {
        console.error('Update email error:', error);
        res.status(500).json({ error: error.message || 'Erreur lors de la mise à jour de l\'email' });
    }
});

module.exports = router;
