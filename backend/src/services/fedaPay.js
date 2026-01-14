const { FedaPay, Transaction } = require('fedapay');

class FedaPayService {
    constructor() {
        this.apiKey = process.env.FEDAPAY_SECRET_KEY || 'sk_sandbox_1234567890'; // Default for testing
        this.environment = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';

        // Mock Mode Detection
        this.mockMode = this.apiKey.includes('your_key_here') || this.apiKey === 'sk_sandbox_1234567890';

        if (!this.mockMode) {
            // Configure FedaPay
            FedaPay.setApiKey(this.apiKey);
            FedaPay.setEnvironment(this.environment);
        } else {
            console.log('⚠️ FedaPay Service running in MOCK MODE');
        }
    }

    /**
     * Create a transaction and generate payment URL
     * @param {Object} data Transaction data
     * @returns {Promise<Object>} Token and URL
     */
    async createTransaction(data) {
        if (this.mockMode) {
            console.log('[MOCK] FedaPay Transaction Created:', data.amount, data.currency);
            const mockToken = 'mock_token_' + Date.now();
            const mockTxId = 'mock_tx_' + Date.now();
            return {
                token: mockToken,
                url: `http://localhost:5000/api/payments/fedapay/mock-page?token=${mockToken}&amount=${data.amount}&transactionId=${mockTxId}`,
                transactionId: mockTxId
            };
        }

        try {
            const transaction = await Transaction.create({
                description: data.description,
                amount: data.amount,
                currency: { code: data.currency || 'XOF' },
                callback_url: data.callbackUrl || process.env.FEDAPAY_CALLBACK_URL,
                customer: {
                    firstname: data.customer.firstname || 'Client',
                    lastname: data.customer.lastname || 'Kemet',
                    email: data.customer.email,
                    phone_number: {
                        number: data.customer.phoneNumber,
                        country: 'bj' // Benin by default
                    }
                }
            });

            const token = await transaction.generateToken();

            return {
                token: token.token,
                url: token.url,
                transactionId: transaction.id
            };
        } catch (error) {
            console.error('FedaPay transaction error:', error);
            throw new Error('Failed to create FedaPay transaction: ' + error.message);
        }
    }

    /**
     * Verify transaction status
     * @param {string|number} transactionId 
     */
    async verifyTransaction(transactionId) {
        if (this.mockMode) {
            return { status: 'approved' };
        }

        try {
            const transaction = await Transaction.retrieve(transactionId);
            return transaction;
        } catch (error) {
            console.error('FedaPay verify error:', error);
            throw new Error('Failed to verify FedaPay transaction');
        }
    }
}

// Singleton instance
let fedaPayService = null;

function getFedaPayService() {
    if (!fedaPayService) {
        fedaPayService = new FedaPayService();
    }
    return fedaPayService;
}

module.exports = { FedaPayService, getFedaPayService };
