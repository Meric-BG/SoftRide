const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/supabaseDB');
const { authMiddleware } = require('../middleware/auth');
const { getFedaPayService } = require('../services/fedaPay');

const router = express.Router();

/**
 * Initiate FedaPay payment (Checkout)
 * POST /api/payments/fedapay/checkout
 */
router.post('/fedapay/checkout', async (req, res) => {
    try {
        const { featureId, vehicleId, paymentData } = req.body;
        // UserID management for testing
        const userId = req.body.userId || 'USR001';

        // Validate input
        if (!featureId || !vehicleId) {
            return res.status(400).json({
                error: 'featureId et vehicleId requis'
            });
        }

        // Get feature details
        const feature = await db.getFeatureById(featureId);
        if (!feature) {
            return res.status(404).json({ error: 'Feature non trouvée' });
        }

        // Initialize FedaPay service
        const fedaPayService = getFedaPayService();

        // Create transaction record
        const transactionId = `TXN_${Date.now()}_${uuidv4().substring(0, 8)}`;

        const transaction = {
            transaction_id: transactionId,
            user_id: userId,
            vehicle_id: vehicleId,
            transaction_type: 'PURCHASE',
            amount: feature.base_price,
            currency: feature.currency || 'XOF',
            payment_method: 'FEDAPAY', // Payment method is now FEDAPAY
            payment_status: 'PENDING',
            items: JSON.stringify([{
                feature_id: featureId,
                feature_name: feature.feature_name
            }]),
        };

        await db.createTransaction(transaction);

        // Prepare FedaPay transaction data
        const fedaPayData = {
            description: `Achat ${feature.feature_name}`,
            amount: feature.base_price,
            currency: feature.currency || 'XOF',
            callbackUrl: `${process.env.FEDAPAY_CALLBACK_URL || 'http://localhost:5000/api/payments/fedapay/callback'}`,
            customer: {
                firstname: paymentData.firstname || 'Client',
                lastname: paymentData.lastname || 'Kemet',
                email: paymentData.email || 'client@kemet.com',
                phoneNumber: paymentData.phoneNumber // Phone number from frontend
            }
        };

        // Create FedaPay transaction and get URL
        const result = await fedaPayService.createTransaction(fedaPayData);

        // Update transaction with FedaPay ID
        await db.updateTransaction(transactionId, {
            payment_gateway_transaction_id: result.transactionId,
            payment_gateway_response: JSON.stringify({ token: result.token, url: result.url })
        });

        res.json({
            success: true,
            transactionId,
            paymentUrl: result.url,
            message: 'Redirection vers FedaPay...'
        });

    } catch (error) {
        console.error('FedaPay checkout error:', error);
        res.status(500).json({
            error: 'Erreur lors de l\'initialisation du paiement',
            details: error.message
        });
    }
});

/**
 * Check payment status (Can be used by frontend polling if needed, or redirect return)
 * GET /api/payments/fedapay/status/:transactionId
 */
router.get('/fedapay/status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;

        // Get transaction from database
        const transaction = await db.getTransactionById(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction non trouvée' });
        }

        // Initialize FedaPay service
        const fedaPayService = getFedaPayService();

        if (transaction.payment_gateway_transaction_id) {
            const fedaTransaction = await fedaPayService.verifyTransaction(transaction.payment_gateway_transaction_id);

            // Update status if changed
            let newStatus = transaction.payment_status;
            if (fedaTransaction.status === 'approved') {
                newStatus = 'COMPLETED';
            } else if (fedaTransaction.status === 'canceled' || fedaTransaction.status === 'declined') {
                newStatus = 'FAILED';
            }

            if (newStatus !== transaction.payment_status) {
                await db.updateTransaction(transactionId, {
                    payment_status: newStatus,
                    completed_at: newStatus === 'COMPLETED' ? new Date().toISOString() : null
                });

                // Trigger activation if newly completed
                if (newStatus === 'COMPLETED') {
                    await handleFeatureActivation(transaction);
                }
            }

            return res.json({
                transactionId,
                status: newStatus,
                details: fedaTransaction
            });
        }

        res.json({
            transactionId,
            status: transaction.payment_status
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification' });
    }
});

/**
 * FedaPay Webhook / Callback
 * POST /api/payments/fedapay/callback
 */
