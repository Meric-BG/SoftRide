const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userRepo = require('../repositories/UserRepository');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

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

        // Pour la démo, on accepte "password" comme mot de passe
        const isValid = password === 'password' || await bcrypt.compare(password, user.password_hash);

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
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const existingUser = await userRepo.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [firstName, ...lastNameParts] = name.split(' ');

        const newUser = {
            user_id: uuidv4(),
            email,
            password_hash: hashedPassword,
            first_name: firstName,
            last_name: lastNameParts.join(' ') || '',
            account_status: 'ACTIVE',
            verified_email: false
        };

        await userRepo.create(newUser);

        const token = jwt.sign(
            { id: newUser.user_id, email: newUser.email, role: 'user' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser.user_id,
                email: newUser.email,
                name: `${newUser.first_name} ${newUser.last_name}`,
                role: 'user'
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
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
            phone_number: user.phone_number,
            role: user.email === 'admin@kemet.com' ? 'admin' : 'user',
            vehicles: user.vehicles && user.vehicles.length > 0 ? user.vehicles[0] : null
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
