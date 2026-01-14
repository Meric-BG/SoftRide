const express = require('express');
const { v4: uuidv4 } = require('uuid');
const paymentRepo = require('../repositories/PaymentRepository');
const featureRepo = require('../repositories/FeatureRepository');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create a new payment transaction
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { feature_id, operator, phone_number, amount } = req.body;

        if (!feature_id || !operator || !phone_number || !amount) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        const payment = {
            payment_id: uuidv4(),
            user_id: req.user.id,
            feature_id,
            operator,
            phone_number,
            amount,
            status: 'PENDING',
            created_at: new Date().toISOString()
        };

        const result = await paymentRepo.create(payment);
        res.status(201).json(result);
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ error: 'Erreur lors de la création du paiement' });
    }
});

// Simulate Mobile Money Validation
router.post('/:id/simulate', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { force_status } = req.body; // Allows forcing PAID or FAILED for testing

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const status = force_status || (Math.random() > 0.1 ? 'PAID' : 'FAILED');

        const updated = await paymentRepo.updateStatus(id, status);

        if (status === 'PAID') {
            // In a real app, we would also create the subscription here
            console.log(`Payment ${id} successful. Activating feature for user ${req.user.id}`);

            // Fetch payment details to get feature_id
            // This is a simplified simulation
            try {
                // If we had the feature_id, we would call featureRepo.createSubscription
                // For now, the simulation just updates the payment status
            } catch (err) {
                console.error('Subscription activation failed:', err);
            }
        }

        res.json({ success: status === 'PAID', status, payment: updated });
    } catch (error) {
        console.error('Simulate payment error:', error);
        res.status(500).json({ error: 'Erreur lors de la simulation du paiement' });
    }
});

// Get user payment history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const payments = await paymentRepo.findByUser(req.user.id);
        res.json(payments);
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
    }
});

module.exports = router;
