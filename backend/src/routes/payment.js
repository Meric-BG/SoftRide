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
            console.log(`Payment ${id} successful. Activating feature for user ${req.user.id}`);

            // Get payment details to create subscription
            const payments = await paymentRepo.findByUser(req.user.id);
            const payment = payments.find(p => p.payment_id === id);

            if (payment && payment.feature_id) {
                try {
                    // Get user's vehicle
                    const userRepo = require('../repositories/UserRepository');
                    const user = await userRepo.findById(req.user.id);

                    if (user && user.vehicles && user.vehicles.length > 0) {
                        const vehicleVin = user.vehicles[0].vin;

                        // Get feature details
                        const feature = await featureRepo.findById(payment.feature_id);

                        if (feature) {
                            // Create subscription
                            const subscription = {
                                user_id: req.user.id,
                                vehicle_vin: vehicleVin,
                                feature_id: payment.feature_id,
                                status: 'active',
                                start_date: new Date().toISOString(),
                                expires_at: feature.pricing_model === 'subscription'
                                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                                    : null,
                                auto_renew: feature.pricing_model === 'subscription'
                            };

                            const createdSub = await featureRepo.createSubscription(subscription);

                            // Update payment with subscription_id
                            const { run: runDb } = require('../config/db');
                            runDb('UPDATE payments SET subscription_id = ? WHERE payment_id = ?', [createdSub.subscription_id, id]);

                            // Create feature activation
                            const activation = {
                                subscription_id: createdSub.subscription_id,
                                vehicle_vin: vehicleVin,
                                feature_id: payment.feature_id,
                                activation_status: 'ACTIVE',
                                target_status: 'ACTIVE',
                                activation_request_time: new Date().toISOString(),
                                activation_start_time: new Date().toISOString(),
                                requested_by: req.user.id,
                                request_source: 'PAYMENT_PORTAL'
                            };

                            await featureRepo.createFeatureActivation(activation);

                            console.log(`✅ Subscription and activation created for payment ${id}`);
                        }
                    }
                } catch (err) {
                    console.error('Subscription activation failed:', err);
                    // Don't fail the payment, just log the error
                }
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