router.post('/fedapay/callback', async (req, res) => {
    try {
        const event = req.body;
        console.log('FedaPay webhook received:', event);

        if (event.name === 'transaction.approved') {
            const transactionId = event.entity.id;

            // Find transaction by gateway ID
            // Ideally we should have a method getTransactionByGatewayId, but we can search or assuming custom field usage
            // For now, let's assume we can map it back or rely on Status Check.
            // But wait, the transaction created in DB has 'payment_gateway_transaction_id' = fedapay ID.
            // So we need: db.getTransactionByGatewayId(transactionId)

            // ... implementation pending DB method ...
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Callback error:', error);
        res.sendStatus(500);
    }
});

// Helper function for activation
async function handleFeatureActivation(transaction) {
    const items = JSON.parse(transaction.items);
    const featureId = items[0]?.feature_id;

    if (featureId) {
        const feature = await db.getFeatureById(featureId);

        // Create subscription
        const subscription = {
            subscription_id: uuidv4(),
            user_id: transaction.user_id,
            vehicle_id: transaction.vehicle_id,
            feature_id: featureId,
            subscription_plan: feature.pricing_model === 'SUBSCRIPTION' ? 'MONTHLY' : 'LIFETIME',
            start_date: new Date().toISOString().split('T')[0],
            end_date: feature.pricing_model === 'SUBSCRIPTION'
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                : new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'ACTIVE',
            price: transaction.amount,
            currency: transaction.currency,
            transaction_id: transaction.transaction_id,
        };

        const createdSub = await db.createSubscription(subscription);

        // Create activation
        await db.createFeatureActivation({
            activation_id: uuidv4(),
            subscription_id: createdSub.subscription_id,
            vehicle_id: transaction.vehicle_id,
            feature_id: featureId,
            activation_status: 'ACTIVE',
            activation_request_time: new Date().toISOString(),
            activation_start_time: new Date().toISOString(),
            activation_end_time: new Date().toISOString(),
            requested_by: transaction.user_id,
            request_source: 'WEB_PORTAL',
        });
        console.log(`Feature ${featureId} activated for vehicle ${transaction.vehicle_id}`);
    }
}

/**
 * Mock Payment Page (For testing FedaPay redirect)
 * GET /api/payments/fedapay/mock-page
 */
/**
 * Mock Payment Page (For testing FedaPay redirect)
 * GET /api/payments/fedapay/mock-page
 */
router.get('/fedapay/mock-page', (req, res) => {
    const { token, amount, transactionId } = req.query;
    const formattedAmount = parseInt(amount).toLocaleString('fr-FR');

    res.send(`
        <html>
            <head>
                <title>FedaPay Mock Payment</title>
                <style>
                    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5; }
                    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; width: 100%; }
                    .btn { background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 20px; width: 100%; transition: background 0.3s; }
                    .btn:hover { background: #219150; }
                    .details { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: left; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1 style="color: #2c3e50;">FedaPay <span style="font-size: 0.6em; background: #f1c40f; padding: 2px 6px; border-radius: 4px; color: #fff;">TEST</span></h1>
                    <div class="details">
                        <p><strong>Montant:</strong> ${formattedAmount} XOF</p>
                        <p><strong>Référence:</strong> ${transactionId}</p>
                    </div>
                    
                    <button id="confirmBtn" class="btn" onclick="confirmPayment()">Confirmer le paiement</button>
                    
                    <p style="margin-top: 20px; font-size: 12px; color: #666; line-height: 1.4;">
                        Ceci est une simulation locale car aucune clé API FedaPay valide n'est configurée.
                    </p>
                </div>

                <script>
                    async function confirmPayment() {
                        const btn = document.getElementById('confirmBtn');
                        btn.disabled = true;
                        btn.innerText = 'Traitement...';

                        try {
                            // Simulate Webhook Call
                            const response = await fetch('/api/payments/fedapay/callback', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    name: 'transaction.approved',
                                    entity: {
                                        id: '${transactionId}' // This matches what we stored in DB as payment_gateway_transaction_id
                                    }
                                })
                            });

                            if (response.ok) {
                                btn.style.background = '#2ecc71';
                                btn.innerText = 'Succès ! Redirection...';
                                setTimeout(() => {
                                    window.location.href = 'http://localhost:3000/store?payment=success';
                                }, 1000);
                            } else {
                                throw new Error('Erreur callback');
                            }
                        } catch (e) {
                            console.error(e);
                            btn.style.background = '#e74c3c';
                            btn.innerText = 'Erreur lors de la confirmation';
                            btn.disabled = false;
                        }
                    }
                </script>
            </body>
        </html>
    `);
});

module.exports = router;
